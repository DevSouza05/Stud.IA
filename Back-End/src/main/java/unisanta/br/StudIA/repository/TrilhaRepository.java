package unisanta.br.StudIA.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import unisanta.br.StudIA.Model.Trilha;

import java.util.Optional;

public interface TrilhaRepository extends JpaRepository<Trilha, Long> {

    Optional<Trilha> findByUser_UserId(Long userId);

}