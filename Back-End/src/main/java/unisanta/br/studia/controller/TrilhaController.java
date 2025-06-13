package unisanta.br.StudIA.controller;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import unisanta.br.StudIA.Model.Selecao;
import unisanta.br.StudIA.Model.Users;
import unisanta.br.StudIA.service.OpenAIService;
import unisanta.br.StudIA.service.SelecaoService;
import unisanta.br.StudIA.service.TrilhaService;
import unisanta.br.StudIA.service.UserService;

import java.time.LocalDate;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/")
public class TrilhaController {
    private static final Logger logger = LoggerFactory.getLogger(TrilhaController.class);

    private final UserService userService;
    private final SelecaoService selecaoService;
    private final OpenAIService openAIService;
    private final TrilhaService trilhaService;

    public TrilhaController(OpenAIService openAIService, UserService userService, SelecaoService selecaoService, TrilhaService trilhaService) {
        this.userService = userService;
        this.selecaoService = selecaoService;
        this.openAIService = openAIService;
        this.trilhaService = trilhaService;
    }

    @GetMapping("/trilha/{id}")
    @Cacheable(value = "trilhas", key = "#id")
    public Mono<ResponseEntity<?>> generateTrilha(@PathVariable Long id) {
        logger.info("Recebida requisição para gerar trilha para userID: {}", id);

        Users user = userService.getUserById(id);
        if (user == null) {
            logger.warn("Usuário não encontrado para userID: {}", id);
            return Mono.just(new ResponseEntity<>(Map.of("message", "Usuário não encontrado"), HttpStatus.NOT_FOUND));
        }

        Selecao selecao = selecaoService.getSelecaoByUserId(id);
        if (selecao == null) {
            logger.warn("Seleção não encontrada para userID: {}", id);
            return Mono.just(new ResponseEntity<>(Map.of("message", "Seleção não encontrada para o usuário"), HttpStatus.NOT_FOUND));
        }

        String trilhaSalva = trilhaService.getTrilhaByUserId(id);
        if (trilhaSalva != null) {
            logger.info("Trilha existente retornada para userID: {}", id);
            try {
                Object parsedResponse = JSON.parseObject(trilhaSalva);
                return Mono.just(ResponseEntity.ok(parsedResponse));
            } catch (Exception e) {
                logger.error("Erro ao parsear trilha salva para userID: {}", id, e);
                return Mono.just(new ResponseEntity<>(Map.of("message", "Erro ao processar trilha salva: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR));
            }
        }

        String conteudo = String.join(", ", selecao.getSelecoes());
        String prompt = buildPrompt(conteudo);

        return openAIService.gerarResposta(prompt)
                .flatMap(response -> {
                    try {
                        logger.debug("Resposta bruta da API para userID {}: {}", id, response);

                        if (response.contains("Erro")) {
                            throw new IllegalStateException("API retornou um erro: " + response);
                        }

                        Pattern jsonPattern = Pattern.compile("(?s)```json\\n(.*?)\\n```");
                        Matcher matcher = jsonPattern.matcher(response);
                        String jsonString;

                        if (matcher.find()) {
                            jsonString = matcher.group(1).trim();
                        } else {
                            jsonString = response.trim();
                        }

                        if (!jsonString.startsWith("{")) {
                            throw new IllegalStateException("Resposta não começa com um objeto JSON: " + jsonString);
                        }

                        try {
                            JSON.parseObject(jsonString);
                        } catch (JSONException e) {
                            throw new IllegalStateException("JSON inválido ou incompleto: " + jsonString, e);
                        }

                        Object parsedResponse = JSON.parseObject(jsonString);
                        if (parsedResponse == null) {
                            throw new IllegalStateException("JSON parseado resultou em null: " + jsonString);
                        }

                        trilhaService.saveTrilha(id, jsonString);
                        logger.info("Trilha gerada e salva para userID: {}", id);
                        return Mono.just(ResponseEntity.ok(parsedResponse));
                    } catch (Exception e) {
                        logger.error("Erro ao processar resposta da IA para userID: {}", id, e);
                        return Mono.just(new ResponseEntity<>(Map.of("message", "Erro ao processar resposta da IA: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR));
                    }
                })
                .onErrorResume(e -> {
                    logger.error("Erro ao gerar trilha para userID: {}", id, e);
                    return Mono.just(new ResponseEntity<>(Map.of("message", "Erro ao gerar a trilha: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR));
                });
    }

    private String buildPrompt(String conteudo) {
        LocalDate startDate = LocalDate.now();
        String startDateStr = startDate.toString();

        return String.format("""
                Com base nas seleções fornecidas: %s, gere um roadmap de aprendizado personalizado em formato JSON puro, sem Markdown, texto adicional, comentários ou qualquer formatação fora do JSON.
                O roadmap deve ser uma trilha de aprendizado estruturada como uma árvore de conhecimento, com progressão lógica e hierárquica, no estilo do roadmap.sh. A estrutura esperada é:
                {
                  "trilha": {
                    "titulo": "Nome da trilha derivado das seleções (exemplo: Trilha de DevOps)",
                    "dataInicio": "Data de início no formato YYYY-MM-DD (exemplo: 2025-05-04)",
                    "prazoEstimado": "Data calculada como dataInicio + 7 dias no formato YYYY-MM-DD",
                    "nos": [
                      {
                        "id": "identificador-unico",
                        "titulo": "Nome do nó principal (exemplo: Version Control Systems)",
                        "descricao": "Descrição concisa do nó (máximo 100 caracteres)",
                        "dependencias": ["ids de nós que devem ser concluídos antes"],
                        "tipo": "obrigatorio | recomendado | alternativo",
                        "subnos": [
                          {
                            "id": "identificador-unico-subno",
                            "titulo": "Nome do subnó (exemplo: Git)",
                            "descricao": "Descrição concisa do subnó (máximo 100 caracteres)",
                            "dependencias": ["ids de nós ou subnós que devem ser concluídos antes"],
                            "tipo": "obrigatorio | recomendado | alternativo",
                            "tempoEstimado": número inteiro representando horas estimadas para conclusão,
                            "dificuldade": "iniciante | intermediário | avançado",
                            "recomendado": true | false
                          }
                        ]
                      }
                    ]
                  }
                }
                Regras obrigatórias:
                - O JSON deve ser válido, bem formado e seguir rigorosamente a estrutura acima.
                - IDs devem ser únicos, no formato "nome-descritivo-numero" (exemplo: "vcs-1", "git-1.1").
                - O campo "dependencias" deve conter IDs válidos de nós ou subnós que são pré-requisitos, ou uma lista vazia se não houver dependências.
                - O campo "tipo" indica a categoria do nó ou subnó: "obrigatorio" para tópicos essenciais (amarelos no roadmap.sh), "recomendado" para opções sugeridas (roxas), ou "alternativo" para opções alternativas (verdes).
                - O campo "recomendado" (true/false) em subnós indica se é a escolha preferida dentro de um grupo de alternativas (true para subnós roxos no roadmap.sh).
                - O campo "tempoEstimado" é obrigatório para subnós, com valores inteiros entre 1 e 100 horas.
                - O campo "dificuldade" é obrigatório para subnós, com valores restritos a "iniciante", "intermediário" ou "avançado".
                - O campo "dataInicio" deve ser preenchido com a data fornecida (%s) no formato YYYY-MM-DD.
                - O campo "prazoEstimado" deve ser calculado como dataInicio + 7 dias, usando (%s) no formato YYYY-MM-DD.
                - O título da trilha deve ser claro, conciso e refletir as seleções (exemplo: "Trilha de %s").
                - A progressão deve ser lógica: tópicos fundamentais precedem tópicos intermediários e avançados.
                - Inclua no mínimo 5 nós principais e 2 subnós por nó, a menos que as seleções restrinjam o escopo.
                - Cada nó e subnó deve ter descrições curtas e objetivas (máximo 100 caracteres).
                Regras para casos especiais:
                - Se as seleções forem vagas ou insuficientes, gere uma trilha genérica baseada no tema mais próximo (exemplo: "DevOps" para seleções relacionadas a operações).
                - Se as seleções indicarem um nível de conhecimento (iniciante, intermediário, avançado), ajuste a dificuldade dos subnós para refletir esse nível.
                - Se a data fornecida (%s) for inválida, use a data atual (2025-05-04) no formato YYYY-MM-DD.
                - Para nós com múltiplas opções (como "Learn a Programming Language"), inclua subnós com tipos "recomendado" e "alternativo", marcando apenas um subnó como "recomendado": true.
                Retorne apenas o JSON completo, sem qualquer outro conteúdo.
                """, conteudo, startDateStr, startDate.plusDays(7).toString(), startDateStr, conteudo);
    }
}
