const API_URL = "http://localhost:8080/api/livros";

const formLivro = document.getElementById('form-livro');
const listaCorpo = document.getElementById('lista-corpo');
const btnCancelar = document.getElementById('btn-cancelar');
const tituloForm = document.getElementById('form-titulo');
const statusSelect = document.getElementById('status');
const divAvaliacao = document.getElementById('div-avaliacao');

let livrosGlobais = [];
let livrosFiltrados = [];
let ordemCrescente = true;
let idParaExcluir = null;

// --- EXIBIR AVALIAÇÃO SOMENTE SE LIDO ---
statusSelect.addEventListener('change', () => {
    if (statusSelect.value === 'Lido') {
        divAvaliacao.style.display = 'block';
    } else {
        divAvaliacao.style.display = 'none';
        document.getElementById('avaliacao').value = '';
    }
});

// --- VALIDAÇÃO VISUAL (BORDA VERMELHA) ---
function validarNumeroNegativo(evento) {
    if (evento.target.value < 0) {
        evento.target.classList.add('input-erro');
    } else {
        evento.target.classList.remove('input-erro');
    }
}
document.getElementById('paginas').addEventListener('input', validarNumeroNegativo);
document.getElementById('ano').addEventListener('input', validarNumeroNegativo);
document.getElementById('avaliacao').addEventListener('input', (e) => {
    if (e.target.value < 1 || e.target.value > 5) e.target.classList.add('input-erro');
    else e.target.classList.remove('input-erro');
});

// --- CARREGAR E RENDERIZAR TABELA ---
async function carregarLivros() {
    try {
        const resposta = await fetch(API_URL);
        livrosGlobais = await resposta.json();
        livrosFiltrados = [...livrosGlobais];
        renderizarTabela(livrosFiltrados);
    } catch (erro) {
        mostrarMensagem("Erro ao conectar com o servidor.");
    }
}

function renderizarTabela(livros) {
    listaCorpo.innerHTML = ""; 
    livros.forEach(livro => {
        const paginas = livro.paginas ? livro.paginas : '-';
        const ano = livro.anoPublicacao ? livro.anoPublicacao : '-';
        const nota = (livro.status === 'Lido' && livro.avaliacao) ? '⭐'.repeat(livro.avaliacao) : '-';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${livro.titulo}</td>
            <td>${livro.autor}</td>
            <td>${paginas}</td>
            <td>${ano}</td>
            <td>${livro.status}</td>
            <td>${nota}</td>
            <td>
                <button onclick="prepararEdicao(${livro.id})" style="background-color: #f39c12; margin-bottom: 5px;">Editar</button>
                <button onclick="abrirModalExclusao(${livro.id})" style="background-color: #e74c3c;">Excluir</button>
            </td>
        `;
        listaCorpo.appendChild(tr);
    });
}

// --- ORDENAÇÃO (CLIQUE NO CABEÇALHO) ---
function ordenar(campo) {
    livrosFiltrados.sort((a, b) => {
        let valorA = a[campo].toLowerCase();
        let valorB = b[campo].toLowerCase();
        if (valorA < valorB) return ordemCrescente ? -1 : 1;
        if (valorA > valorB) return ordemCrescente ? 1 : -1;
        return 0;
    });
    ordemCrescente = !ordemCrescente; // Inverte para a próxima vez
    renderizarTabela(livrosFiltrados);
}

// --- PESQUISA ---
document.getElementById('campo-pesquisa').addEventListener('input', function() {
    const termo = this.value.toLowerCase();
    livrosFiltrados = livrosGlobais.filter(livro => 
        livro.titulo.toLowerCase().includes(termo) || 
        livro.autor.toLowerCase().includes(termo)
    );
    renderizarTabela(livrosFiltrados);
});

// --- SALVAR/ATUALIZAR (COM BLOQUEIO DE DUPLICADOS) ---
formLivro.addEventListener('submit', async function(evento) {
    evento.preventDefault(); 
    
    // Trava para não enviar erros visuais
    if (document.querySelectorAll('.input-erro').length > 0) {
        mostrarMensagem("Por favor, corrija os campos em vermelho.");
        return;
    }

    const id = document.getElementById('livro-id').value;
    const livroDados = {
        titulo: document.getElementById('titulo').value,
        autor: document.getElementById('autor').value,
        status: statusSelect.value,
        paginas: document.getElementById('paginas').value ? parseInt(document.getElementById('paginas').value) : null,
        anoPublicacao: document.getElementById('ano').value ? parseInt(document.getElementById('ano').value) : null,
        avaliacao: document.getElementById('avaliacao').value ? parseInt(document.getElementById('avaliacao').value) : null
    };

    let metodo = id ? 'PUT' : 'POST';
    let urlFinal = id ? `${API_URL}/${id}` : API_URL;

    try {
        const resposta = await fetch(urlFinal, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(livroDados)
        });

        // Se retornar erro 400 do Java (Livro duplicado)
        if (!resposta.ok) {
            const erroJson = await resposta.json();
            mostrarMensagem(erroJson.erro || "Erro ao salvar o livro.");
            return;
        }
        
        mostrarMensagem(id ? "Livro atualizado!" : "Livro cadastrado com sucesso!");
        limparFormulario(); 
        carregarLivros(); 
    } catch (erro) {
        mostrarMensagem("Servidor indisponível.");
    }
});

// --- PREPARAR EDIÇÃO ---
function prepararEdicao(id) {
    const livro = livrosGlobais.find(l => l.id === id);
    document.getElementById('livro-id').value = livro.id;
    document.getElementById('titulo').value = livro.titulo;
    document.getElementById('autor').value = livro.autor;
    document.getElementById('paginas').value = livro.paginas || '';
    document.getElementById('ano').value = livro.anoPublicacao || '';
    statusSelect.value = livro.status;
    
    if (livro.status === 'Lido') {
        divAvaliacao.style.display = 'block';
        document.getElementById('avaliacao').value = livro.avaliacao || '';
    } else {
        divAvaliacao.style.display = 'none';
    }

    tituloForm.innerText = "Editar Livro";
    document.getElementById('btn-salvar').innerText = "Atualizar Livro";
    btnCancelar.style.display = "inline-block";
}

function limparFormulario() {
    formLivro.reset();
    document.getElementById('livro-id').value = '';
    divAvaliacao.style.display = 'none';
    document.querySelectorAll('.input-erro').forEach(el => el.classList.remove('input-erro'));
    tituloForm.innerText = "Adicionar Novo Livro";
    document.getElementById('btn-salvar').innerText = "Salvar Livro";
    btnCancelar.style.display = "none";
}
btnCancelar.addEventListener('click', limparFormulario);


function mostrarMensagem(texto) {
    document.getElementById('modal-texto').innerText = texto;
    document.getElementById('modal-mensagem').style.display = 'flex';
}
function fecharModalMensagem() {
    document.getElementById('modal-mensagem').style.display = 'none';
}

function abrirModalExclusao(id) {
    idParaExcluir = id;
    document.getElementById('modal-confirmacao').style.display = 'flex';
}
function fecharModalConfirmacao() {
    document.getElementById('modal-confirmacao').style.display = 'none';
    idParaExcluir = null;
}

document.getElementById('btn-confirmar-sim').addEventListener('click', async () => {
    if (idParaExcluir) {
        try {
            await fetch(`${API_URL}/${idParaExcluir}`, { method: 'DELETE' });
            fecharModalConfirmacao();
            carregarLivros();
        } catch (erro) {
            mostrarMensagem("Erro ao excluir.");
        }
    }
});

window.onload = carregarLivros;