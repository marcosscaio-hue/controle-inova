import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

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

export function useProdutos() {
  return useQuery<Produto[]>({
    queryKey: ['produtos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('id')
      if (error) throw new Error(error.message)
      return data
    },
  })
}

export function useCreateProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: ProdutoInput) => {
      const { data, error } = await supabase
        .from('produtos')
        .insert(input)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['produtos'] }),
  })
}

export function useUpdateProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProdutoInput }) => {
      const { data: updated, error } = await supabase
        .from('produtos')
        .update(data)
        .eq('id', id)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return updated
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['produtos'] }),
  })
}

export function useDeleteProduto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('produtos').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['produtos'] }),
  })
}
