import { create } from 'zustand'

export type Produto = {
  id: number
  descricao: string
  valor: number
  status: boolean
  data_criacao: Date
}

export type ProdutoInput = {
  descricao: string
  valor: number
  status: boolean
}

export type VendaItem = {
  produto_id: number
  descricao: string
  valor_unit: number
  quantidade: number
  valor_total: number
}

export type Venda = {
  id: number
  data_venda: Date
  data_alteracao_venda?: Date
  valor_total: number
  itens: VendaItem[]
}

type AppStore = {
  _pid: number
  produtos: Produto[]
  addProduto: (data: ProdutoInput) => void
  updateProduto: (id: number, data: ProdutoInput) => void
  deleteProduto: (id: number) => void

  _vid: number
  vendas: Venda[]
  addVenda: (itens: VendaItem[]) => void
  deleteVenda: (id: number) => void
}

export const useStore = create<AppStore>((set) => ({
  _pid: 1,
  produtos: [],

  addProduto: (data) =>
    set((s) => ({
      produtos: [...s.produtos, { id: s._pid, ...data, data_criacao: new Date() }],
      _pid: s._pid + 1,
    })),

  updateProduto: (id, data) =>
    set((s) => ({
      produtos: s.produtos.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),

  deleteProduto: (id) =>
    set((s) => ({ produtos: s.produtos.filter((p) => p.id !== id) })),

  _vid: 1,
  vendas: [],

  addVenda: (itens) =>
    set((s) => ({
      vendas: [
        ...s.vendas,
        {
          id: s._vid,
          data_venda: new Date(),
          valor_total: itens.reduce((acc, i) => acc + i.valor_total, 0),
          itens,
        },
      ],
      _vid: s._vid + 1,
    })),

  deleteVenda: (id) =>
    set((s) => ({ vendas: s.vendas.filter((v) => v.id !== id) })),
}))
