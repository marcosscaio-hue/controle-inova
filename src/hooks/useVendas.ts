import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export type VendaItem = {
  produto_id: number
  descricao: string
  valor_unit: number
  quantidade: number
  valor_total: number
}

export type Venda = {
  id: number
  data_venda: string
  data_alteracao_venda: string | null
  valor_total: number
  itens: VendaItem[]
}

const api = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? 'Erro na requisição')
  }
  if (res.status === 204) return null
  return res.json()
}

export function useVendas() {
  return useQuery<Venda[]>({
    queryKey: ['vendas'],
    queryFn: () => api('/api/vendas'),
  })
}

export function useCreateVenda() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (itens: VendaItem[]) =>
      api('/api/vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itens }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendas'] }),
  })
}

export function useDeleteVenda() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api(`/api/vendas/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendas'] }),
  })
}
