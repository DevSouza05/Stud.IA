package unisanta.br.StudIA.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import unisanta.br.StudIA.Model.Trilha;
import unisanta.br.StudIA.Model.Users;
import unisanta.br.StudIA.repository.TrilhaRepository;
import unisanta.br.StudIA.repository.UserRepository;

@Service
public class TrilhaService {
    private final TrilhaRepository trilhaRepository;
    private final UserRepository userRepository;

    @Autowired
    public TrilhaService(TrilhaRepository trilhaRepository, UserRepository userRepository) {
        this.trilhaRepository = trilhaRepository;
        this.userRepository = userRepository;
    }

    public String getTrilhaByUserId(Long userId) {
        return trilhaRepository.findByUser_UserId(userId)
                .map(Trilha::getTrilhaJson)
                .orElse(null);
    }

    public void saveTrilha(Long userId, String trilhaJson) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado para userID: " + userId));

        Trilha trilha = trilhaRepository.findByUser_UserId(userId).orElse(null);
        if (trilha == null) {
            trilha = new Trilha();
            trilha.setUser(user);
            trilha.setUsuario(user.getUsername());
        }
        trilha.setTrilhaJson(trilhaJson);

        trilhaRepository.save(trilha);
    }
}