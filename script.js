const API_URL = "http://localhost:8080/api/livros";

const formLivro = document.getElementById('form-livro');
const listaCorpo = document.getElementById('lista-corpo');
const btnCancelar = document.getElementById('btn-cancelar');
const tituloForm = document.getElementById('form-titulo');

let livrosGlobais = []; 

async function carregarLivros() {
    try {
        const resposta = await fetch(API_URL);
        if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);
        
        livrosGlobais = await resposta.json();
        renderizarTabela(livrosGlobais);
    } catch (erro) {
        console.error("Erro ao carregar livros:", erro);
    }
}

function renderizarTabela(livros) {
    listaCorpo.innerHTML = ""; 
    
    livros.forEach(livro => {
        // Trata os campos opcionais para exibir um traço caso estejam vazios
        const paginasExibicao = livro.paginas ? livro.paginas : '-';
        const anoExibicao = livro.anoPublicacao ? livro.anoPublicacao : '-';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${livro.titulo}</td>
            <td>${livro.autor}</td>
            <td>${paginasExibicao}</td>
            <td>${anoExibicao}</td>
            <td>${livro.status}</td>
            <td>
                <button onclick="prepararEdicao(${livro.id})" style="background-color: #f39c12; color: white; padding: 5px; border: none; cursor: pointer; margin-right: 5px;">Editar</button>
                <button class="btn-excluir" onclick="excluirLivro(${livro.id})">Excluir</button>
            </td>
        `;
        listaCorpo.appendChild(tr);
    });
}

// Preenche o formulário com os dados do livro selecionado
function prepararEdicao(id) {
    const livro = livrosGlobais.find(l => l.id === id);
    
    document.getElementById('livro-id').value = livro.id;
    document.getElementById('titulo').value = livro.titulo;
    document.getElementById('autor').value = livro.autor;
    document.getElementById('paginas').value = livro.paginas || '';
    document.getElementById('ano').value = livro.anoPublicacao || '';
    document.getElementById('status').value = livro.status;

    tituloForm.innerText = "Editar Livro";
    document.getElementById('btn-salvar').innerText = "Atualizar Livro";
    btnCancelar.style.display = "inline-block";
}

// Botão para cancelar a edição e limpar o formulário
btnCancelar.addEventListener('click', limparFormulario);

function limparFormulario() {
    formLivro.reset();
    document.getElementById('livro-id').value = '';
    tituloForm.innerText = "Adicionar Novo Livro";
    document.getElementById('btn-salvar').innerText = "Salvar Livro";
    btnCancelar.style.display = "none";
}

formLivro.addEventListener('submit', async function(evento) {
    evento.preventDefault(); 
    
    const id = document.getElementById('livro-id').value;
    
    const livroDados = {
        titulo: document.getElementById('titulo').value,
        autor: document.getElementById('autor').value,
        status: document.getElementById('status').value,
        // Envia nulo se o campo estiver vazio
        paginas: document.getElementById('paginas').value ? parseInt(document.getElementById('paginas').value) : null,
        anoPublicacao: document.getElementById('ano').value ? parseInt(document.getElementById('ano').value) : null
    };

    try {
        let metodo = 'POST';
        let urlFinal = API_URL;

        // Se existir um ID oculto, sabemos que é uma edição (PUT)
        if (id) {
            metodo = 'PUT';
            urlFinal = `${API_URL}/${id}`;
        }

        const resposta = await fetch(urlFinal, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(livroDados)
        });

        if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);
        
        alert(id ? "Livro atualizado com sucesso!" : "Livro salvo com sucesso!");
        limparFormulario(); 
        carregarLivros(); 
    } catch (erro) {
        console.error("Erro ao salvar:", erro);
        alert("Não foi possível salvar o livro.");
    }
});

async function excluirLivro(id) {
    if (confirm("Tem certeza que deseja excluir este livro?")) {
        try {
            const resposta = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);
            carregarLivros();
        } catch (erro) {
            console.error("Erro ao excluir:", erro);
        }
    }
}

window.onload = carregarLivros;


const campoPesquisa = document.getElementById('campo-pesquisa');

campoPesquisa.addEventListener('input', function() {
    const termoPesquisado = campoPesquisa.value.toLowerCase();
    
    // Filtra os livros que tenham o termo no título OU no autor
    const livrosFiltrados = livrosGlobais.filter(livro => {
        const titulo = livro.titulo.toLowerCase();
        const autor = livro.autor.toLowerCase();
        
        return titulo.includes(termoPesquisado) || autor.includes(termoPesquisado);
    });
    
    // Desenha a tabela novamente apenas com os resultados filtrados
    renderizarTabela(livrosFiltrados);
});