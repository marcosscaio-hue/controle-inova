import { useState } from 'react'
import { X, Plus, Trash2, ShoppingCart, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProdutos } from '@/hooks/useProdutos'
import { useCreateVenda, type VendaItem } from '@/hooks/useVendas'

type Props = {
  open: boolean
  onClose: () => void
}

const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function VendaModal({ open, onClose }: Props) {
  const { data: produtos = [] } = useProdutos()
  const createVenda = useCreateVenda()

  const [selectedId, setSelectedId] = useState('')
  const [quantidade, setQuantidade] = useState('1')
  const [itens, setItens] = useState<VendaItem[]>([])
  const [inputError, setInputError] = useState('')

  const produtosAtivos = produtos.filter((p) => p.status)
  const total = itens.reduce((acc, i) => acc + i.valor_total, 0)
  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0)

  const handleAddItem = () => {
    const produto = produtosAtivos.find((p) => p.id === Number(selectedId))
    if (!produto) { setInputError('Selecione um produto'); return }
    const qty = parseInt(quantidade, 10)
    if (!qty || qty <= 0) { setInputError('Informe uma quantidade válida'); return }
    setInputError('')

    const existingIdx = itens.findIndex((i) => i.produto_id === produto.id)
    if (existingIdx >= 0) {
      setItens((prev) =>
        prev.map((item, idx) => {
          if (idx !== existingIdx) return item
          const novaQtd = item.quantidade + qty
          return { ...item, quantidade: novaQtd, valor_total: novaQtd * item.valor_unit }
        })
      )
    } else {
      setItens((prev) => [
        ...prev,
        {
          produto_id: produto.id,
          descricao: produto.descricao,
          valor_unit: produto.valor,
          quantidade: qty,
          valor_total: qty * produto.valor,
        },
      ])
    }
    setSelectedId('')
    setQuantidade('1')
  }

  const handleRemoveItem = (idx: number) => {
    setItens((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSave = () => {
    if (itens.length === 0) { setInputError('Adicione ao menos um produto antes de salvar'); return }
    createVenda.mutate(itens, { onSuccess: handleClose })
  }

  const handleClose = () => {
    setItens([])
    setSelectedId('')
    setQuantidade('1')
    setInputError('')
    onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh] overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <ShoppingCart size={16} className="text-indigo-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Nova Venda</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Adicione os produtos e quantidades</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/60 shrink-0">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Adicionar produto
          </p>
          <div className="flex gap-2">
            <select
              value={selectedId}
              onChange={(e) => { setSelectedId(e.target.value); setInputError('') }}
              className="flex-1 px-3.5 py-2.5 text-sm border border-zinc-200 rounded-lg bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            >
              <option value="">Selecione um produto...</option>
              {produtosAtivos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.descricao} — {formatBRL(p.valor)}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              placeholder="Qtd"
              className="w-20 px-3 py-2.5 text-sm border border-zinc-200 rounded-lg bg-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
            <button
              onClick={handleAddItem}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shrink-0"
            >
              <Plus size={15} />
              Adicionar
            </button>
          </div>
          {inputError && (
            <p className="flex items-center gap-1.5 text-xs text-rose-500 mt-2">
              <AlertCircle size={12} />
              {inputError}
            </p>
          )}
          {produtosAtivos.length === 0 && (
            <p className="text-xs text-amber-600 mt-2">
              Nenhum produto ativo disponível. Cadastre produtos ativos primeiro.
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {itens.length > 0 ? (
            <table className="w-full">
              <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_#f4f4f5]">
                <tr>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Produto</th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider w-20">Qtd</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Valor Unit.</th>
                  <th className="text-right px-5 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Total</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {itens.map((item, idx) => (
                  <tr key={idx} className="group hover:bg-zinc-50/60 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-zinc-800">{item.descricao}</td>
                    <td className="px-4 py-3 text-sm text-zinc-600 text-center tabular-nums">{item.quantidade}</td>
                    <td className="px-4 py-3 text-sm text-zinc-400 text-right tabular-nums">{formatBRL(item.valor_unit)}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-zinc-800 text-right tabular-nums">{formatBRL(item.valor_total)}</td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
                <ShoppingCart size={20} className="text-zinc-300" />
              </div>
              <p className="text-sm text-zinc-400">Nenhum produto adicionado ainda</p>
              <p className="text-xs text-zinc-300 mt-1">Use o seletor acima para montar a venda</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/60 flex items-center justify-between shrink-0">
          <div>
            <p className="text-xs text-zinc-400">
              {itens.length} {itens.length === 1 ? 'produto' : 'produtos'} · {totalItens}{' '}
              {totalItens === 1 ? 'item' : 'itens'}
            </p>
            <p className="text-xl font-bold text-zinc-900 mt-0.5">{formatBRL(total)}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2.5 text-sm font-medium text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              Cancelar
            </button>
            <Button
              onClick={handleSave}
              disabled={itens.length === 0 || createVenda.isPending}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40"
            >
              <ShoppingCart size={15} />
              {createVenda.isPending ? 'Salvando...' : 'Salvar Venda'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
