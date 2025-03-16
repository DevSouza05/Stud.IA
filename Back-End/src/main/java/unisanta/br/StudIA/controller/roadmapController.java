package unisanta.br.StudIA.controller;
import jakarta.validation.Valid;
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


@RestController
@CrossOrigin(origins = "*")

@RequestMapping("/api/v1/")
public class roadmapController {

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

        Optional<Users> optionalUser = Optional.ofNullable(userService.getUserById(selecaoDTO.userID()));
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Usuário não encontrado"));
        }
        Users user = optionalUser.get();


        Selecao selecao = selecaoDTO.mapearSelecao(user);

        selecaoService.saveSelecao(selecao);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Roadmap criado com sucesso");
        response.put("usuario", selecao.getUsuario());
        response.put("Itens", selecao.getSelecoes());

        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("Seleções", response);

        return ResponseEntity.status(HttpStatus.OK).body(responseMap);

    }

    @GetMapping("/roadmap/{id}")
    public Mono<ResponseEntity<Map<String, String>>> generateRoadmap(@PathVariable Long id) {
        Users user = userService.getUserById(id);

        if (user == null) {
            return Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Usuário não encontrado")));
        }

        Selecao selecao = selecaoService.getSelecaoByUserId(id);
        if (selecao == null) {
            return Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Seleção não encontrada para o usuário")));
        }


        String roadmapSalvo = selecao.getRoadmap();
        if (roadmapSalvo != null){
            return Mono.just(ResponseEntity.ok(Map.of("roadmap", roadmapSalvo)));
        }



        String conteudo = String.join(", ", selecao.getSelecoes());
        String prompt = "Com base nas seguintes seleções: " + conteudo +
                ", crie um roadmap de estudos personalizado em formato JSON puro, otimizado para manipulação por um frontend, sem texto adicional, formatação Markdown ou comentários explicativos. " +
                "Siga as diretrizes abaixo para estruturar um planejamento eficiente, realista e detalhado: " +

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
                    selecaoService.salvarRoadmap(id, response);
                    return Mono.just(ResponseEntity.ok(Map.of("roadmap", response)));
                })
                .defaultIfEmpty(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Erro ao gerar o roadmap")));
    }


}




