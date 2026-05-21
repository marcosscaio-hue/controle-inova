import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

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

export function useVendas() {
  return useQuery<Venda[]>({
    queryKey: ['vendas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendas')
        .select(`
          *,
          venda_itens (
            id,
            produto_id,
            quantidade,
            valor_unit,
            valor_total,
            produtos ( descricao )
          )
        `)
        .order('id', { ascending: false })
      if (error) throw new Error(error.message)

      return (data ?? []).map((v) => ({
        ...v,
        itens: (v.venda_itens ?? []).map((item: any) => ({
          produto_id: item.produto_id,
          descricao: item.produtos?.descricao ?? '',
          quantidade: item.quantidade,
          valor_unit: item.valor_unit,
          valor_total: item.valor_total,
        })),
      }))
    },
  })
}

export function useCreateVenda() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (itens: VendaItem[]) => {
      const valor_total = itens.reduce((acc, i) => acc + Number(i.valor_total), 0)

      const { data: venda, error: vendaError } = await supabase
        .from('vendas')
        .insert({ valor_total })
        .select()
        .single()
      if (vendaError) throw new Error(vendaError.message)

      const { error: itensError } = await supabase.from('venda_itens').insert(
        itens.map((i) => ({
          venda_id: venda.id,
          produto_id: i.produto_id,
          quantidade: i.quantidade,
          valor_unit: i.valor_unit,
          valor_total: i.valor_total,
        }))
      )

      if (itensError) {
        await supabase.from('vendas').delete().eq('id', venda.id)
        throw new Error(itensError.message)
      }

      return venda
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendas'] }),
  })
}

export function useDeleteVenda() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('vendas').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendas'] }),
  })
}
