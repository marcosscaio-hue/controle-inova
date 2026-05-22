import { useState } from 'react'
import { Package, Plus, Search, SlidersHorizontal, Pencil, Trash2, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  useProdutos,
  useCreateProduto,
  useUpdateProduto,
  useDeleteProduto,
  type Produto,
} from '@/hooks/useProdutos'
import ProdutoModal, { type ProdutoInput } from '@/components/produtos/ProdutoModal'

const formatBRL = (value: number | null) =>
  value == null ? '—' : value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

type MenuPos = { top: number; right: number }

export default function ProdutosPage() {
  const { data: produtos = [], isLoading } = useProdutos()
  const createProduto = useCreateProduto()
  const updateProduto = useUpdateProduto()
  const deleteProduto = useDeleteProduto()

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Produto | null>(null)
  const [menuOpen, setMenuOpen] = useState<number | null>(null)
  const [menuPos, setMenuPos] = useState<MenuPos>({ top: 0, right: 0 })

  const filtered = produtos.filter((p) =>
    p.descricao.toLowerCase().includes(search.toLowerCase()) ||
    (p.marca ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const openNew = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (p: Produto) => { setEditing(p); setModalOpen(true); setMenuOpen(null) }
  const handleDelete = (id: number) => { deleteProduto.mutate(id); setMenuOpen(null) }

  const toggleMenu = (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
    e.stopPropagation()
    if (menuOpen === id) { setMenuOpen(null); return }
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    setMenuOpen(id)
  }

  const handleSave = (data: ProdutoInput, id?: number) => {
    if (id != null) {
      updateProduto.mutate({ id, data })
    } else {
      createProduto.mutate(data)
    }
  }

  return (
    <>
      {/* overlay + dropdown fixo fora de qualquer overflow */}
      {menuOpen !== null && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} />
          <div
            className="fixed z-50 bg-white rounded-lg shadow-lg border border-zinc-100 py-1 min-w-[130px]"
            style={{ top: menuPos.top, right: menuPos.right }}
          >
            {filtered.map((p) => p.id === menuOpen ? (
              <span key={p.id}>
                <button
                  onClick={() => openEdit(p)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <Pencil size={14} className="text-zinc-400" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 size={14} />
                  Excluir
                </button>
              </span>
            ) : null)}
          </div>
        </>
      )}

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-zinc-900 tracking-tight">Produtos</h1>
            <p className="text-sm text-zinc-400 mt-1">Gerencie o cadastro de produtos</p>
          </div>
          <Button
            onClick={openNew}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs text-xs md:text-sm"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Novo Produto</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar produto ou marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 rounded-lg bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 transition-colors">
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filtros</span>
          </button>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/70">
                  <th className="text-left px-4 md:px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Descrição</th>
                  <th className="hidden sm:table-cell text-left px-4 md:px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Marca</th>
                  <th className="hidden md:table-cell text-left px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Custo</th>
                  <th className="text-left px-4 md:px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Venda</th>
                  <th className="hidden sm:table-cell text-center px-4 md:px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Estoque</th>
                  <th className="text-left px-4 md:px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="hidden lg:table-cell text-left px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Criado em</th>
                  <th className="px-4 md:px-5 py-3.5 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center text-sm text-zinc-400">
                      Carregando...
                    </td>
                  </tr>
                ) : filtered.length > 0 ? (
                  filtered.map((produto) => (
                    <tr
                      key={produto.id}
                      className="hover:bg-zinc-50/50 transition-colors cursor-pointer select-none"
                      onDoubleClick={() => openEdit(produto)}
                    >
                      <td className="px-4 md:px-5 py-3.5 text-sm font-medium text-zinc-800">
                        {produto.descricao}
                      </td>
                      <td className="hidden sm:table-cell px-4 md:px-5 py-3.5 text-sm text-zinc-500">
                        {produto.marca || <span className="text-zinc-300">—</span>}
                      </td>
                      <td className="hidden md:table-cell px-5 py-3.5 text-sm text-zinc-500 tabular-nums">
                        {formatBRL(produto.preco_custo)}
                      </td>
                      <td className="px-4 md:px-5 py-3.5 text-sm text-zinc-600 tabular-nums">
                        {formatBRL(produto.valor)}
                      </td>
                      <td className="hidden sm:table-cell px-4 md:px-5 py-3.5 text-sm text-center tabular-nums">
                        <span className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-md text-xs font-semibold ${
                          produto.quantidade_estoque === 0
                            ? 'bg-rose-50 text-rose-600'
                            : produto.quantidade_estoque <= 5
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {produto.quantidade_estoque}
                        </span>
                      </td>
                      <td className="px-4 md:px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          produto.status
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${produto.status ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                          {produto.status ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-5 py-3.5 text-sm text-zinc-400">
                        {formatDate(produto.data_criacao)}
                      </td>

                      {/* Ações desktop — sempre visíveis */}
                      <td className="hidden md:table-cell px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEdit(produto) }}
                            title="Editar"
                            className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(produto.id) }}
                            title="Excluir"
                            className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>

                      {/* Três pontinhos mobile */}
                      <td className="md:hidden px-3 py-3.5">
                        <div className="flex justify-end">
                          <button
                            onClick={(e) => toggleMenu(e, produto.id)}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
                          >
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8}>
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
