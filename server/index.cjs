const express = require('express')
const { Pool, types } = require('pg')
const cors = require('cors')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') })

// Faz pg retornar NUMERIC como float, não string
types.setTypeParser(1700, parseFloat)

const useSsl = process.env.DB_SSL === 'true'

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
})

const app = express()
app.use(cors())
app.use(express.json())

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

// ─── PRODUTOS ──────────────────────────────────────────────────────────────

app.get('/api/produtos', wrap(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM produtos ORDER BY id')
  res.json(rows)
}))

app.post('/api/produtos', wrap(async (req, res) => {
  const { descricao, valor, status = true } = req.body
  const { rows } = await pool.query(
    'INSERT INTO produtos (descricao, valor, status) VALUES ($1, $2, $3) RETURNING *',
    [descricao, valor, status]
  )
  res.status(201).json(rows[0])
}))

app.put('/api/produtos/:id', wrap(async (req, res) => {
  const { descricao, valor, status } = req.body
  const { rows } = await pool.query(
    'UPDATE produtos SET descricao=$1, valor=$2, status=$3 WHERE id=$4 RETURNING *',
    [descricao, valor, status, req.params.id]
  )
  if (!rows.length) return res.status(404).json({ error: 'Produto não encontrado' })
  res.json(rows[0])
}))

app.delete('/api/produtos/:id', wrap(async (req, res) => {
  await pool.query('DELETE FROM produtos WHERE id=$1', [req.params.id])
  res.status(204).end()
}))

// ─── VENDAS ────────────────────────────────────────────────────────────────

const VENDAS_COM_ITENS = `
  SELECT
    v.*,
    COALESCE(
      json_agg(
        json_build_object(
          'id',          vi.id,
          'produto_id',  vi.produto_id,
          'descricao',   p.descricao,
          'quantidade',  vi.quantidade,
          'valor_unit',  vi.valor_unit::float,
          'valor_total', vi.valor_total::float
        ) ORDER BY vi.id
      ) FILTER (WHERE vi.id IS NOT NULL),
      '[]'
    ) AS itens
  FROM vendas v
  LEFT JOIN venda_itens vi ON vi.venda_id = v.id
  LEFT JOIN produtos p ON p.id = vi.produto_id
`

app.get('/api/vendas', wrap(async (req, res) => {
  const { rows } = await pool.query(VENDAS_COM_ITENS + 'GROUP BY v.id ORDER BY v.id DESC')
  res.json(rows)
}))

app.post('/api/vendas', wrap(async (req, res) => {
  const { itens } = req.body
  const valor_total = itens.reduce((acc, i) => acc + Number(i.valor_total), 0)

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows: [venda] } = await client.query(
      'INSERT INTO vendas (valor_total) VALUES ($1) RETURNING *',
      [valor_total]
    )
    for (const item of itens) {
      await client.query(
        'INSERT INTO venda_itens (venda_id, produto_id, quantidade, valor_unit, valor_total) VALUES ($1,$2,$3,$4,$5)',
        [venda.id, item.produto_id, item.quantidade, item.valor_unit, item.valor_total]
      )
    }
    await client.query('COMMIT')

    const { rows: [completa] } = await pool.query(
      VENDAS_COM_ITENS + 'WHERE v.id=$1 GROUP BY v.id',
      [venda.id]
    )
    res.status(201).json(completa)
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}))

app.delete('/api/vendas/:id', wrap(async (req, res) => {
  await pool.query('DELETE FROM vendas WHERE id=$1', [req.params.id])
  res.status(204).end()
}))

// ─── ERROR HANDLER ─────────────────────────────────────────────────────────

app.use((err, req, res, _next) => {
  console.error(err.message)
  res.status(500).json({ error: err.message })
})

const PORT = process.env.API_PORT || 3001
app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`))
