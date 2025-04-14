package unisanta.br.StudIA.controller;

import com.alibaba.fastjson.JSON;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import unisanta.br.StudIA.Model.Selecao;
import unisanta.br.StudIA.Model.Users;
import unisanta.br.StudIA.dto.SelecaoDTO;
import unisanta.br.StudIA.service.OpenAIService;
import unisanta.br.StudIA.service.SelecaoService;
import unisanta.br.StudIA.service.UserService;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/")
public class roadmapController {

    private static final Logger logger = LoggerFactory.getLogger(roadmapController.class);

    private final OpenAIService openAIService;
    private final UserService userService;
    private final SelecaoService selecaoService;

    public roadmapController(OpenAIService openAIService, UserService userService, SelecaoService selecaoService) {
        this.openAIService = openAIService;
        this.userService = userService;
        this.selecaoService = selecaoService;
    }

    @PostMapping("/roadmap")
    public ResponseEntity<Map<String, Object>> createRoadmap(@Valid @RequestBody SelecaoDTO selecaoDTO) {
        try {
            logger.info("Recebida requisição para criar roadmap: {}", selecaoDTO);

            if (selecaoDTO.userID() == null) {
                logger.warn("userID nulo recebido");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "userID é obrigatório"));
            }

            Optional<Users> optionalUser = Optional.ofNullable(userService.getUserById(selecaoDTO.userID()));
            if (optionalUser.isEmpty()) {
                logger.warn("Usuário não encontrado para userID: {}", selecaoDTO.userID());
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Usuário não encontrado"));
            }
            Users user = optionalUser.get();

            if (selecaoDTO.selecoes() == null || selecaoDTO.selecoes().isEmpty()) {
                logger.warn("Nenhuma seleção fornecida para userID: {}", selecaoDTO.userID());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Pelo menos uma seleção é obrigatória"));
            }

            Selecao selecao = selecaoDTO.mapearSelecao(user);
            selecaoService.saveSelecao(selecao);
            logger.info("Seleção salva com sucesso para userID: {}", selecaoDTO.userID());

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Roadmap criado com sucesso");
            response.put("usuario", selecao.getUsuario());
            response.put("itens", selecao.getSelecoes());

            return ResponseEntity.status(HttpStatus.OK).body(response);

        } catch (IllegalArgumentException e) {
            logger.error("Erro de validação ao processar roadmap: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Dados inválidos: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Erro interno ao processar roadmap para userID: {}", selecaoDTO.userID(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Erro interno no servidor: " + e.getMessage()));
        }
    }

    @GetMapping("/roadmap/{id}")
    @Cacheable(value = "roadmaps", key = "#id")
    public Mono<ResponseEntity<?>> generateRoadmap(@PathVariable Long id) {
        logger.info("Recebida requisição para gerar roadmap para userID: {}", id);

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

        String roadmapSalvo = selecao.getRoadmap();
        if (roadmapSalvo != null) {
            logger.info("Roadmap existente retornado para userID: {}", id);
            try {
                Object parsedResponse = JSON.parseArray(roadmapSalvo);
                return Mono.just(ResponseEntity.ok(parsedResponse));
            } catch (Exception e) {
                logger.error("Erro ao parsear roadmap salvo para userID: {}", id, e);
                return Mono.just(new ResponseEntity<>(Map.of("message", "Erro ao processar roadmap salvo: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR));
            }
        }

        String conteudo = String.join(", ", selecao.getSelecoes());
        String prompt = "Com base nas seguintes seleções: " + conteudo +
                ", crie um roadmap de estudos personalizado em formato JSON puro, sem Markdown, texto adicional ou comentários explicativos. " +
                "Siga as diretrizes abaixo: " +
                "1. **Estrutura do JSON:** " +
                "   - Retorne um array de objetos, onde cada objeto representa um tópico ou módulo de estudo, com os campos: " +
                "     - 'titulo': Nome do tópico ou módulo (string); " +
                "     - 'ordem': Número da sequência ideal de estudo (inteiro, começando em 1); " +
                "     - 'submodulos': Array de strings com subtemas ou divisões do tópico (ex.: 'Fundamentos', 'Estruturas de Dados' para 'Programação'); " +
                "     - 'cronograma': Array de objetos com: " +
                "         - 'dia': Data no formato 'YYYY-MM-DD', iniciando em " + LocalDate.now().toString() + " ou próximo dia útil; " +
                "         - 'horarioInicio': Horário de início no formato 'HH:MM' (ex.: '09:00'); " +
                "         - 'horarioFim': Horário de término no formato 'HH:MM' (ex.: '11:00'); " +
                "         - 'cargaHoraria': Duração em horas (inteiro, entre 1 e 3); " +
                "     - 'metodosEstudo': Array de strings com métodos sugeridos (ex.: 'resumos', 'exercícios práticos', 'flashcards', 'mapas mentais', 'projetos práticos'); " +
                "     - 'locaisEstudo': Array de strings com locais recomendados (ex.: 'casa', 'biblioteca', 'coworking'); " +
                "     - 'materiaisApoio': Array de objetos com: " +
                "         - 'tipo': Tipo do material (ex.: 'livro', 'vídeo-aula', 'curso online', 'artigo', 'documentação oficial'); " +
                "         - 'nome': Nome e fonte do material (ex.: 'Algoritmos - Cormen', 'Curso Python - Coursera'); " +
                "         - 'link': URL específica para acesso ao material (ex.: 'https://www.coursera.org/learn/python'); " +
                "     - 'dificuldades': Array de objetos com: " +
                "         - 'descricao': Descrição da dificuldade (string); " +
                "         - 'estrategia': Estratégia para superar (string); " +
                "     - 'proximosPassos': Array de strings com sugestões do que estudar após o tópico (ex.: 'Aprofundar em X', 'Iniciar Y'); " +
                "     - 'dicasAdicionais': Array de strings com dicas práticas (ex.: 'Pratique diariamente', 'Revise com amigos'); " +

                "2. **Cronograma Inteligente:** " +
                "   - Distribua as sessões de forma equilibrada, com no máximo 4 horas consecutivas por tópico e pausas entre blocos longos. " +
                "   - Priorize tópicos complexos para horários de maior foco (ex.: manhã, entre 08:00 e 12:00). " +
                "   - Organize tópicos interdependentes em sequência lógica (ex.: 'HTML' antes de 'CSS'). " +
                "   - Limite sessões diárias a 6 horas no total, respeitando entre 1 e 3 horas por sessão. " +

                "3. **Gestão de Datas:** " +
                "   - Inicie em " + LocalDate.now().toString() + ", ajustando para o próximo dia útil se for feriado ou fim de semana. " +
                "   - Evite horários noturnos (após 22:00), salvo se justificável pelo contexto do tópico. " +
                "   - Remaneje datas para evitar feriados conhecidos (ex.: Natal, Ano Novo) ou finais de semana, salvo se explicitamente solicitado. " +

                "4. **Técnicas de Aprendizado:** " +
                "   - Inclua métodos ativos para tópicos complexos (ex.: 'aprendizado baseado em projetos', 'ensino reverso', 'grupos de estudo'). " +
                "   - Adicione revisões espaçadas em 'metodosEstudo' para tópicos fundamentais (ex.: 'Revisão em 7 dias'). " +

                "5. **Detalhamento Extra:** " +
                "   - Gere submódulos detalhados para cada tópico, cobrindo aspectos essenciais e complementares. " +
                "   - Inclua links reais e confiáveis para materiais de apoio (ex.: sites oficiais, plataformas como Coursera, YouTube, ou GitHub). " +
                "   - Forneça próximos passos claros e dicas práticas para reforçar o aprendizado e manter a motivação. " +

                "6. **Saída:** " +
                "   - Retorne apenas o JSON puro, sem chaves externas (como 'roadmap') ou formatação adicional. " +
                "   - Garanta que o JSON seja válido, legível e manipulável por ferramentas como Postman ou aplicações frontend. " +

                "7. **Nível de Proficiência e Personalização:** " +
                "   - Adicione ao JSON, em cada tópico, um campo 'nivelDificuldade' (string: 'iniciante', 'intermediário', 'avançado') baseado na complexidade do conteúdo. " +
                "   - Inclua um campo 'tempoEstimadoTotal' (inteiro, em horas) para conclusão do tópico, considerando submódulos e revisões. " +
                "   - Adapte a quantidade de sessões e métodos de estudo ao nível de dificuldade (ex.: mais exercícios práticos para avançado, mais resumos para iniciante). " +

                "8. **Gamificação e Motivação:** " +
                "   - Adicione um campo 'metas' em cada tópico, um array de objetos com: " +
                "       - 'descricao': Descrição da meta (ex.: 'Completar 10 exercícios', 'Construir um projeto simples'); " +
                "       - 'recompensa': Sugestão de recompensa ao completar (ex.: 'Assistir um episódio de série', '15 min de pausa extra'). " +
                "   - Inclua um campo 'progresso' (inteiro, 0 a 100) inicializado em 0 para rastrear o avanço no frontend. " +

                "9. **Integração e Exportação:** " +
                "   - Adicione um campo 'exportavel' em cada tópico, com sugestões de formatos (ex.: ['PDF', 'Google Calendar', 'Trello']) para exportação do cronograma. " +
                "   - Inclua um campo 'notificacoes' (array de strings) com sugestões de lembretes (ex.: 'Iniciar estudo às 08:50', 'Revisão em 3 dias'). " +

                "10. **Acompanhamento e Feedback:** " +
                "   - Adicione um campo 'avaliacao' em cada tópico, um objeto com: " +
                "       - 'dificuldadePercebida': String inicializada como 'pendente' (atualizável pelo usuário: 'fácil', 'média', 'difícil'); " +
                "       - 'notas': Campo para observações do usuário (string, inicializada vazia); " +
                "   - Inclua um campo 'revisoesPlanejadas', um array de objetos com 'dia' (YYYY-MM-DD) e 'duracao' (inteiro, em horas) para revisões futuras.";




        return openAIService.gerarResposta(prompt)
                .flatMap(response -> {
                    try {
                        logger.debug("Resposta bruta da API Gemini para userID {}: {}", id, response);

                        // Verifica se a resposta contém um erro da API Gemini
                        if (response.contains("Erro ao processar resposta do Gemini") || response.contains("Erro ao chamar a API do Gemini")) {
                            throw new IllegalStateException("API Gemini retornou um erro: " + response);
                        }

                        // Tenta extrair JSON de um bloco Markdown
                        Pattern jsonPattern = Pattern.compile("(?s)```json\\n(.*?)\\n```");
                        Matcher matcher = jsonPattern.matcher(response);
                        String jsonString;

                        if (matcher.find()) {
                            jsonString = matcher.group(1);
                            logger.debug("JSON extraído de bloco Markdown para userID {}: {}", id, jsonString);
                        } else {
                            // Se não houver Markdown, usa a resposta direta
                            jsonString = response.trim();
                            logger.debug("Nenhum bloco Markdown encontrado, usando resposta direta para userID {}: {}", id, jsonString);
                        }

                        // Validação adicional para garantir que a string seja um JSON válido
                        if (!jsonString.startsWith("[") || !jsonString.endsWith("]")) {
                            throw new IllegalStateException("Resposta não é um array JSON válido: " + jsonString);
                        }

                        // Tenta parsear o JSON como um array
                        Object parsedResponse = JSON.parseArray(jsonString);
                        if (parsedResponse == null) {
                            throw new IllegalStateException("JSON parseado resultou em null: " + jsonString);
                        }

                        selecaoService.salvarRoadmap(id, jsonString);
                        logger.info("Roadmap gerado e salvo para userID: {}", id);
                        return Mono.just(ResponseEntity.ok(parsedResponse));
                    } catch (Exception e) {
                        logger.error("Erro ao processar resposta da IA para userID: {}", id, e);
                        Map<String, String> errorMap = Map.of("message", "Erro ao processar resposta da IA: " + e.getMessage());
                        return Mono.just(new ResponseEntity<>(errorMap, HttpStatus.INTERNAL_SERVER_ERROR));
                    }
                })
                .onErrorResume(e -> {
                    logger.error("Erro ao gerar roadmap para userID: {}", id, e);
                    Map<String, String> errorMap = Map.of("message", "Erro ao gerar o roadmap: " + e.getMessage());
                    return Mono.just(new ResponseEntity<>(errorMap, HttpStatus.INTERNAL_SERVER_ERROR));
                });
    }
}