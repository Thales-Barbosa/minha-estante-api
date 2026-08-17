package com.example.demo.controller;

import com.example.demo.model.Livro;
import com.example.demo.repository.LivroRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    // CREATE (Recebe o livro do JS e salva no MySQL)
    @PostMapping
    public Livro salvar(@RequestBody Livro livro) {
        return livroRepository.save(livro);
    }

    // DELETE (Recebe o ID do JS e exclui do banco)
    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        livroRepository.deleteById(id);
    }
    // UPDATE (Recebe os dados atualizados e salva no livro existente)
    @PutMapping("/{id}")
    public Livro atualizar(@PathVariable Long id, @RequestBody Livro livroAtualizado) {
        return livroRepository.findById(id)
                .map(livro -> {
                    livro.setTitulo(livroAtualizado.getTitulo());
                    livro.setAutor(livroAtualizado.getAutor());
                    livro.setStatus(livroAtualizado.getStatus());
                    livro.setPaginas(livroAtualizado.getPaginas());
                    livro.setAnoPublicacao(livroAtualizado.getAnoPublicacao());
                    return livroRepository.save(livro);
                })
                .orElseGet(() -> {
                    livroAtualizado.setId(id);
                    return livroRepository.save(livroAtualizado);
                });
    }
}