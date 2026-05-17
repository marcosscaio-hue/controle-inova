CREATE TABLE vendas (
    id                   SERIAL                      PRIMARY KEY,
    data_venda           TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW(),
    data_alteracao_venda TIMESTAMP WITH TIME ZONE,
    valor_total          NUMERIC(15, 2)              NOT NULL DEFAULT 0
);

CREATE TABLE venda_itens (
    id          SERIAL          PRIMARY KEY,
    venda_id    INTEGER         NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
    produto_id  INTEGER         NOT NULL REFERENCES produtos(id),
    quantidade  INTEGER         NOT NULL CHECK (quantidade > 0),
    valor_unit  NUMERIC(15, 2)  NOT NULL,
    valor_total NUMERIC(15, 2)  NOT NULL
);

CREATE OR REPLACE FUNCTION fn_atualizar_data_alteracao_venda()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_alteracao_venda = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vendas_data_alteracao
    BEFORE UPDATE ON vendas
    FOR EACH ROW
    EXECUTE FUNCTION fn_atualizar_data_alteracao_venda();
