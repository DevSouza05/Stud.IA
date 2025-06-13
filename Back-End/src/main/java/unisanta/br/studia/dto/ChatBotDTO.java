package unisanta.br.StudIA.dto;

import jakarta.validation.constraints.NotBlank;

public class ChatBotDTO {

    @NotBlank(message = "A pergunta não pode ser vazia")
    private String pergunta;
    private String resposta;

    public String getPergunta() {
        return pergunta;
    }

    public void setPergunta(String pergunta) {
        this.pergunta = pergunta;
    }

    public String getResposta() {
        return resposta;
    }

    public void setResposta(String resposta) {
        this.resposta = resposta;
    }
}