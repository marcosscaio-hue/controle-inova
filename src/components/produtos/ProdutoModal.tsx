import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const schema = z.object({
  descricao: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(255, 'Máximo 255 caracteres'),
  valor: z.number().positive('Deve ser maior que zero'),
  status: z.boolean(),
})

export type ProdutoInput = z.infer<typeof schema>

export type Produto = {
  id: number
  descricao: string
  valor: number
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
    defaultValues: { descricao: '', valor: 0, status: true },
  })

  useEffect(() => {
    if (!open) return
    reset(
      produto
        ? { descricao: produto.descricao, valor: produto.valor, status: produto.status }
        : { descricao: '', valor: 0, status: true }
    )
  }, [open, produto, reset])

  if (!open) return null

  const onSubmit = (data: ProdutoInput) => {
    onSave(data, produto?.id)
    onClose()
  }

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
              className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all"
            />
            {errors.descricao && (
              <p className="text-xs text-rose-500 mt-1.5">{errors.descricao.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Valor <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-400 select-none pointer-events-none">
                R$
              </span>
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
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Status</label>
            <label className="inline-flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  {...register('status')}
                  type="checkbox"
                  className="sr-only peer"
                />
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
            <Button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {produto ? 'Salvar alterações' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
