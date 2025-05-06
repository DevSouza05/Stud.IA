package unisanta.br.StudIA.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDate;

public record ModulosDTO(
        @NotNull(message = "moduleId é obrigatório")
        Integer moduleId,

        @NotBlank(message = "title é obrigatório")
        String title,

        @NotNull(message = "completionDate é obrigatório")
        @PastOrPresent(message = "completionDate deve ser no passado ou presente")
        LocalDate completionDate,

        @NotNull(message = "score é obrigatório")
        Integer score
) {}