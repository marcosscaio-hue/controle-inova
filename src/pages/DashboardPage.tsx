import { Link } from 'react-router-dom'
import {
  Package, CheckCircle2, XCircle, ShoppingCart,
  TrendingUp, ArrowUpRight, ArrowRight,
} from 'lucide-react'
import { useProdutos } from '@/hooks/useProdutos'
import { useVendas } from '@/hooks/useVendas'

const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

export default function DashboardPage() {
  const { data: produtos = [] } = useProdutos()
  const { data: vendas = [] } = useVendas()

  const totalProdutos = produtos.length
  const produtosAtivos = produtos.filter((p) => p.status).length
  const produtosInativos = produtos.filter((p) => !p.status).length
  const totalVendas = vendas.reduce((acc, v) => acc + Number(v.valor_total), 0)

  const ultimosProdutos = [...produtos].reverse().slice(0, 5)
  const taxaAtivos = totalProdutos > 0 ? Math.round((produtosAtivos / totalProdutos) * 100) : null
  const maiorValor = produtos.length > 0 ? Math.max(...produtos.map((p) => p.valor)) : null
  const menorValor = produtos.length > 0 ? Math.min(...produtos.map((p) => p.valor)) : null
  const ultimaVenda = vendas.length > 0 ? vendas[0].data_venda : null

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const stats = [
    { label: 'Total de Produtos', value: String(totalProdutos), icon: Package, iconClass: 'text-blue-500', iconBg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Produtos Ativos', value: String(produtosAtivos), icon: CheckCircle2, iconClass: 'text-emerald-500', iconBg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Produtos Inativos', value: String(produtosInativos), icon: XCircle, iconClass: 'text-rose-500', iconBg: 'bg-rose-50', border: 'border-rose-100' },
    { label: 'Total em Vendas', value: formatBRL(totalVendas), icon: ShoppingCart, iconClass: 'text-violet-500', iconBg: 'bg-violet-50', border: 'border-violet-100' },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1 capitalize">{today}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className={`bg-white rounded-xl border ${s.border} p-5 shadow-xs flex flex-col gap-4`}>
              <div className={`${s.iconBg} rounded-lg p-2.5 w-fit`}>
                <Icon size={20} className={s.iconClass} />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900 tracking-tight">{s.value}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{s.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Últimos Produtos</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Registros mais recentes</p>
            </div>
            <Link to="/produtos" className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
              Ver todos <ArrowUpRight size={12} />
            </Link>
          </div>

          {ultimosProdutos.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/70">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Descrição</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Valor</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Cadastrado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {ultimosProdutos.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-zinc-800">{p.descricao}</td>
                    <td className="px-5 py-3 text-sm text-zinc-600 tabular-nums">{formatBRL(p.valor)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${p.status ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.status ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                        {p.status ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-zinc-400">{formatDate(p.data_criacao)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
                <Package size={22} className="text-zinc-300" />
              </div>
              <p className="text-sm font-medium text-zinc-500">Nenhum produto cadastrado</p>
              <p className="text-xs text-zinc-400 mt-1 mb-4">Cadastre o primeiro produto para ver os dados aqui</p>
              <Link to="/produtos" className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                Ir para produtos <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-900">Resumo</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Visão geral do sistema</p>
          </div>
          <div className="px-5 divide-y divide-zinc-50">
            {[
              { label: 'Produtos cadastrados', value: totalProdutos > 0 ? String(totalProdutos) : '—' },
              { label: 'Vendas realizadas', value: vendas.length > 0 ? String(vendas.length) : '—' },
              { label: 'Taxa de ativos', value: taxaAtivos != null ? `${taxaAtivos}%` : '—' },
              { label: 'Maior valor', value: maiorValor != null ? formatBRL(maiorValor) : '—' },
              { label: 'Menor valor', value: menorValor != null ? formatBRL(menorValor) : '—' },
              { label: 'Última venda', value: ultimaVenda ? formatDate(ultimaVenda) : '—' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-3">
                <span className="text-xs text-zinc-500">{row.label}</span>
                <span className="text-xs font-semibold text-zinc-800">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="px-5 pb-5 pt-2">
            <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingUp size={13} className="text-indigo-500" />
                <span className="text-xs font-semibold text-indigo-700">
                  {vendas.length > 0 ? 'Ótimo progresso!' : 'Pronto para crescer'}
                </span>
              </div>
              <p className="text-xs text-indigo-500 leading-relaxed">
                {vendas.length > 0
                  ? `${vendas.length} venda${vendas.length > 1 ? 's' : ''} registrada${vendas.length > 1 ? 's' : ''}, totalizando ${formatBRL(totalVendas)}.`
                  : 'Cadastre produtos e registre vendas para acompanhar seus indicadores.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
