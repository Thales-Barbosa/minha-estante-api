package com.example.demo.controller;

import com.example.demo.model.Usuario;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.security.TokenService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

// Criaremos duas "classes de transferência" rápidas (DTOs) para receber os dados limpos do Front-end
record LoginRequest(String login, String senha) {}
record TokenResponse(String token) {}

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*") // Permite requisições do seu Front-end local
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // --- ENDPOINT DE LOGIN ---
    @PostMapping("/login")
    public ResponseEntity<?> efetuarLogin(@RequestBody @Valid LoginRequest dados) {
        try {
            // Cria um "ticket" com o usuário e senha digitados
            var authenticationToken = new UsernamePasswordAuthenticationToken(dados.login(), dados.senha());
            
            // O AuthenticationManager vai até o banco, acha o usuário e compara as senhas (criptografadas)
            var authentication = authenticationManager.authenticate(authenticationToken);
            
            // Se chegou aqui, a senha está correta! Vamos gerar o JWT.
            var tokenJWT = tokenService.gerarToken((Usuario) authentication.getPrincipal());
            
            // Devolve o token para o Front-end salvar
            return ResponseEntity.ok(new TokenResponse(tokenJWT));
            
        } catch (Exception e) {
            // Se a senha estiver errada, retorna erro 403
            return ResponseEntity.status(403).body("{\"erro\": \"Usuário ou senha incorretos!\"}");
        }
    }

    // --- ENDPOINT DE CADASTRO ---
    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrarUsuario(@RequestBody @Valid Usuario novoUsuario) {
        
        // Verifica se o login já existe no banco
        if (usuarioRepository.existsByLogin(novoUsuario.getLogin())) {
            return ResponseEntity.badRequest().body("{\"erro\": \"Este nome de usuário já está em uso.\"}");
        }
        
        // Verifica se o e-mail já existe no banco
        if (usuarioRepository.existsByEmail(novoUsuario.getEmail())) {
            return ResponseEntity.badRequest().body("{\"erro\": \"Este e-mail já está cadastrado.\"}");
        }

        String senhaCriptografada = passwordEncoder.encode(novoUsuario.getPassword());
        novoUsuario.setSenha(senhaCriptografada);

        // Salva o usuário no MySQL
        usuarioRepository.save(novoUsuario);

        return ResponseEntity.ok().body("{\"mensagem\": \"Usuário cadastrado com sucesso!\"}");
    }
}