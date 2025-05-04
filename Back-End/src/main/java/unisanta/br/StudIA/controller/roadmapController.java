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
                            jsonString = matcher.group(1);
                            logger.debug("JSON extraído de bloco Markdown para userID {}: {}", id, jsonString);
                        } else {
                            jsonString = response.trim();
                            logger.debug("Nenhum bloco Markdown encontrado, usando resposta direta para userID {}: {}", id, jsonString);
                        }

                        if (!jsonString.startsWith("[") || !jsonString.endsWith("]")) {
                            throw new IllegalStateException("Resposta não é um array JSON válido: " + jsonString);
                        }

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

    private String buildPrompt(String conteudo) {
        LocalDate startDate = LocalDate.now();
        return """
            Com base nas seleções: %s, gere um roadmap de estudos personalizado em formato JSON puro. Siga estas diretrizes:

            1. **Saída**:
               - Retorne SOMENTE um array JSON válido, começando com `[` e terminando com `]`.
               - NÃO inclua Markdown (ex.: ```json), texto introdutório, explicações, comentários ou qualquer conteúdo fora do JSON.
               - Garanta que o JSON seja completo, sem truncamento, e passe em validações de sintaxe.

            2. **Estrutura**:
               - Array com 5 módulos, cada um com:
                 - `titulo`: Nome do módulo (string).
                 - `ordem`: Sequência (inteiro, 1+).
                 - `submodulos`: 5-8 objetos com:
                   - `nome`: Nome do submódulo (string).
                   - `recursos`: 2-3 objetos com `tipo` (ex.: 'vídeo-aula', 'artigo'), `nome`, `link` (URL real).
                 - `cronograma`: Objetos com `dia` (YYYY-MM-DD, a partir de %s, dias úteis), `horarioInicio` (HH:MM), `horarioFim` (HH:MM), `cargaHoraria` (1-3h).
                 - `metodosEstudo`: Strings (ex.: 'resumos', 'projetos').
                 - `locaisEstudo`: Strings (ex.: 'casa', 'biblioteca').
                 - `materiaisApoio`: Objetos com `tipo`, `nome`, `link` (URL real).
                 - `dificuldades`: Objetos com `descricao`, `estrategia`.
                 - `proximosPassos`: Strings com próximos estudos.
                 - `dicasAdicionais`: Strings com dicas.
                 - `nivelDificuldade`: 'iniciante', 'intermediário' ou 'avançado'.
                 - `tempoEstimadoTotal`: Horas (inteiro).
                 - `metas`: Objetos com `descricao`, `recompensa`.
                 - `progresso`: 0.
                 - `exportavel`: Strings (ex.: 'PDF', 'Google Calendar').
                 - `notificacoes`: Strings (ex.: 'Iniciar às 08:50').
                 - `avaliacao`: Objeto com `dificuldadePercebida` ('pendente'), `notas` (vazio).
                 - `revisoesPlanejadas`: Objetos com `dia` (YYYY-MM-DD), `duracao` (horas).
                 - `pontuacao`: 0.
                 - `proximaTrilha` (apenas no último módulo): Objeto com `titulo`, `descricao` (completa), `topicosSugeridos`, `recursos` (objetos com `tipo`, `nome`, `link`).

            3. **Cronograma**:
               - Máximo 6h/dia, sessões de 1-3h, até 4h consecutivas.
               - Módulos complexos pela manhã (08:00-12:00).
               - Evite horários após 22:00 e feriados (ex.: 25/12, 01/01).

            4. **Aprendizado**:
               - Métodos ativos (ex.: 'projetos') para módulos complexos.
               - Revisões espaçadas (7, 14, 30 dias) em `revisoesPlanejadas`.

            5. **Gamificação**:
               - Metas com recompensas motivacionais.
               - `pontuacao` para rastrear progresso.

            6. **Exemplo**:
               [
                 {
                   "titulo": "Fundamentos de Programação",
                   "ordem": 1,
                   "submodulos": [
                     {
                       "nome": "Variáveis",
                       "recursos": [
                         {"tipo": "vídeo-aula", "nome": "Intro to Variables - freeCodeCamp", "link": "https://www.youtube.com/watch?v=8wW5s9fV_0s"}
                       ]
                     }
                   ],
                   "cronograma": [
                     {"dia": "%s", "horarioInicio": "09:00", "horarioFim": "11:00", "cargaHoraria": 2}
                   ],
                   "metodosEstudo": ["leitura", "exercícios"],
                   "locaisEstudo": ["casa"],
                   "materiaisApoio": [
                     {"tipo": "livro", "nome": "Eloquent JavaScript", "link": "https://eloquentjavascript.net/"}
                   ],
                   "dificuldades": [
                     {"descricao": "Sintaxe", "estrategia": "Prática diária"}
                   ],
                   "proximosPassos": ["Estudar funções"],
                   "dicasAdicionais": ["Pratique com exercícios"],
                   "nivelDificuldade": "iniciante",
                   "tempoEstimadoTotal": 20,
                   "metas": [
                     {"descricao": "Completar 5 exercícios", "recompensa": "Pausa de 15 min"}
                   ],
                   "progresso": 0,
                   "exportavel": ["PDF"],
                   "notificacoes": ["Iniciar às 08:50"],
                   "avaliacao": {"dificuldadePercebida": "pendente", "notas": ""},
                   "revisoesPlanejadas": [
                     {"dia": "%s", "duracao": 1}
                   ],
                   "pontuacao": 0
                 }
               ]

            **IMPORTANTE**: Retorne SOMENTE o JSON puro, sem qualquer outro conteúdo. Garanta que todos os campos sejam preenchidos corretamente e que o JSON seja válido.
            """.formatted(conteudo, startDate, startDate, startDate.plusDays(7));
        }
    }


