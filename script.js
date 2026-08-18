const API_LIVROS = "http://localhost:8080/api/livros";
const API_AUTH = "http://localhost:8080/auth";

function getCabecalhoAuth() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// --- NAVEGAÇÃO DE TELAS ---
function mostrarTela(tela) {
    document.getElementById('section-login').style.display = 'none';
    document.getElementById('section-cadastro').style.display = 'none';
    document.getElementById('section-recuperar').style.display = 'none';
    
    if (tela === 'login') document.getElementById('section-login').style.display = 'block';
    if (tela === 'cadastro') document.getElementById('section-cadastro').style.display = 'block';
    if (tela === 'recuperar') document.getElementById('section-recuperar').style.display = 'block';
}

// --- SISTEMA DE MODAIS ---
function mostrarMensagem(texto) {
    document.getElementById('modal-texto').innerText = texto;
    document.getElementById('modal-mensagem').style.display = 'flex';
}
function fecharModalMensagem() {
    document.getElementById('modal-mensagem').style.display = 'none';
}

// --- LÓGICA DE CADASTRO ---
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_SENHA = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

function validarCadastroUsuario() {
    let temErro = false;
    document.querySelectorAll('.input-erro').forEach(el => el.classList.remove('input-erro'));

    const idade = parseInt(document.getElementById('cad-idade').value);
    const email = document.getElementById('cad-email').value.trim();
    const senha = document.getElementById('cad-senha').value;

    if (!idade || idade < 1) {
        document.getElementById('cad-idade').classList.add('input-erro');
        temErro = true;
    }
    if (!REGEX_EMAIL.test(email)) {
        document.getElementById('cad-email').classList.add('input-erro');
        temErro = true;
    }
    if (!REGEX_SENHA.test(senha)) {
        document.getElementById('cad-senha').classList.add('input-erro');
        mostrarMensagem("A senha deve ter no mínimo 8 caracteres, incluindo letras, números e símbolos.");
        temErro = true;
    }
    return !temErro;
}

document.getElementById('form-cadastro').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!validarCadastroUsuario()) return;

    const novoUsuario = {
        nome: document.getElementById('cad-nome').value,
        idade: parseInt(document.getElementById('cad-idade').value),
        email: document.getElementById('cad-email').value,
        login: document.getElementById('cad-login').value,
        senha: document.getElementById('cad-senha').value
    };

    try {
        const resposta = await fetch(`${API_AUTH}/cadastro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoUsuario)
        });

        if (resposta.ok) {
            mostrarMensagem("Conta criada com sucesso! Você já pode fazer login.");
            document.getElementById('form-cadastro').reset();
            mostrarTela('login');
        } else {
            const erroJson = await resposta.json();
            mostrarMensagem(erroJson.erro || "Erro ao cadastrar.");
        }
    } catch (erro) {
        mostrarMensagem("Erro ao conectar ao servidor.");
    }
});

// --- LÓGICA DE LOGIN ---
document.getElementById('form-login').addEventListener('submit', async function(e) {
    e.preventDefault();
    const login = document.getElementById('login-user').value;
    const senha = document.getElementById('login-senha').value;
    
    // Verifica se o checkbox existe antes de pegar o valor (evita erro se algo der errado no HTML)
    const checkboxLembrar = document.getElementById('lembrar-credenciais');
    const lembrar = checkboxLembrar ? checkboxLembrar.checked : false;

    try {
        const resposta = await fetch(`${API_AUTH}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, senha })
        });

        if (resposta.ok) {
            const textoResposta = await resposta.text();
            console.log("Resposta do Java:", textoResposta);
            
            let tokenRecebido = "";
            
            try {
                const dados = JSON.parse(textoResposta);
                tokenRecebido = dados.token || textoResposta; // Salva o token
            } catch (erroParse) {
                tokenRecebido = textoResposta; 
            }

            if (tokenRecebido && tokenRecebido.length > 20) {
                localStorage.setItem('token', tokenRecebido); // Salva o JWT no navegador
                
                // Lógica do Checkbox: Salva ou remove as credenciais
                if (lembrar) {
                    localStorage.setItem('salvarLogin', login);
                    localStorage.setItem('salvarSenha', senha);
                } else {
                    localStorage.removeItem('salvarLogin');
                    localStorage.removeItem('salvarSenha');
                }
                
                document.getElementById('auth-container').style.display = 'none';
                document.getElementById('app-container').style.display = 'block';
                document.getElementById('btn-sair').style.display = 'block';
                carregarLivros(); 
            } else {
                mostrarMensagem("Erro: O servidor não enviou um token válido!");
            }
        } else {
            mostrarMensagem("Usuário ou senha incorretos!");
        }
    } catch (erro) {
        console.error("O VERDADEIRO ERRO NO JS FOI:", erro);
        mostrarMensagem("Erro ao processar o login. Olhe a aba Console no F12.");
    }
});

// --- LÓGICA DE LOGOUT ---
document.getElementById('btn-sair').addEventListener('click', function() {
    localStorage.removeItem('token'); // Deleta o token
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('auth-container').style.display = 'block';
    this.style.display = 'none';
    mostrarTela('login');
});

// --- VERIFICAR SE JÁ ESTÁ LOGADO AO ABRIR A PÁGINA ---
window.onload = function() {
    const token = localStorage.getItem('token');
    if (token) {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        document.getElementById('btn-sair').style.display = 'block';
        carregarLivros();
    } else {
        mostrarTela('login');

        const loginSalvo = localStorage.getItem('salvarLogin');
        const senhaSalva = localStorage.getItem('salvarSenha');
        
        if (loginSalvo && senhaSalva) {
            document.getElementById('login-user').value = loginSalvo;
            document.getElementById('login-senha').value = senhaSalva;
            document.getElementById('lembrar-credenciais').checked = true;
        }
    }   
};

// ==========================================
// LÓGICA DE LIVROS (AGORA PROTEGIDA POR JWT)
// ==========================================

let livrosGlobais = [];
let livrosFiltrados = [];
let ordemCrescente = true;
let idParaExcluir = null;

const statusSelect = document.getElementById('status');
const divAvaliacao = document.getElementById('div-avaliacao');

statusSelect.addEventListener('change', () => {
    if (statusSelect.value === 'Lido') divAvaliacao.style.display = 'block';
    else divAvaliacao.style.display = 'none';
});

async function carregarLivros() {
    try {
        const resposta = await fetch(API_LIVROS, { headers: getCabecalhoAuth() });
        
        if (resposta.status === 403) {
            // Se o token expirou, desloga o usuário
            document.getElementById('btn-sair').click();
            mostrarMensagem("Sua sessão expirou. Faça login novamente.");
            return;
        }

        livrosGlobais = await resposta.json();
        livrosFiltrados = [...livrosGlobais];
        renderizarTabela(livrosFiltrados);
    } catch (erro) {
        console.error(erro);
    }
}

function renderizarTabela(livros) {
    const listaCorpo = document.getElementById('lista-corpo');
    listaCorpo.innerHTML = ""; 
    livros.forEach(livro => {
        const paginas = livro.paginas ? livro.paginas : '-';
        const ano = livro.anoPublicacao ? livro.anoPublicacao : '-';
        const nota = (livro.status === 'Lido' && livro.avaliacao) ? '⭐'.repeat(livro.avaliacao) : '-';
        const imagem = livro.urlCapa ? `<img src="${livro.urlCapa}" class="capa-miniatura" alt="Capa">` : 'Sem capa';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${livro.titulo}</td>
            <td>${livro.autor}</td>
            <td>${imagem}</td>
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

document.getElementById('form-livro').addEventListener('submit', async function(evento) {
    evento.preventDefault(); 
    
    const id = document.getElementById('livro-id').value;
    const livroDados = {
        titulo: document.getElementById('titulo').value,
        autor: document.getElementById('autor').value,
        urlCapa: document.getElementById('urlCapa').value || null,
        status: statusSelect.value,
        paginas: document.getElementById('paginas').value ? parseInt(document.getElementById('paginas').value) : null,
        anoPublicacao: document.getElementById('ano').value ? parseInt(document.getElementById('ano').value) : null,
        avaliacao: document.getElementById('avaliacao').value ? parseInt(document.getElementById('avaliacao').value) : null
    };

    let metodo = id ? 'PUT' : 'POST';
    let urlFinal = id ? `${API_LIVROS}/${id}` : API_LIVROS;

    try {
        const resposta = await fetch(urlFinal, {
            method: metodo,
            headers: getCabecalhoAuth(), // JWT AQUI!
            body: JSON.stringify(livroDados)
        });

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

function prepararEdicao(id) {
    const livro = livrosGlobais.find(l => l.id === id);
    document.getElementById('livro-id').value = livro.id;
    document.getElementById('titulo').value = livro.titulo;
    document.getElementById('autor').value = livro.autor;
    document.getElementById('urlCapa').value = livro.urlCapa || '';
    document.getElementById('paginas').value = livro.paginas || '';
    document.getElementById('ano').value = livro.anoPublicacao || '';
    statusSelect.value = livro.status;
    
    if (livro.status === 'Lido') {
        divAvaliacao.style.display = 'block';
        document.getElementById('avaliacao').value = livro.avaliacao || '';
    } else {
        divAvaliacao.style.display = 'none';
    }

    document.getElementById('form-titulo').innerText = "Editar Livro";
    document.getElementById('btn-salvar').innerText = "Atualizar Livro";
    document.getElementById('btn-cancelar').style.display = "inline-block";
}

function limparFormulario() {
    document.getElementById('form-livro').reset();
    document.getElementById('livro-id').value = '';
    divAvaliacao.style.display = 'none';
    document.getElementById('form-titulo').innerText = "Adicionar Novo Livro";
    document.getElementById('btn-salvar').innerText = "Salvar Livro";
    document.getElementById('btn-cancelar').style.display = "none";
}
document.getElementById('btn-cancelar').addEventListener('click', limparFormulario);

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
            await fetch(`${API_LIVROS}/${idParaExcluir}`, { 
                method: 'DELETE',
                headers: getCabecalhoAuth() // JWT AQUI TAMBÉM!
            });
            fecharModalConfirmacao();
            carregarLivros();
        } catch (erro) {
            mostrarMensagem("Erro ao excluir.");
        }
    }
});

// Ordenação e Pesquisa
function ordenar(campo) {
    livrosFiltrados.sort((a, b) => {
        let valorA = a[campo].toLowerCase();
        let valorB = b[campo].toLowerCase();
        if (valorA < valorB) return ordemCrescente ? -1 : 1;
        if (valorA > valorB) return ordemCrescente ? 1 : -1;
        return 0;
    });
    ordemCrescente = !ordemCrescente; 
    renderizarTabela(livrosFiltrados);
}

document.getElementById('campo-pesquisa').addEventListener('input', function() {
    const termo = this.value.toLowerCase();
    livrosFiltrados = livrosGlobais.filter(livro => 
        livro.titulo.toLowerCase().includes(termo) || 
        livro.autor.toLowerCase().includes(termo)
    );
    renderizarTabela(livrosFiltrados);
});