package unisanta.br.StudIA.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import unisanta.br.StudIA.Model.Selecao;
import unisanta.br.StudIA.Model.Users;
import unisanta.br.StudIA.repository.SelecaoRepository;
import unisanta.br.StudIA.repository.UserRepository;

@Service
public class SelecaoService {
    private final SelecaoRepository selecaoRepository;
    @Autowired
    private final UserRepository userRepository;

    public SelecaoService(SelecaoRepository selecaoRepository, UserRepository userRepository) {
        this.selecaoRepository = selecaoRepository;
        this.userRepository = userRepository;
    }

    public Selecao saveSelecao(Selecao selecao) {
        if (selecao == null) {
            throw new IllegalArgumentException("Seleção não pode ser nula");
        }
        return selecaoRepository.save(selecao);
    }


    public Selecao getSelecaoById(Long id) {
        return selecaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Seleção não encontrada com o ID fornecido"));
    }

    public Selecao getSelecaoByUserId(Long userId) {
        return selecaoRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new RuntimeException("Seleção não encontrada para o usuário com ID " + userId));
    }


    public void salvarRoadmap(Long userId, String roadmap) {
        Selecao selecao = selecaoRepository.findByUser_UserId(userId).orElse(null);
        if (selecao != null) {
            selecao.setRoadmapGerado(roadmap);
            selecaoRepository.save(selecao);
        } else {
            throw new RuntimeException("Seleção não encontrada para o usuário com ID " + userId);
        }
    }



}
