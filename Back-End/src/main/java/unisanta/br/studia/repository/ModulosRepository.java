package unisanta.br.StudIA.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import unisanta.br.StudIA.Model.Modulos;

import java.util.List;

public interface ModulosRepository extends JpaRepository<Modulos, Long> {
    List<Modulos> findByUserId(Long userId);

}
