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
public class TrilhaController {
    private static final Logger logger = LoggerFactory.getLogger(roadmapController.class);

    private final UserService userService;
    private final SelecaoService selecaoService;
    private final OpenAIService openAIService;

    public TrilhaController(OpenAIService openAIService, UserService userService, SelecaoService selecaoService) {
        this.userService = userService;
        this.selecaoService = selecaoService;
        this.openAIService = openAIService;
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
                Com base nas seleções: %s, crie um roadmap de estudos personalizado em formato JSON puro, sem Markdown, texto adicional ou comentários. Siga as diretrizes:
                
                1. **Estrutura do JSON**:
                   - Retorne um array com **pelo menos 5 módulos** (tópicos), cada um representando um módulo de estudo:
                     - `titulo`: Nome do módulo (string, ex.: 'Fundamentos de Cybersecurity').
                     - `ordem`: Sequência ideal (inteiro, 1+).
                     - `submodulos`: Array de **pelo menos 5 a 8 submódulos por módulo**, cada submódulo sendo um objeto com:
                       - `nome`: Nome do submódulo (string, ex.: 'Conceitos Básicos de Segurança da Informação').
                       - `recursos`: Array de 1 a 3 objetos com:
                         - `tipo`: Tipo do material (ex.: 'vídeo-aula', 'artigo', 'documentação', 'curso online').
                         - `nome`: Nome do recurso (ex.: 'Introdução à Segurança - YouTube').
                         - `link`: URL específica (ex.: 'https://youtube.com/watch?v=abc123').
                     - `cronograma`: Array de objetos com:
                       - `dia`: Data (YYYY-MM-DD, inicia em %s).
                       - `horarioInicio`: Início (HH:MM).
                       - `horarioFim`: Fim (HH:MM).
                       - `cargaHoraria`: Duração (inteiro, 1-3h).
                     - `metodosEstudo`: Array de strings (ex.: 'resumos', 'exercícios').
                     - `locaisEstudo`: Array de strings (ex.: 'casa', 'biblioteca').
                     - `materiaisApoio`: Array de objetos com:
                       - `tipo`: Tipo (ex.: 'livro', 'vídeo-aula').
                       - `nome`: Nome e fonte.
                       - `link`: URL específica.
                     - `dificuldades`: Array de objetos com:
                       - `descricao`: Descrição.
                       - `estrategia`: Solução.
                     - `proximosPassos`: Array de strings com próximos estudos.
                     - `dicasAdicionais`: Array de strings com dicas.
                     - `nivelDificuldade`: 'iniciante', 'intermediário', 'avançado'.
                     - `tempoEstimadoTotal`: Horas totais (inteiro).
                     - `metas`: Array de objetos com:
                       - `descricao`: Meta (ex.: 'Completar 10 exercícios').
                       - `recompensa`: Recompensa (ex.: 'Pausa de 15 min').
                     - `progresso`: Inteiro (0-100, inicial 0).
                     - `exportavel`: Array de strings (ex.: 'PDF', 'Google Calendar').
                     - `notificacoes`: Array de strings (ex.: 'Iniciar às 08:50').
                     - `avaliacao`: Objeto com:
                       - `dificuldadePercebida`: 'pendente' (atualizável: 'fácil', 'média', 'difícil').
                       - `notas`: Observações (string, vazia).
                     - `revisoesPlanejadas`: Array de objetos com:
                       - `dia`: Data (YYYY-MM-DD).
                       - `duracao`: Horas (inteiro).
                     - `pontuacao`: Inteiro (inicial 0, para gamificação).
                     - `proximaTrilha`: (Apenas no último módulo) Objeto com:
                       - `titulo`: Nome da trilha (string).
                       - `descricao`: Descrição (string).
                       - `topicosSugeridos`: Array de strings com próximos tópicos.
                       - `recursos`: Array de objetos com `tipo`, `nome`, `link`.
                
                2. **Cronograma Inteligente**:
                   - Máximo 4h consecutivas por módulo, com pausas.
                   - Módulos complexos pela manhã (08:00-12:00).
                   - Sequência lógica (ex.: 'Fundamentos' antes de 'Ferramentas').
                   - Máximo 6h diárias, sessões de 1-3h.
                
                3. **Gestão de Datas**:
                   - Inicie em %s, ajustando para dia útil.
                   - Evite horários após 22:00 e feriados (ex.: 25/12, 01/01).
                
                4. **Técnicas de Aprendizado**:
                   - Métodos ativos para módulos complexos (ex.: 'projetos').
                   - Revisões espaçadas para fundamentais (ex.: 'Revisão em 7 dias').
                
                5. **Continuidade**:
                   - No último módulo, inclua `proximaTrilha` com sugestões para continuar o aprendizado.
                   - Inclua revisões de longo prazo (ex.: 7, 14, 30 dias) em `revisoesPlanejadas`.
                
                6. **Gamificação**:
                   - Metas com recompensas motivacionais.
                   - `pontuacao` para rastrear pontos por conclusão de metas/submódulos.
                
                7. **Saída**:
                   - JSON puro, válido, sem chaves externas.
                   - Links reais e confiáveis (ex.: Coursera, YouTube).
                
                Exemplo:
                [
                  {
                    "titulo": "Fundamentos de Cybersecurity",
                    "ordem": 1,
                    "submodulos": [
                      {
                        "nome": "Conceitos Básicos de Segurança da Informação",
                        "recursos": [
                          {"tipo": "vídeo-aula", "nome": "Introdução à Segurança - YouTube", "link": "https://youtube.com/watch?v=abc123"},
                          {"tipo": "artigo", "nome": "O que é Cybersecurity - Kaspersky", "link": "https://kaspersky.com/cybersecurity"}
                        ]
                      },
                      {
                        "nome": "Tipos de Ameaças e Vulnerabilidades",
                        "recursos": [
                          {"tipo": "documentação", "nome": "OWASP Top 10", "link": "https://owasp.org/Top10"}
                        ]
                      },
                      {
                        "nome": "Princípios de Defesa em Profundidade",
                        "recursos": [
                          {"tipo": "vídeo-aula", "nome": "Defesa em Profundidade - Cybrary", "link": "https://cybrary.it/course/defense-in-depth"}
                        ]
                      },
                      {
                        "nome": "Normas e Regulamentações de Segurança (ISO 27001, NIST)",
                        "recursos": [
                          {"tipo": "documentação", "nome": "ISO 27001 Overview", "link": "https://iso.org/iso-27001"}
                        ]
                      },
                      {
                        "nome": "Introdução à Criptografia",
                        "recursos": [
                          {"tipo": "curso online", "nome": "Criptografia Básica - Coursera", "link": "https://coursera.org/learn/crypto"}
                        ]
                      }
                    ],
                    "cronograma": [{"dia": "%s", "horarioInicio": "09:00", "horarioFim": "11:00", "cargaHoraria": 2}],
                    "metodosEstudo": ["leitura", "resumos"],
                    "locaisEstudo": ["casa"],
                    "materiaisApoio": [{"tipo": "livro", "nome": "Security Engineering - Ross Anderson", "link": "https://example.com"}],
                    "dificuldades": [{"descricao": "Complexidade", "estrategia": "Prática diária"}],
                    "proximosPassos": ["Estudar Ferramentas de Segurança"],
                    "dicasAdicionais": ["Pratique diariamente"],
                    "nivelDificuldade": "iniciante",
                    "tempoEstimadoTotal": 60,
                    "metas": [{"descricao": "Completar 10 exercícios", "recompensa": "Pausa de 15 min"}],
                    "progresso": 0,
                    "exportavel": ["PDF"],
                    "notificacoes": ["Iniciar às 08:50"],
                    "avaliacao": {"dificuldadePercebida": "pendente", "notas": ""},
                    "revisoesPlanejadas": [{"dia": "%s", "duracao": 1}],
                    "pontuacao": 0
                  },
                  {
                    "titulo": "Ferramentas de Cybersecurity",
                    "ordem": 2,
                    "submodulos": [
                      {
                        "nome": "Uso de Firewalls",
                        "recursos": [
                          {"tipo": "vídeo-aula", "nome": "Firewalls 101 - YouTube", "link": "https://youtube.com/watch?v=firewall101"}
                        ]
                      },
                      {
                        "nome": "Análise com Wireshark",
                        "recursos": [
                          {"tipo": "documentação", "nome": "Wireshark Docs", "link": "https://wireshark.org/docs"}
                        ]
                      },
                      {
                        "nome": "Introdução ao Metasploit",
                        "recursos": [
                          {"tipo": "curso online", "nome": "Metasploit Basics - Udemy", "link": "https://udemy.com/course/metasploit-basics"}
                        ]
                      },
                      {
                        "nome": "Configuração de VPNs",
                        "recursos": [
                          {"tipo": "artigo", "nome": "Como Configurar VPN - NordVPN", "link": "https://nordvpn.com/setup"}
                        ]
                      },
                      {
                        "nome": "Monitoramento com SIEM",
                        "recursos": [
                          {"tipo": "vídeo-aula", "nome": "SIEM Explained - Cybrary", "link": "https://cybrary.it/course/siem"}
                        ]
                      }
                    ],
                    "cronograma": [{"dia": "%s", "horarioInicio": "09:00", "horarioFim": "11:00", "cargaHoraria": 2}],
                    "metodosEstudo": ["prática", "projetos"],
                    "locaisEstudo": ["casa"],
                    "materiaisApoio": [{"tipo": "livro", "nome": "Hacking for Dummies", "link": "https://example.com"}],
                    "dificuldades": [{"descricao": "Configuração técnica", "estrategia": "Seguir tutoriais práticos"}],
                    "proximosPassos": ["Aprofundar em Testes de Penetração"],
                    "dicasAdicionais": ["Pratique em ambientes virtuais"],
                    "nivelDificuldade": "intermediário",
                    "tempoEstimadoTotal": 50,
                    "metas": [{"descricao": "Configurar um firewall", "recompensa": "Pausa de 20 min"}],
                    "progresso": 0,
                    "exportavel": ["PDF"],
                    "notificacoes": ["Iniciar às 08:50"],
                    "avaliacao": {"dificuldadePercebida": "pendente", "notas": ""},
                    "revisoesPlanejadas": [{"dia": "%s", "duracao": 1}],
                    "pontuacao": 0
                  }
                ]
                """.formatted(conteudo, startDate, startDate, startDate, startDate.plusDays(7), startDate.plusDays(9), startDate.plusDays(14));
    }
}
