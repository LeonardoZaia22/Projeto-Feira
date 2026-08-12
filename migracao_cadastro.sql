-- ============================================================
-- MIGRAÇÃO — Nova página de Cadastro de Projeto
-- ============================================================
-- Só execute este arquivo se você JÁ TINHA o banco `feira_tech_mcm`
-- criado antes desta atualização (ou seja, se você importar o
-- `database.sql` novo do zero, NÃO precisa rodar este arquivo —
-- as colunas abaixo já vêm criadas nele).
--
-- Como rodar: phpMyAdmin > selecione o banco feira_tech_mcm > aba SQL
-- > cole o conteúdo deste arquivo > Executar.
-- ============================================================

ALTER TABLE projetos
  ADD COLUMN ods VARCHAR(120) NULL AFTER site,
  ADD COLUMN links TEXT NULL AFTER ods,
  ADD COLUMN documento LONGTEXT NULL AFTER links,
  ADD COLUMN senha_acesso VARCHAR(255) NULL AFTER documento,
  ADD COLUMN membros JSON NULL AFTER senha_acesso;
