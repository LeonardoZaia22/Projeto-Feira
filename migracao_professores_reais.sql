-- ============================================================
-- MIGRAÇÃO — Professores orientadores reais (período da tarde)
-- ============================================================
-- Só execute este arquivo se você JÁ TINHA o banco `feira_tech_mcm`
-- criado antes desta atualização. Se você importar o `database.sql`
-- novo do zero, NÃO precisa rodar esta migração — já vem tudo criado.
--
-- Como rodar: phpMyAdmin > selecione o banco feira_tech_mcm > aba SQL
-- > cole o conteúdo deste arquivo > Executar.
-- ============================================================

ALTER TABLE professores
  ADD COLUMN IF NOT EXISTS turma VARCHAR(20) NULL AFTER curso;

INSERT INTO professores (id, nome, curso, turma, avatar) VALUES
('tq1i','Profa. Marta','Química','1°I','MA'),
('tq2i','Profa. Juliana','Química','2°I','JU'),
('tq3i','Prof. Paulo','Química','3°I','PA'),
('tti1f','Prof. Bruno F','Informática para Internet','1°F','BF'),
('tti2f','Profa. Edilma','Informática para Internet','2°F','ED'),
('tti3f','Prof. Márcio','Informática para Internet','3°F','MC')
ON DUPLICATE KEY UPDATE nome = VALUES(nome), curso = VALUES(curso), turma = VALUES(turma), avatar = VALUES(avatar);
