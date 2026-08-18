package com.example.demo.security;

import com.example.demo.model.Usuario;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class TokenService {

    private static final String SECRET = "MinhaChaveSecretaSuperSeguraParaOProjetoMinhaEstante123!";
    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

    public String gerarToken(Usuario usuario) {
        return Jwts.builder()
                .setSubject(usuario.getLogin()) // Define a quem pertence o token
                .setIssuer("API Minha Estante")
                .setExpiration(new Date(System.currentTimeMillis() + 7200000)) // Expira em 2 horas
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String getSubject(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject(); // Recupera o login de dentro do token
    }
}