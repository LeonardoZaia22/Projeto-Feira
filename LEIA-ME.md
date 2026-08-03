# Sistema Feira Tech — ETEC Maria Cristina Medeiros

## ✅ O que foi corrigido e implementado

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
