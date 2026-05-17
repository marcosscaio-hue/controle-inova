import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export type Produto = {
  id: number
  descricao: string
  valor: number
  status: boolean
  data_criacao: string
  data_alteracao: string | null
}

export type ProdutoInput = {
  descricao: string
  valor: number
  status: boolean
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

export function useProdutos() {
  return useQuery<Produto[]>({
    queryKey: ['produtos'],
    queryFn: () => api('/api/produtos'),
  })
}

export function useCreateProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ProdutoInput) =>
      api('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['produtos'] }),
  })
}

export function useUpdateProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProdutoInput }) =>
      api(`/api/produtos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['produtos'] }),
  })
}

export function useDeleteProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api(`/api/produtos/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['produtos'] }),
  })
}
