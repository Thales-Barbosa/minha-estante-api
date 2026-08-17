# 📚 Minha Estante

Um sistema web completo (CRUD) desenvolvido para o gerenciamento de leituras pessoais. O projeto permite que os usuários cadastrem livros, atualizem seus status de leitura, excluam registros e realizem buscas dinâmicas na estante.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando a arquitetura **MVC (Model-View-Controller)**, separando claramente o back-end, banco de dados e front-end.

**Front-end (View):**
* HTML5 e CSS3
* JavaScript (Vanilla) - Consumo de API via `Fetch`

**Back-end (Controller & Model):**
* Java 17
* Spring Boot 3
* Maven

**Banco de Dados:**
* MySQL 8.0

## 📦 Dependências do Back-end (Spring Boot)
As seguintes dependências foram utilizadas no arquivo `pom.xml`:
* **Spring Web:** Para a criação dos endpoints RESTful (API).
* **Spring Data JPA:** Para a persistência de dados e mapeamento objeto-relacional (Hibernate).
* **MySQL Driver:** Para a conexão direta com o banco de dados.

## 🚀 Como Executar o Projeto

### Pré-requisitos
* Ter o **Java (JDK 17 ou superior)** instalado.
* Ter o **MySQL Server** instalado e rodando na sua máquina.
* Uma IDE de sua preferência (VS Code, IntelliJ, Eclipse).

### Passo 1: Configurar o Banco de Dados
1. Abra o seu gerenciador do MySQL (ex: MySQL Workbench).
2. Execute o script `minha-estante.sql` contido na raiz deste projeto para criar o banco de dados `minha_estante` e a tabela `livros`.

### Passo 2: Configurar o Back-end
1. Navegue até o arquivo de configuração do Spring Boot localizado em: `demo/src/main/resources/application.properties`.
2. Certifique-se de atualizar a senha do banco de dados na linha correspondente:
   ```properties
   spring.datasource.password=sua_senha_do_mysql_aqui

### Passo 3: Iniciar o Servidor Java
Abra o terminal na pasta do projeto Spring Boot (demo).

Execute o comando abaixo para iniciar o servidor:

No Windows: .\mvnw spring-boot:run

No Linux/Mac: ./mvnw spring-boot:run

Aguarde até que o terminal exiba a mensagem informando que o Tomcat iniciou na porta 8080.

### Passo 4: Executar o Front-end
Como o front-end foi feito em HTML, CSS e JS puros, não é necessário um servidor Node.js.
Basta dar um duplo clique no arquivo index.html na raiz do projeto para abri-lo no seu navegador de preferência. O front-end se conectará automaticamente à API Java rodando em localhost:8080.