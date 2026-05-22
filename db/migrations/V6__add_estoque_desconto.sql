ALTER TABLE produtos
  ADD COLUMN IF NOT EXISTS quantidade_estoque INTEGER NOT NULL DEFAULT 0;

ALTER TABLE vendas
  ADD COLUMN IF NOT EXISTS desconto NUMERIC(15,2) NOT NULL DEFAULT 0;

-- Função para decrementar estoque de forma atômica
CREATE OR REPLACE FUNCTION decrement_stock(p_produto_id INTEGER, p_quantidade INTEGER)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE produtos
  SET quantidade_estoque = quantidade_estoque - p_quantidade
  WHERE id = p_produto_id;
END;
$$;
