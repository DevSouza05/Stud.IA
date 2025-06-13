package unisanta.br.StudIA.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import unisanta.br.StudIA.Model.Selecao;
import unisanta.br.StudIA.Model.Users;
import unisanta.br.StudIA.dto.SelecaoDTO;
import unisanta.br.StudIA.dto.UserDTO;
import unisanta.br.StudIA.service.UserService;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/auth/")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/cadastrar")
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody UserDTO userDTO) {
        if (userDTO == null || userDTO.username() == null || userDTO.email() == null || userDTO.senha() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Todos os campos são obrigatórios"));
        }

        Users user = userDTO.mapearUsuario();
        Users savedUser = userService.createUser(user);

        Map<String, Object> userResponse = new HashMap<>();
        userResponse.put("userId", savedUser.getUserId());
        userResponse.put("username", savedUser.getUsername());
        userResponse.put("email", savedUser.getEmail());
        userResponse.put("creationTimestamp", savedUser.getCreationTimestamp());
        userResponse.put("updateTimestamp", savedUser.getUpdateTimestamp());


        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "timestamp", System.currentTimeMillis(),
                "status", HttpStatus.CREATED.value(),
                "message", "Usuário criado com sucesso",
                "user", userResponse
        ));
    }


    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable Long id) {
        Users user = userService.getUserById(id);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Usuário não encontrado"));
        }

        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("timestamp", System.currentTimeMillis());
        responseMap.put("status", HttpStatus.OK.value());
        responseMap.put("message", "Usuário encontrado com sucesso");
        responseMap.put("user", user);

        return ResponseEntity.status(HttpStatus.OK).body(responseMap);
    }



    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteUserById(@PathVariable Long id) {
        boolean deleted = userService.deleteUserById(id);

        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Usuário não encontrado"));
        }

        return ResponseEntity.ok(Map.of(
                "timestamp", System.currentTimeMillis(),
                "status", HttpStatus.OK.value(),
                "message", "Usuário deletado com sucesso"
        ));
    }






    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody UserDTO userDTO) {
        if (userDTO.email().isBlank() || userDTO.senha().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Todos os campos são obrigatórios"));
        }

        Users user = userService.getUserByEmail(userDTO.email());

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Usuário não encontrado"));
        }

        if (!user.getPassword().equals(userDTO.senha())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Senha incorreta"));
        }

        for (Selecao selecao : user.getSelecoes()) {
            selecao.getSelecoes();
        }



        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("timestamp", System.currentTimeMillis());
        responseMap.put("status", HttpStatus.OK.value());
        responseMap.put("message", "Usuário logado com sucesso");
        responseMap.put("userID", user.getUserId());
        responseMap.put("selecoes", user.getSelecoes());


        return ResponseEntity.status(HttpStatus.OK).body(responseMap);
    }



}