CREATE TABLE produtos (
    id          SERIAL          PRIMARY KEY,
    descricao   VARCHAR(255)    NOT NULL,
    valor       NUMERIC(15, 2)  NOT NULL
);
