package unisanta.br.StudIA.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import unisanta.br.StudIA.Model.Selecao;
import unisanta.br.StudIA.Model.Users;

import java.util.Optional;

public interface SelecaoRepository extends JpaRepository<Selecao, Long> {

    Optional<Selecao> findByUsuario(String username);
    Optional<Selecao> findById(Long id);
    Optional<Selecao> findByUser_UserId(Long userId);


}
