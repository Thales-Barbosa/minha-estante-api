package com.example.demo.controller;

import com.example.demo.model.Livro;
import com.example.demo.repository.LivroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/livros")
@CrossOrigin(origins = "*") 
public class LivroController {

    @Autowired
    private LivroRepository livroRepository;

    // READ (Busca todos os livros e envia para o JS)
    @GetMapping
    public List<Livro> listarTodos() {
        return livroRepository.findAll();
    }

    // CREATE (Salva um novo livro com bloqueio de duplicados)
    @PostMapping
    public ResponseEntity<?> salvar(@RequestBody Livro livro) {
        if (livroRepository.existsByTituloIgnoreCase(livro.getTitulo())) {
            return ResponseEntity.badRequest().body("{\"erro\": \"Um livro com este título já está cadastrado.\"}");
        }
        return ResponseEntity.ok(livroRepository.save(livro));
    }

    // UPDATE (Atualiza os dados do livro, incluindo a avaliação)
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Livro livroAtualizado) {
        return livroRepository.findById(id)
                .map(livro -> {
                    livro.setTitulo(livroAtualizado.getTitulo());
                    livro.setAutor(livroAtualizado.getAutor());
                    livro.setStatus(livroAtualizado.getStatus());
                    livro.setPaginas(livroAtualizado.getPaginas());
                    livro.setAnoPublicacao(livroAtualizado.getAnoPublicacao());
                    livro.setAvaliacao(livroAtualizado.getAvaliacao());
                    return ResponseEntity.ok(livroRepository.save(livro));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE (Exclui o livro pelo ID)
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        livroRepository.deleteById(id);
    }
}