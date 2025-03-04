package unisanta.br.StudIA.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import unisanta.br.StudIA.Model.Selecao;
import unisanta.br.StudIA.Model.Users;

import java.util.List;

public record UserDTO(
        Long id,

        @Size(min = 3, max = 30, message = "O nome deve ter entre 3 e 30 caracteres")
        @NotNull(message = "Username é obrigatório")
        String username,

        @NotNull(message = "Email é obrigatório")
        @Email(message = "Email inválido")
        String email,

        @NotNull(message = "Senha é obrigatória")
        @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres")
        String senha

) {

    public Users mapearUsuario() {
        Users user = new Users();
        user.setUserId(this.id);
        user.setUsername(this.username);
        user.setEmail(this.email);
        user.setPassword(this.senha);

        return user;
    }


}