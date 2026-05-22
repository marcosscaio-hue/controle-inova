import { Fragment, useState } from 'react'
import { ShoppingCart, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useVendas, useDeleteVenda } from '@/hooks/useVendas'
import VendaModal from '@/components/vendas/VendaModal'

const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export default function VendasPage() {
  const { data: vendas = [], isLoading } = useVendas()
  const deleteVenda = useDeleteVenda()
  const [modalOpen, setModalOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const totalGeral = vendas.reduce((acc, v) => acc + Number(v.valor_total), 0)
  const toggle = (id: number) => setExpandedId((prev) => (prev === id ? null : id))

  return (
    <>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-zinc-900 tracking-tight">Vendas</h1>
            <p className="text-sm text-zinc-400 mt-1">Registre e acompanhe as vendas realizadas</p>
          </div>
          <Button
            onClick={() => setModalOpen(true)}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Nova Venda</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </div>

        {vendas.length > 0 && (
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
            <div className="bg-white rounded-xl border border-zinc-200 p-3 md:p-4 shadow-xs">
              <p className="text-xs text-zinc-400">Total de vendas</p>
              <p className="text-xl md:text-2xl font-bold text-zinc-900 mt-1">{vendas.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200 p-3 md:p-4 shadow-xs">
              <p className="text-xs text-zinc-400">Itens vendidos</p>
              <p className="text-xl md:text-2xl font-bold text-zinc-900 mt-1">
                {vendas.reduce((acc, v) => acc + v.itens.reduce((a, i) => a + i.quantidade, 0), 0)}
              </p>
            </div>
            <div className="bg-indigo-50/30 rounded-xl border border-indigo-100 p-3 md:p-4 shadow-xs">
              <p className="text-xs text-indigo-400">Faturamento total</p>
              <p className="text-xl md:text-2xl font-bold text-indigo-700 mt-1">{formatBRL(totalGeral)}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/70">
                  <th className="w-10 px-4 py-3.5" />
                  <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Data da Venda</th>
                  <th className="hidden sm:table-cell text-left px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Produtos</th>
                  <th className="hidden md:table-cell text-left px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Qtd. Total</th>
                  <th className="hidden md:table-cell text-right px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Desconto</th>
                  <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Total</th>
                  <th className="px-5 py-3.5 w-12" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-sm text-zinc-400">
                      Carregando...
                    </td>
                  </tr>
                ) : vendas.length > 0 ? (
                  vendas.map((venda) => (
                    <Fragment key={venda.id}>
                      <tr
                        className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors cursor-pointer"
                        onClick={() => toggle(venda.id)}
                      >
                        <td className="px-4 py-3.5 text-zinc-400">
                          {expandedId === venda.id
                            ? <ChevronDown size={14} />
                            : <ChevronRight size={14} />}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-zinc-700">
                          {formatDate(venda.data_venda)}
                        </td>
                        <td className="hidden sm:table-cell px-5 py-3.5 text-sm text-zinc-700">
                          {venda.itens.length} {venda.itens.length === 1 ? 'produto' : 'produtos'}
                        </td>
                        <td className="hidden md:table-cell px-5 py-3.5 text-sm text-zinc-600 tabular-nums">
                          {venda.itens.reduce((acc, i) => acc + i.quantidade, 0)} un.
                        </td>
                        <td className="hidden md:table-cell px-5 py-3.5 text-sm text-right tabular-nums">
                          {venda.desconto > 0
                            ? <span className="text-emerald-600 font-medium">− {formatBRL(venda.desconto)}</span>
                            : <span className="text-zinc-300">—</span>
                          }
                        </td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-zinc-900 text-right tabular-nums">
                          {formatBRL(Number(venda.valor_total))}
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteVenda.mutate(venda.id) }}
                            title="Excluir venda"
                            className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-300 hover:text-rose-500 hover:bg-rose-50 transition-colors ml-auto"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>

                      {expandedId === venda.id && (
                        <tr className="bg-zinc-50 border-b border-zinc-100">
                          <td colSpan={7} className="px-10 py-3">
                            <table className="w-full">
                              <thead>
                                <tr>
                                  <th className="text-left pb-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Produto</th>
                                  <th className="text-center pb-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider w-24">Quantidade</th>
                                  <th className="text-right pb-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Valor Unit.</th>
                                  <th className="text-right pb-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-100">
                                {venda.itens.map((item, idx) => (
                                  <tr key={idx}>
                                    <td className="py-2 text-sm text-zinc-700">{item.descricao}</td>
                                    <td className="py-2 text-sm text-zinc-600 text-center tabular-nums">{item.quantidade}</td>
                                    <td className="py-2 text-sm text-zinc-400 text-right tabular-nums">{formatBRL(Number(item.valor_unit))}</td>
                                    <td className="py-2 text-sm font-semibold text-zinc-800 text-right tabular-nums">{formatBRL(Number(item.valor_total))}</td>
                                  </tr>
                                ))}
                              </tbody>
                              {venda.desconto > 0 && (
                                <tfoot>
                                  <tr>
                                    <td colSpan={3} className="pt-2 text-xs text-zinc-400 text-right">Desconto aplicado</td>
                                    <td className="pt-2 text-xs font-medium text-emerald-600 text-right">− {formatBRL(venda.desconto)}</td>
                                  </tr>
                                  <tr>
                                    <td colSpan={3} className="pt-1 text-xs font-semibold text-zinc-600 text-right">Total final</td>
                                    <td className="pt-1 text-sm font-bold text-zinc-900 text-right">{formatBRL(venda.valor_total)}</td>
                                  </tr>
                                </tfoot>
                              )}
                            </table>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                          <ShoppingCart size={26} className="text-zinc-300" />
                        </div>
                        <p className="text-sm font-medium text-zinc-600">Nenhuma venda registrada</p>
                        <p className="text-xs text-zinc-400 mt-1 mb-5">Clique em "Nova Venda" para começar</p>
                        <Button size="sm" onClick={() => setModalOpen(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                          <Plus size={14} />
                          Nova Venda
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <VendaModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
