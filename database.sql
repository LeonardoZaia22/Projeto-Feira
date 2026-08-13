-- --------------------------------------------------------
-- Banco de dados: feira_tech_mcm
-- Sistema Feira Tecnológica — ETEC Maria Cristina Medeiros
-- --------------------------------------------------------
CREATE DATABASE IF NOT EXISTS feira_tech_mcm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE feira_tech_mcm;

-- --------------------------------------------------------
-- Tabela: usuarios
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id VARCHAR(50) PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','professor','aluno','visitante') NOT NULL,
  curso VARCHAR(50),
  turma VARCHAR(20),
  telefone VARCHAR(20),
  bio TEXT,
  avatar LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Tabela: categorias
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorias (
  id VARCHAR(50) PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  cor ENUM('green','blue','orange') DEFAULT 'green',
  icone VARCHAR(20) DEFAULT 'cpu'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Tabela: professores
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS professores (
  id VARCHAR(50) PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  curso VARCHAR(50) NOT NULL,
  avatar VARCHAR(10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Tabela: stands
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS stands (
  id VARCHAR(50) PRIMARY KEY,
  codigo VARCHAR(10) NOT NULL,
  pos_x INT NOT NULL,
  pos_y INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Tabela: projetos
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS projetos (
  id VARCHAR(50) PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  resumo VARCHAR(255) NULL,
  descricao TEXT NULL,
  objetivos JSON,
  tecnologias JSON,
  categoria_id VARCHAR(50) NULL,
  curso VARCHAR(50) NOT NULL,
  turma VARCHAR(20) NOT NULL,
  periodo ENUM('manha','tarde','noite') NOT NULL DEFAULT 'manha',
  professor_id VARCHAR(50) NULL,
  equipe JSON,
  stand_id VARCHAR(50),
  criado_por VARCHAR(50) NULL,
  status ENUM('aprovado','pendente','reprovado') DEFAULT 'aprovado',
  imagem VARCHAR(10) DEFAULT '💡',
  capa LONGTEXT NULL,
  votos INT DEFAULT 0,
  created_at DATE NOT NULL,
  github VARCHAR(255),
  site VARCHAR(255),
  ods VARCHAR(120) NULL,
  links TEXT NULL,
  qr_link TEXT NULL,
  qr_code LONGTEXT NULL,
  documento LONGTEXT NULL,
  senha_acesso VARCHAR(255) NULL,
  membros JSON NULL,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
  FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE SET NULL,
  FOREIGN KEY (stand_id) REFERENCES stands(id) ON DELETE SET NULL,
  FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Tabela: noticias
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS noticias (
  id VARCHAR(50) PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  autor VARCHAR(100) NOT NULL,
  data DATE NOT NULL,
  resumo TEXT NOT NULL,
  comentarios INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Tabela: cronograma
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS cronograma (
  id VARCHAR(50) PRIMARY KEY,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  local VARCHAR(100) NOT NULL,
  status ENUM('agendado','concluido','cancelado') DEFAULT 'agendado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Tabela: avaliacoes
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS avaliacoes (
  id VARCHAR(50) PRIMARY KEY,
  projeto_id VARCHAR(50) NOT NULL,
  professor_id VARCHAR(50) NOT NULL,
  criterios JSON NOT NULL,
  comentario TEXT,
  FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE,
  FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Tabela: comentarios
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS comentarios (
  id VARCHAR(50) PRIMARY KEY,
  projeto_id VARCHAR(50) NOT NULL,
  usuario_id VARCHAR(50) NOT NULL,
  texto TEXT NOT NULL,
  data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Tabela: votos
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS votos (
  usuario_id VARCHAR(50) NOT NULL,
  projeto_id VARCHAR(50) NOT NULL,
  data_voto TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id, projeto_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Tabela: notificacoes
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS notificacoes (
  id VARCHAR(50) PRIMARY KEY,
  usuario_id VARCHAR(50) NOT NULL,
  titulo VARCHAR(100) NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT FALSE,
  data DATE NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Tabela: logs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS logs (
  id VARCHAR(50) PRIMARY KEY,
  usuario VARCHAR(100) NOT NULL,
  acao VARCHAR(255) NOT NULL,
  data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Tabela: oficinas
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS oficinas (
  id VARCHAR(50) PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT NOT NULL,
  instrutor VARCHAR(100) NOT NULL,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  local VARCHAR(100) NOT NULL,
  vagas INT NOT NULL,
  votos INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Tabela: inscricoes_oficinas
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS inscricoes_oficinas (
  usuario_id VARCHAR(50) NOT NULL,
  oficina_id VARCHAR(50) NOT NULL,
  data_inscricao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id, oficina_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (oficina_id) REFERENCES oficinas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Tabela: oficina_votos
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS oficina_votos (
  usuario_id VARCHAR(50) PRIMARY KEY,
  oficina_id VARCHAR(50) NOT NULL,
  data_voto TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (oficina_id) REFERENCES oficinas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Inserção de dados iniciais
-- --------------------------------------------------------
-- --------------------------------------------------------
-- MIGRAÇÃO: se o banco já existia antes desta atualização,
-- rode a linha abaixo para adicionar a coluna de capa do projeto
-- (se a tabela projetos acabou de ser criada pelo script acima,
-- a coluna já existe e esta linha pode ser ignorada).
-- --------------------------------------------------------
ALTER TABLE projetos ADD COLUMN IF NOT EXISTS capa LONGTEXT NULL AFTER imagem;

INSERT INTO categorias (id, nome, cor) VALUES
('c1','Inteligência Artificial','blue'),
('c2','Sustentabilidade','green'),
('c3','Robótica','blue'),
('c4','IoT & Automação','blue'),
('c5','Saúde Digital','blue'),
('c6','Energias Renováveis','green');

INSERT INTO professores (id, nome, curso, avatar) VALUES
('t1','Profa. Marina Souza','Informática para Internet','MS'),
('t2','Prof. Ricardo Nunes','Qualidade','RN'),
('t3','Profa. Bianca Alves','Química','BA'),
('t4','Prof. Diego Fontes','Administração','DF'),
('t5','Profa. Renata Lima','Logística','RL'),
('t6','Prof. Otávio Prado','Recursos Humanos','OP');

INSERT INTO stands (id, codigo, pos_x, pos_y) VALUES
('e1','A1',12,18),('e2','A2',12,38),('e3','A3',12,58),
('e4','B1',34,18),('e5','B2',34,38),('e6','B3',34,58),
('e7','C1',56,18),('e8','C2',56,38),('e9','C3',56,58),
('e10','D1',78,18),('e11','D2',78,38),('e12','D3',78,58);

INSERT INTO usuarios (id, nome, email, senha_hash, role, curso, turma, avatar) VALUES
('u1','Administrador Geral','admin@etecmcm.sp.gov.br','$2y$10$o0Zi3OzQ8bIVr.9fS3bwj.Eh8LzUyXK7T0B0jZrX1E5Q5F7x2O0yq','admin', NULL, NULL, 'AG'),
('u2','Marina Souza','marina.souza@etecmcm.sp.gov.br','$2y$10$o0Zi3OzQ8bIVr.9fS3bwj.Eh8LzUyXK7T0B0jZrX1E5Q5F7x2O0yq','professor', NULL, NULL, 'MS'),
('u3','Lucas Andrade','lucas.andrade@etec.aluno.sp.gov.br','$2y$10$o0Zi3OzQ8bIVr.9fS3bwj.Eh8LzUyXK7T0B0jZrX1E5Q5F7x2O0yq','aluno','Informática para Internet','3ºDS-A','LA'),
('u4','Visitante','visitante@email.com','$2y$10$o0Zi3OzQ8bIVr.9fS3bwj.Eh8LzUyXK7T0B0jZrX1E5Q5F7x2O0yq','visitante', NULL, NULL, 'VI');

INSERT INTO projetos (id, nome, resumo, descricao, objetivos, tecnologias, categoria_id, curso, turma, periodo, professor_id, equipe, stand_id, criado_por, status, imagem, votos, created_at, github, site)
VALUES
('p1','EcoWatt — Monitor Inteligente de Energia','Dispositivo IoT que monitora consumo elétrico residencial em tempo real.','O EcoWatt é um sistema embarcado com ESP32 que coleta dados de consumo, envia para dashboard e sugere economia.','["Reduzir em até 18% o consumo","Democratizar dados de consumo","Consciência sustentável"]','["ESP32","Node.js","React","MQTT","PostgreSQL"]','c4','Informática para Internet','3ºDS-A','manha','t1','["Lucas Andrade","Beatriz Lima","João Pedro Reis"]','e1','u3','aprovado','⚡',0,'2026-03-02','https://github.com/exemplo/ecowatt','https://ecowatt.example.com');

INSERT INTO projetos (id, nome, resumo, descricao, objetivos, tecnologias, categoria_id, curso, turma, periodo, professor_id, equipe, stand_id, criado_por, status, imagem, votos, created_at, github, site)
VALUES
('p2','AgroSense — Irrigação Inteligente','Sistema com sensores de umidade para automação de irrigação em hortas urbanas.','AgroSense combina sensores de umidade, previsão do tempo e válvulas automatizadas para economia de água.','["Economizar até 40% de água","Aumentar produtividade","IoT aplicada à agricultura"]','["Arduino","Python","Sensores","LoRa"]','c6','Química','2ºQM-B','tarde','t3','["Ana Beatriz Costa","Rafael Torres"]','e2',NULL,'aprovado','🌱',0,'2026-02-20','https://github.com/exemplo/agrosense','');

INSERT INTO noticias (id, titulo, categoria, autor, data, resumo, comentarios) VALUES
('n1','Feira Tech 2026 abre inscrições de projetos','Institucional','Comunicação ETEC','2026-01-10','Já estão abertas as inscrições para a 8ª edição. Alunos podem submeter projetos até 20 de fevereiro.',0),
('n2','Votação popular já está disponível','Novidades','Equipe de Eventos','2026-03-15','A votação popular dos projetos e das oficinas já está aberta na plataforma.',0);

INSERT INTO cronograma (id, data, hora, titulo, local, status) VALUES
('s1','2026-04-06','08:00:00','Credenciamento e abertura oficial','Pátio Central','agendado'),
('s2','2026-04-06','09:30:00','Exposição de projetos — Manhã','Ginásio e Pátio','agendado'),
('s3','2026-04-06','13:30:00','Avaliação técnica dos professores','Estandes','agendado'),
('s4','2026-04-06','16:00:00','Palestra: IA aplicada à sustentabilidade','Auditório','agendado');

INSERT INTO oficinas (id, titulo, descricao, instrutor, data, hora, local, vagas, votos) VALUES
('o1','Introdução à Inteligência Artificial','Conceitos básicos de IA e exemplos práticos com Python.','Prof. Ricardo Nunes','2026-04-06','10:00:00','Sala 101',30,0),
('o2','Sustentabilidade na Prática','Projetos sustentáveis e como aplicá-los no dia a dia.','Profa. Bianca Alves','2026-04-06','14:00:00','Sala 102',25,0);
