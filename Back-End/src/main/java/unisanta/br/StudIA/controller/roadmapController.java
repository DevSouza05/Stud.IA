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


        String roadmapSalvo = selecao.getRoadmapGerado();
        if (roadmapSalvo != null){
            return Mono.just(ResponseEntity.ok(Map.of("roadmap", roadmapSalvo)));
        }



        String conteudo = String.join(", ", selecao.getSelecoes());
        String prompt = "Com base nas seguintes seleções: " + conteudo +
                ", elabore um roadmap de estudos personalizado em formato JSON puro, sem texto adicional ou formatação Markdown, otimizado para manipulação por um frontend. " +
                "Siga as diretrizes abaixo ao estruturar o JSON, garantindo que o planejamento seja eficiente e realista: " +

                "1. **Estrutura do JSON:** O JSON deve ser um array de objetos, sem incluir caracteres especiais '\\n', '\\', '[', ']', onde cada objeto representa um tópico/matéria com os seguintes campos: " +
                "   - 'titulo': Nome do tópico/matéria (string); " +
                "   - 'ordem': Número indicando a sequência ideal de estudo (inteiro); " +
                "   - 'cronograma': Array de objetos contendo: " +
                "       - 'dia': Data no formato 'YYYY-MM-DD', iniciando a partir de " + LocalDate.now().toString() + " ou do próximo dia útil; " +
                "       - 'horarioInicio': Horário de início no formato 'HH:MM'; " +
                "       - 'horarioFim': Horário de término no formato 'HH:MM'; " +
                "       - 'cargaHoraria': Duração da sessão de estudo em horas (inteiro); " +
                "   - 'metodosEstudo': Array de strings com métodos recomendados (ex.: 'resumos', 'exercícios práticos', 'flashcards', 'mapas mentais', 'projetos práticos'); " +
                "   - 'locaisEstudo': Array de strings com locais sugeridos (ex.: 'casa', 'biblioteca', 'coworking'); " +
                "   - 'materiaisApoio': Array de objetos contendo: " +
                "       - 'tipo': Tipo do material (ex.: 'livro', 'curso online', 'vídeo-aula', 'artigo', 'documentação oficial'); " +
                "       - 'nome': Nome e autor/fonte do material (ex.: 'Algoritmos - Cormen', 'Curso de Redes - Cisco'); " +
                "   - 'dificuldades': Array de objetos contendo: " +
                "       - 'descricao': Descrição da dificuldade enfrentada no tópico (string); " +
                "       - 'estrategia': Estratégia recomendada para superação (string). " +

                "2. **Distribuição Inteligente do Cronograma:** " +
                "   - O estudo deve ser distribuído de maneira equilibrada, evitando sobrecarga. " +
                "   - Preferencialmente, sessões de estudo devem ter entre 1 e 3 horas por dia, com pausas entre blocos longos. " +
                "   - Evite agendar mais de 4 horas consecutivas de estudo para um mesmo tópico. " +
                "   - Dê prioridade a tópicos mais complexos no início do dia ou momentos de maior foco do usuário. " +
                "   - Se houver tópicos interdependentes, organize-os de maneira sequencial para melhor assimilação. " +

                "3. **Adaptação a Datas e Feriados:** " +
                "   - A data inicial deve ser " + LocalDate.now().toString() + ", ajustada para o próximo dia útil, se necessário. " +
                "   - Se a data cair em um feriado ou final de semana, prefira remanejar para um dia útil próximo. " +
                "   - O cronograma deve evitar horários impraticáveis, como períodos noturnos (salvo exceções justificadas). " +

                "4. **Técnicas de Aprendizado Ativo:** " +
                "   - Para tópicos mais desafiadores, inclua técnicas como aprendizado baseado em projetos, ensino reverso ou grupos de estudo. " +
                "   - Recomende revisões periódicas (ex.: revisão espaçada) para reforçar conteúdos importantes. " +

                "5. **Formato de Saída:** " +
                "   - Retorne apenas o JSON puro, sem envolver em chaves adicionais como 'roadmap' ou formatação externa. " +
                "   - Certifique-se de que o JSON seja legível e facilmente manipulável por aplicações frontend e ferramentas como Postman. " +
                "   - Evite qualquer tipo de comentário ou texto explicativo no retorno, apenas a estrutura JSON formatada corretamente.";



        return openAIService.gerarResposta(prompt)
                .flatMap(response -> {
                    selecaoService.salvarRoadmap(id, response);
                    return Mono.just(ResponseEntity.ok(Map.of("roadmap", response)));
                })
                .defaultIfEmpty(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Erro ao gerar o roadmap")));
    }


}




