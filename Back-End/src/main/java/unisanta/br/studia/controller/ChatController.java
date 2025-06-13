package unisanta.br.StudIA.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import unisanta.br.StudIA.dto.ChatBotDTO;
import unisanta.br.StudIA.service.ChatService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping
    public Mono<ResponseEntity<ChatBotDTO>> conversar(@Valid @RequestBody ChatBotDTO mensagem) {
        return chatService.gerarResposta(mensagem.getPergunta())
                .map(resposta -> {
                    mensagem.setResposta(resposta);
                    return ResponseEntity.ok(mensagem);
                });
    }
}