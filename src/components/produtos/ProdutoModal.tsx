import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const schema = z.object({
  descricao: z.string().min(3, 'Mínimo 3 caracteres').max(255, 'Máximo 255 caracteres'),
  marca: z.string().max(100, 'Máximo 100 caracteres').optional(),
  quantidade_estoque: z.number().int('Deve ser inteiro').min(0, 'Não pode ser negativo'),
  valor: z.number().positive('Deve ser maior que zero'),
  preco_custo: z.number().nonnegative('Deve ser positivo').optional().nullable(),
  status: z.boolean(),
})

export type ProdutoInput = z.infer<typeof schema>

export type Produto = {
  id: number
  descricao: string
  marca: string | null
  valor: number
  preco_custo: number | null
  quantidade_estoque: number
  status: boolean
  data_criacao: string
  data_alteracao: string | null
}

type Props = {
  open: boolean
  produto?: Produto | null
  onClose: () => void
  onSave: (data: ProdutoInput, id?: number) => void
}

export default function ProdutoModal({ open, produto, onClose, onSave }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProdutoInput>({
    resolver: zodResolver(schema),
    defaultValues: { descricao: '', marca: '', quantidade_estoque: 0, valor: 0, preco_custo: null, status: true },
  })

  useEffect(() => {
    if (!open) return
    reset(
      produto
        ? {
            descricao: produto.descricao,
            marca: produto.marca ?? '',
            quantidade_estoque: produto.quantidade_estoque ?? 0,
            valor: produto.valor,
            preco_custo: produto.preco_custo ?? null,
            status: produto.status,
          }
        : { descricao: '', marca: '', quantidade_estoque: 0, valor: 0, preco_custo: null, status: true }
    )
  }, [open, produto, reset])

  if (!open) return null

  const onSubmit = (data: ProdutoInput) => {
    onSave(
      {
        ...data,
        marca: data.marca || undefined,
        preco_custo: data.preco_custo ?? null,
      },
      produto?.id
    )
    onClose()
  }

  const inputClass =
    'w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              {produto ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {produto ? 'Altere os dados do produto' : 'Preencha os dados do novo produto'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Descrição <span className="text-rose-500">*</span>
            </label>
            <input
              {...register('descricao')}
              type="text"
              placeholder="Nome do produto"
              className={inputClass}
            />
            {errors.descricao && (
              <p className="text-xs text-rose-500 mt-1.5">{errors.descricao.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Marca</label>
              <input
                {...register('marca')}
                type="text"
                placeholder="Ex: Samsung..."
                className={inputClass}
              />
              {errors.marca && (
                <p className="text-xs text-rose-500 mt-1.5">{errors.marca.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Qtd. em Estoque <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('quantidade_estoque', { valueAsNumber: true })}
                type="number"
                min="0"
                step="1"
                placeholder="0"
                className={inputClass}
              />
              {errors.quantidade_estoque && (
                <p className="text-xs text-rose-500 mt-1.5">{errors.quantidade_estoque.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Preço de Venda <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-400 select-none pointer-events-none">R$</span>
                <input
                  {...register('valor', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all"
                />
              </div>
              {errors.valor && (
                <p className="text-xs text-rose-500 mt-1.5">{errors.valor.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Preço de Custo</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-400 select-none pointer-events-none">R$</span>
                <input
                  {...register('preco_custo', {
                    setValueAs: (v) => (v === '' || v === null ? null : parseFloat(v)),
                  })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all"
                />
              </div>
              {errors.preco_custo && (
                <p className="text-xs text-rose-500 mt-1.5">{errors.preco_custo.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Status</label>
            <label className="inline-flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input {...register('status')} type="checkbox" className="sr-only peer" />
                <div className="w-10 h-6 bg-zinc-200 rounded-full peer-checked:bg-indigo-500 transition-colors" />
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4" />
              </div>
              <span className="text-sm text-zinc-600">Ativo</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              Cancelar
            </button>
            <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
              {produto ? 'Salvar alterações' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
