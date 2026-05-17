ALTER TABLE produtos
    ADD COLUMN status          BOOLEAN                     NOT NULL DEFAULT TRUE,
    ADD COLUMN data_criacao    TIMESTAMP WITH TIME ZONE    NOT NULL DEFAULT NOW(),
    ADD COLUMN data_alteracao  TIMESTAMP WITH TIME ZONE;

CREATE OR REPLACE FUNCTION fn_atualizar_data_alteracao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_alteracao = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_produtos_data_alteracao
    BEFORE UPDATE ON produtos
    FOR EACH ROW
    EXECUTE FUNCTION fn_atualizar_data_alteracao();
