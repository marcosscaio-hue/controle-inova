import { useState, useRef, useEffect } from 'react'
import { X, Plus, Trash2, ShoppingCart, AlertCircle, Tag, ChevronDown, PackageX } from 'lucide-react'
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
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [quantidade, setQuantidade] = useState('1')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  const [itens, setItens] = useState<VendaItem[]>([])
  const [inputError, setInputError] = useState('')
  const [descontoAtivo, setDescontoAtivo] = useState(false)
  const [descontoValor, setDescontoValor] = useState('')

  const produtosAtivos = produtos.filter((p) => p.status)

  const subtotal = itens.reduce((acc, i) => acc + i.valor_total, 0)
  const desconto = descontoAtivo ? Math.min(parseFloat(descontoValor) || 0, subtotal) : 0
  const total = subtotal - desconto
  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0)

  const estoqueDisponivel = (produtoId: number) => {
    const produto = produtos.find((p) => p.id === produtoId)
    if (!produto) return 0
    const noCarrinho = itens.filter((i) => i.produto_id === produtoId).reduce((a, i) => a + i.quantidade, 0)
    return produto.quantidade_estoque - noCarrinho
  }

  const semEstoque = produtosAtivos.length > 0 && produtosAtivos.every((p) => estoqueDisponivel(p.id) <= 0)
  const produtoSelecionado = produtosAtivos.find((p) => p.id === Number(selectedId))

  const handleAddItem = () => {
    const produto = produtosAtivos.find((p) => p.id === Number(selectedId))
    if (!produto) { setInputError('Selecione um produto'); return }
    const qty = parseInt(quantidade, 10)
    if (!qty || qty <= 0) { setInputError('Informe uma quantidade válida'); return }

    const disponivel = estoqueDisponivel(produto.id)
    if (qty > disponivel) {
      setInputError(
        disponivel <= 0
          ? `"${produto.descricao}" sem estoque disponível`
          : `Estoque insuficiente. Disponível: ${disponivel} unidade(s)`
      )
      return
    }

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
    if (descontoAtivo && desconto > subtotal) { setInputError('Desconto não pode ser maior que o subtotal'); return }
    createVenda.mutate(
      { itens, desconto },
      {
        onSuccess: handleClose,
        onError: (err) => setInputError(err.message),
      }
    )
  }

  const handleClose = () => {
    setItens([])
    setSelectedId('')
    setQuantidade('1')
    setInputError('')
    setDescontoAtivo(false)
    setDescontoValor('')
    onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
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

        {/* Seletor de produto */}
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/60 shrink-0">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Adicionar produto
          </p>
          <div className="flex flex-col gap-2">
            {/* Dropdown customizado */}
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm border border-zinc-200 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              >
                <span className={produtoSelecionado ? 'text-zinc-700' : 'text-zinc-400'}>
                  {produtoSelecionado ? produtoSelecionado.descricao : 'Selecione um produto...'}
                </span>
                <ChevronDown size={14} className={`text-zinc-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-zinc-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                  {produtosAtivos.map((p) => {
                    const disp = estoqueDisponivel(p.id)
                    const semStock = disp <= 0
                    return (
                      <button
                        key={p.id}
                        type="button"
                        disabled={semStock}
                        onClick={() => {
                          setSelectedId(String(p.id))
                          setInputError('')
                          setDropdownOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm text-left transition-colors ${
                          semStock
                            ? 'bg-rose-50 text-rose-400 cursor-not-allowed'
                            : 'text-zinc-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer'
                        }`}
                      >
                        <span className="truncate">{p.descricao}</span>
                        <span className={`text-xs ml-2 shrink-0 ${semStock ? 'text-rose-400' : 'text-zinc-400'}`}>
                          {semStock
                            ? <span className="flex items-center gap-1"><PackageX size={12} /> Sem estoque</span>
                            : `${formatBRL(p.valor)} · ${disp} un.`}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                placeholder="Qtd"
                className="w-24 px-3 py-2.5 text-sm border border-zinc-200 rounded-lg bg-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shrink-0"
              />
              <button
                onClick={handleAddItem}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <Plus size={15} />
                Adicionar
              </button>
            </div>
          </div>
          {semEstoque && (
            <div className="flex items-start gap-2 mt-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                Todos os produtos estão sem estoque. Atualize as quantidades na página de <strong>Produtos</strong> para realizar vendas.
              </p>
            </div>
          )}
          {inputError && (
            <p className="flex items-center gap-1.5 text-xs text-rose-500 mt-2">
              <AlertCircle size={12} />
              {inputError}
            </p>
          )}
        </div>

        {/* Lista de itens */}
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

        {/* Rodapé com desconto e total */}
        <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/60 shrink-0 space-y-3">

          {/* Checkbox desconto */}
          <label className="flex items-center gap-2.5 cursor-pointer w-fit">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={descontoAtivo}
                onChange={(e) => {
                  setDescontoAtivo(e.target.checked)
                  if (!e.target.checked) setDescontoValor('')
                }}
              />
              <div className="w-9 h-5 bg-zinc-200 rounded-full peer-checked:bg-indigo-500 transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4" />
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-600">
              <Tag size={13} />
              Aplicar desconto
            </div>
          </label>

          {descontoAtivo && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500">Desconto (R$)</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 select-none pointer-events-none">R$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={descontoValor}
                  onChange={(e) => setDescontoValor(e.target.value)}
                  placeholder="0,00"
                  className="pl-9 pr-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white w-36 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                />
              </div>
            </div>
          )}

          <div className="flex items-end justify-between">
            <div className="text-xs text-zinc-400">
              {itens.length} {itens.length === 1 ? 'produto' : 'produtos'} · {totalItens}{' '}
              {totalItens === 1 ? 'item' : 'itens'}
            </div>

            <div className="text-right space-y-0.5">
              {descontoAtivo && desconto > 0 && (
                <>
                  <p className="text-xs text-zinc-400">Subtotal: {formatBRL(subtotal)}</p>
                  <p className="text-xs text-emerald-600 font-medium">Desconto: − {formatBRL(desconto)}</p>
                </>
              )}
              <p className="text-xl font-bold text-zinc-900">{formatBRL(total)}</p>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              Cancelar
            </button>
            <Button
              onClick={handleSave}
              disabled={itens.length === 0 || createVenda.isPending}
              className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40"
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
