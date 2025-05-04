package unisanta.br.StudIA.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Service
public class ChatService {

    private static final Logger logger = LoggerFactory.getLogger(ChatService.class);
    private final WebClient webClient;

    @Value("AIzaSyAgrpbjRq-xv2hLIBX_xnQh6h9XYszfQXU")
    private String geminiApiKey;

    public ChatService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://generativelanguage.googleapis.com/v1beta").build();
    }

    public Mono<String> gerarResposta(String prompt) {
        if (prompt == null || prompt.trim().isEmpty()) {
            return Mono.just("Erro: O prompt não pode ser vazio.");
        }

        String ajustesPrompt = prompt + " Responda de forma resumida, em até 50 palavras";

        return webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/models/gemini-1.5-flash:generateContent")
                        .queryParam("key", geminiApiKey)
                        .build())
                .header("Content-Type", "application/json")
                .bodyValue(Map.of(
                        "contents", List.of(
                                Map.of("parts", List.of(Map.of("text", ajustesPrompt)))
                        )
                ))
                .retrieve()
                .bodyToMono(Map.class)
                .map(this::Resposta_Text)
                .onErrorResume(e -> {
                    logger.error("Erro ao chamar a API do Gemini: {}", e.getMessage(), e);
                    return Mono.just("Erro ao chamar a API do Gemini: " + e.getMessage());
                });
    }

    private String Resposta_Text(Map<String, Object> response) {
        try {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> candidate = candidates.get(0);
                Map<String, Object> content = (Map<String, Object>) candidate.get("content");
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                if (parts != null && !parts.isEmpty()) {
                    return (String) parts.get(0).get("text");
                }
            }
            logger.warn("Resposta inválida ou sem conteúdo da API do Gemini.");
            return "Erro: Resposta inválida da API do Gemini.";
        } catch (Exception e) {
            logger.error("Erro ao processar resposta da API: {}", e.getMessage(), e);
            return "Erro ao processar resposta da API do Gemini.";
        }
    }
}