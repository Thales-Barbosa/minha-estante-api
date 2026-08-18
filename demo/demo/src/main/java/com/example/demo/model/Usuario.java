package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "usuarios")
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome é obrigatório")
    private String nome;

    @NotNull(message = "A idade é obrigatória")
    @Min(value = 1, message = "Idade inválida")
    private Integer idade;

    @NotBlank(message = "O login é obrigatório")
    @Column(unique = true) 
    private String login; // Funciona como Username para o Spring

    @NotBlank(message = "A senha é obrigatória")
    private String senha;

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "Formato de e-mail inválido")
    @Column(unique = true) 
    private String email;

    // Construtores
    public Usuario() {}

    public Usuario(String nome, Integer idade, String login, String senha, String email) {
        this.nome = nome;
        this.idade = idade;
        this.login = login;
        this.senha = senha;
        this.email = email;
    }

    // --- Getters e Setters Normais ---
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public Integer getIdade() { return idade; }
    public String getEmail() { return email; }
    public String getLogin() { return login; }
    public void setSenha(String senha) { this.senha = senha; }

    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Todo usuário criado terá a permissão básica de "USER"
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return this.senha;
    }

    @Override
    public String getUsername() {
        return this.login;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}