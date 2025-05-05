package unisanta.br.StudIA.service;

import org.springframework.stereotype.Service;
import unisanta.br.StudIA.Model.Modulos;
import unisanta.br.StudIA.repository.ModulosRepository;

import java.util.List;

@Service
public class ModulosService {
    private final ModulosRepository modulosRepository;

    public ModulosService(ModulosRepository modulosRepository) {
        this.modulosRepository = modulosRepository;
    }

    public Modulos saveModulos(Modulos modulos) {
        return modulosRepository.save(modulos);
    }

    public List<Modulos> getModulosCompletosByUserID(Long userId) {
        return modulosRepository.findByUserId(userId);
    }


}
