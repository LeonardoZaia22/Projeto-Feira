# Sistema Feira Tech — ETEC Maria Cristina Medeiros

## 🆕 Atualização — Cadastro de Projeto em página própria + chave/senha de equipe

### 🎨 Visual
- Paleta trocada de verde para vermelho em todo o site (botões, links,
  badges, gráfico do ranking, logo). Continua fácil de ajustar depois: os
  tons ficam nas variáveis `--green-900` a `--green-50` no topo do
  `style.css` (o nome da variável não mudou para não quebrar o resto do
  código, só os valores de cor).
- Mais efeitos: brilho passando nos botões ao passar o mouse, glow
  vermelho nos cards, sublinhado animado no menu, texto do topo com
  gradiente animado, animação de "sucesso" no modal pós-cadastro.

### 📝 Cadastro de projeto agora é uma página só para isso
- Antes o formulário ficava dentro da Área do Aluno. Agora existe a rota
  `#/cadastro-projeto`, com os campos na mesma ordem do print de
  referência: Nome*, ODS, Descrição* (mínimo 100 / máximo 1000
  caracteres, com contador ao vivo), Período + Turma, Professor
  orientador*, Links, upload de Imagem principal e de Documentação.
- **"Salvar Rascunho"** guarda os campos preenchidos no navegador
  (localStorage), não no banco — ao reabrir a página de cadastro nesse
  mesmo aparelho/navegador, os campos voltam preenchidos. Não sincroniza
  entre dispositivos.
- O **curso** do aluno não aparece no formulário (ele é obrigatório no
  banco, mas vem sozinho do perfil do aluno). Como o cadastro de conta
  hoje não pede curso, se o aluno ainda não tiver preenchido isso no
  perfil, a página de cadastro pede pra completar o perfil primeiro, com
  um botão direto para lá — evita cair num erro no meio do formulário.
- Período e Turma ficaram opcionais (sem asterisco no print de
  referência); se não forem preenchidos, o período vira "manhã" por
  padrão.

### 🔑 Chave e senha para a equipe
- Ao clicar em **"Enviar para Aprovação"**, o projeto é criado (continua
  sendo publicado direto, sem fila de aprovação, como já era) e o sistema
  gera:
  - uma **chave** = o próprio id do projeto no banco;
  - uma **senha aleatória** de 8 caracteres.
- Aparece um modal de sucesso mostrando os dois valores (com botão de
  copiar) e um aviso de que a senha não pode ser recuperada depois — ela
  é guardada só com hash (`password_hash`) no banco, igual à senha de
  login dos usuários.
- **Botão "Encontrar meu projeto"**, ao lado de "Cadastrar Projeto" no
  catálogo: abre um modal onde qualquer pessoa digita a chave + senha.
  Encontrando o projeto, aparece um botão para **ver o projeto** e,
  se a pessoa estiver logada como aluno, outro para **entrar como
  integrante** — isso adiciona o id dela numa lista de membros do
  projeto (coluna `membros`, sem afetar quem é o "criador"/dono
  original). Na Área do Aluno, "Meus projetos" agora mostra também os
  projetos em que a pessoa entrou como integrante, com um selo
  "Integrante" (só quem criou o projeto pode editar/excluir).

### ⚙️ Back-end
- `api/projects/create.php`: reescrito para gerar chave/senha e salvar
  os novos campos (`ods`, `links`, `documento`).
- `api/projects/find.php` e `api/projects/join.php`: novos endpoints
  para o fluxo de "Encontrar meu projeto".
- `api/teachers.php`: **novo** — antes não existia nenhum endpoint para
  listar professores, então o campo "Professor orientador" não tinha
  como funcionar; agora existe e alimenta o select do cadastro.
- `api/projects/list.php` e `detail.php`: nunca mais devolvem o hash da
  senha de acesso; `list.php` também não devolve mais o arquivo de
  documentação (evita respostas gigantes ao listar o catálogo — o
  arquivo só é necessário na página do projeto).
- A imagem de capa e o documento anexado continuam salvos como base64
  direto no banco (`LONGTEXT`), do mesmo jeito que a capa e a foto de
  perfil já funcionavam — simples de manter, mas vale saber que não é o
  ideal para arquivos muito grandes ou em produção de verdade.

### 🗄️ Banco de dados
- Se você importar o `database.sql` **do zero**, as colunas novas já
  vêm criadas.
- Se você **já tinha o banco criado antes desta atualização**, rode o
  arquivo `migracao_cadastro.sql` no phpMyAdmin (aba SQL) para adicionar
  as colunas novas na tabela `projetos` sem perder os dados existentes.

---

## ✅ O que foi corrigido e implementado (entrega anterior)


### 🐞 Bugs críticos (causa raiz da votação/cadastro não funcionarem)
1. **Caminho errado para o banco de dados em quase todos os endpoints.**
   Os arquivos `categories.php`, `comments.php`, `enroll.php`, `evaluation.php`,
   `logs.php`, `news.php`, `notifications.php`, `notifications_read.php`,
   `offices.php`, `schedule.php` e `users.php` chamavam
   `require_once '../config/database.php'`, mas como esses arquivos estão na
   raiz de `api/` (não numa subpasta), o caminho correto é
   `require_once 'config/database.php'`. Isso quebrava o PHP com um erro fatal,
   e o front-end silenciosamente caía para dados fictícios em memória (nunca
   salvos no banco). **Esse era o motivo real da votação e dos cadastros não
   funcionarem.**
2. **Pasta `api/projetcts` com nome digitado errado** — renomeada para
   `api/projects`, que é o nome que o JavaScript já chamava.
3. **Arquivo `api/coments.php` com nome errado** — renomeado para
   `api/comments.php`.
4. **`notifications_read.php` sem a tag de abertura `<?php`**, o que quebrava
   a resposta JSON.
5. **Descompasso de nomes de campos** entre o banco (`nome`, `votos`,
   `categoria_id`, `resumo`...) e o front-end (`name`, `votes`, `category`,
   `summary`...). Foi criada uma camada de normalização em `script.js` que
   converte corretamente projetos, categorias, usuários, notícias, cronograma
   e notificações vindos do banco para o formato que a interface espera.
6. **Faltava a tabela `comentarios`** no banco, embora o endpoint de
   comentários já a utilizasse.
7. **Charset da conexão PDO era `utf8` (não `utf8mb4`)**, o que corta emojis
   (usados nos ícones dos projetos) — corrigido para `utf8mb4`.
8. **Comentários eram salvos no banco mas nunca eram exibidos** — o endpoint
   de detalhe do projeto sempre retornava `comments: []` fixo no código, então
   ninguém via os comentários de outras pessoas ao abrir o projeto (só quem
   tinha acabado de comentar via a atualização otimista da própria tela).
   Corrigido: agora existe uma consulta real que busca os comentários salvos,
   com o nome (e foto, se houver) de quem comentou, ordenados do mais recente
   para o mais antigo.

### 💬 Comentários (agora 100% persistentes)
- Qualquer comentário publicado é salvo na tabela `comentarios` no banco.
- Ao abrir a página de um projeto, os comentários são buscados do banco e
  aparecem para **qualquer pessoa** que acesse aquele projeto depois — não
  só para quem comentou.
- O nome e a foto de perfil de quem comentou aparecem junto ao comentário.

### ✏️ Edição/remoção do próprio projeto
- Na Área do Aluno (e também no Perfil), cada projeto cadastrado pelo aluno
  agora tem um botão de **editar** (✏️) e um de **excluir** (🗑️).
- O botão de editar abre um formulário com todos os dados do projeto
  pré-preenchidos; ao salvar, as alterações são gravadas no banco.
- Tanto editar quanto excluir são **protegidos no servidor**: mesmo que
  alguém tente manipular a requisição, só o aluno que criou o projeto
  consegue alterá-lo ou removê-lo.

### 🎓 Área do Aluno (100% funcional agora)
- **Criar conta:** o aluno se cadastra escolhendo o perfil "Aluno", os dados
  são salvos permanentemente no banco (`usuarios`).
- **Login:** autenticação real contra o banco, com sessão persistente — a
  sessão sobrevive a um recarregamento da página (antes, o login era perdido
  ao dar F5).
- **Cadastrar projeto:** o aluno informa apenas o **nome do projeto**, a
  **turma**, o **curso** (lista oficial: Informática para Internet, Química,
  Logística, Recursos Humanos, Administração, Qualidade) e o **período**
  (manhã/tarde/noite). O projeto é **salvo direto no banco e publicado
  imediatamente no catálogo** — sem precisar de aprovação, como solicitado.
  Campos extras (resumo, descrição, categoria, equipe, GitHub, site) são
  opcionais e ficam escondidos atrás de "+ Adicionar mais detalhes".
- **Votação em projetos:** todos os votos começam **zerados**. O aluno vê
  todos os projetos aprovados e vota; o voto é salvo no banco
  (`votos`), soma automaticamente e impede voto duplicado no mesmo projeto
  (agora restaurado corretamente após login/recarregamento).
- **Editar perfil com foto:** o aluno pode enviar uma foto de perfil (upload
  de imagem, convertida e salva no banco como base64); os dados pessoais
  (nome, e-mail, telefone, turma, curso, bio) e a senha também podem ser
  atualizados.
- **Oficinas — frequência + votação:** o aluno vê todas as oficinas, marca
  quais frequentou (isso fica salvo no banco), e só depois disso aparecem
  para ele as opções de votar na melhor entre as que frequentou (voto único,
  salvo no banco). Ele **não consegue votar em oficinas que não marcou como
  frequentadas**.

### 📋 Conforme o manual do projeto ("Perfil do Cliente")
Os seguintes itens do manual já estavam prontos ou foram completados nesta
entrega: autenticação completa (login, cadastro, recuperação de senha),
página inicial com banner/destaques/notícias, catálogo de projetos com busca
e filtros, detalhamento de projeto com fotos/equipe/professor/estande,
perfil do usuário com foto e histórico de participação, cadastro e
gerenciamento de projetos pelo aluno, votação popular com controle de voto
duplicado e apuração automática, e comunicação (notificações/avisos).

**Itens que continuam como próximos passos** (fora do escopo desta entrega,
que priorizou a Área do Aluno): a área do professor (avaliação técnica) e o
painel administrativo completo (aprovação de projetos, relatórios
estatísticos) ainda estão como estrutura inicial — posso implementá-los na
sequência, se desejar.

## ⚙️ Como instalar (XAMPP)

1. Copie a pasta `projeto_feira` inteira para `htdocs` do seu XAMPP.
2. Abra o **phpMyAdmin**, crie/importe o banco executando o arquivo
   `database.sql` (ele já cria o banco `feira_tech_mcm` e as tabelas).
   > Já tinha o banco criado antes desta atualização? Rode também o
   > `migracao_cadastro.sql` (aba SQL do phpMyAdmin) para adicionar as
   > colunas novas usadas pela página de Cadastro de Projeto.
3. Confirme em `api/config/database.php` que o usuário/senha do MySQL batem
   com o seu XAMPP (por padrão: usuário `root`, sem senha).
4. Acesse `http://localhost/projeto_feira/` no navegador.
   > A URL da API agora é detectada automaticamente, então funciona mesmo
   > se você renomear a pasta do projeto.
5. Contas de demonstração (senha para todas: `12345678`):
   - Admin: `admin@etecmcm.sp.gov.br`
   - Professor: `marina.souza@etecmcm.sp.gov.br`
   - Aluno: `lucas.andrade@etec.aluno.sp.gov.br`
   - Visitante: `visitante@email.com`
   Ou use os botões de "login rápido" na tela de entrada.
