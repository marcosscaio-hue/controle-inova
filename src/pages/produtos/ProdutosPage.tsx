import { useState } from 'react'
import { Package, Plus, Search, SlidersHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  useProdutos,
  useCreateProduto,
  useUpdateProduto,
  useDeleteProduto,
  type Produto,
} from '@/hooks/useProdutos'
import ProdutoModal, { type ProdutoInput } from '@/components/produtos/ProdutoModal'

const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

export default function ProdutosPage() {
  const { data: produtos = [], isLoading } = useProdutos()
  const createProduto = useCreateProduto()
  const updateProduto = useUpdateProduto()
  const deleteProduto = useDeleteProduto()

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Produto | null>(null)

  const filtered = produtos.filter((p) =>
    p.descricao.toLowerCase().includes(search.toLowerCase())
  )

  const openNew = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (p: Produto) => { setEditing(p); setModalOpen(true) }

  const handleSave = (data: ProdutoInput, id?: number) => {
    if (id != null) {
      updateProduto.mutate({ id, data })
    } else {
      createProduto.mutate(data)
    }
  }

  return (
    <>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Produtos</h1>
            <p className="text-sm text-zinc-400 mt-1">Gerencie o cadastro de produtos</p>
          </div>
          <Button
            onClick={openNew}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            <Plus size={15} />
            Novo Produto
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 rounded-lg bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 transition-colors">
            <SlidersHorizontal size={14} />
            Filtros
          </button>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/70">
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider w-16">#</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Descrição</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Valor</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Criado em</th>
                <th className="px-5 py-3.5 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-sm text-zinc-400">
                    Carregando...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((produto) => (
                  <tr key={produto.id} className="group hover:bg-zinc-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-zinc-400 font-mono tabular-nums">
                      {String(produto.id).padStart(3, '0')}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-zinc-800">
                      {produto.descricao}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-zinc-600 tabular-nums">
                      {formatBRL(produto.valor)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        produto.status
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${produto.status ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                        {produto.status ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-zinc-400">
                      {formatDate(produto.data_criacao)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(produto)}
                          title="Editar"
                          className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deleteProduto.mutate(produto.id)}
                          title="Excluir"
                          className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                        <Package size={26} className="text-zinc-300" />
                      </div>
                      <p className="text-sm font-medium text-zinc-600">
                        {search ? 'Nenhum resultado encontrado' : 'Nenhum produto cadastrado'}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1 mb-5">
                        {search ? `Sem produtos com "${search}"` : 'Clique em "Novo Produto" para começar'}
                      </p>
                      {!search && (
                        <Button size="sm" onClick={openNew} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                          <Plus size={14} />
                          Novo Produto
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProdutoModal
        open={modalOpen}
        produto={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </>
  )
}
