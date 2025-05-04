package unisanta.br.StudIA.service;

import jakarta.transaction.Transactional;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import unisanta.br.StudIA.Model.Users;
import unisanta.br.StudIA.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Users createUser(Users user) {
        return userRepository.save(user);
    }

    @Transactional
    public Users getUserById(Long id) {

        Users user = userRepository.findById(id).orElse(null);
        if (user != null) {
            Hibernate.initialize(userRepository.findById(id).get().getSelecoes());
        }
        return user;
    }

    public boolean deleteUserById(Long id) {
        Users user = userRepository.findById(id).orElse(null);
        if (user != null) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Transactional
    public Users getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario não encontrado"));
    }

    public Users findByUsername(String username) {
        return userRepository.findByUsername(username);
    }


}