import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, KeyRound, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { alterarSenha } from '@/lib/auth'
import { useAuth } from '@/store/useAuth'

type Field = 'atual' | 'nova' | 'confirmar'

export default function AlterarSenhaPage() {
  const navigate = useNavigate()
  const usuario = useAuth((s) => s.usuario)

  const [valores, setValores] = useState({ atual: '', nova: '', confirmar: '' })
  const [mostrar, setMostrar] = useState<Record<Field, boolean>>({ atual: false, nova: false, confirmar: false })
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [loading, setLoading] = useState(false)

  const toggle = (f: Field) => setMostrar((v) => ({ ...v, [f]: !v[f] }))
  const set = (f: Field, val: string) => { setValores((v) => ({ ...v, [f]: val })); setErro(''); setSucesso(false) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valores.atual) { setErro('Informe a senha atual'); return }
    if (valores.nova.length < 6) { setErro('A nova senha deve ter ao menos 6 caracteres'); return }
    if (valores.nova !== valores.confirmar) { setErro('A confirmação não coincide com a nova senha'); return }
    if (!usuario) return

    setLoading(true)
    try {
      await alterarSenha(usuario.id, valores.atual, valores.nova)
      setSucesso(true)
      setValores({ atual: '', nova: '', confirmar: '' })
    } catch (err: any) {
      setErro(err.message ?? 'Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-3.5 pr-10 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all'

  const EyeButton = ({ field }: { field: Field }) => (
    <button
      type="button"
      onClick={() => toggle(field)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
    >
      {mostrar[field] ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  )

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 transition-colors mb-6"
      >
        <ArrowLeft size={15} />
        Voltar
      </button>

      <div className="flex items-start gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
          <KeyRound size={18} className="text-indigo-500" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Alterar Senha</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Atualize a senha da sua conta</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Senha atual</label>
            <div className="relative">
              <input
                type={mostrar.atual ? 'text' : 'password'}
                placeholder="••••••••"
                value={valores.atual}
                onChange={(e) => set('atual', e.target.value)}
                className={inputClass}
              />
              <EyeButton field="atual" />
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Nova senha</label>
              <div className="relative">
                <input
                  type={mostrar.nova ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={valores.nova}
                  onChange={(e) => set('nova', e.target.value)}
                  className={inputClass}
                />
                <EyeButton field="nova" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Confirmar nova senha</label>
              <div className="relative">
                <input
                  type={mostrar.confirmar ? 'text' : 'password'}
                  placeholder="Repita a nova senha"
                  value={valores.confirmar}
                  onChange={(e) => set('confirmar', e.target.value)}
                  className={inputClass}
                />
                <EyeButton field="confirmar" />
              </div>
              {valores.nova && valores.confirmar && (
                <p className={`text-xs mt-1.5 flex items-center gap-1 ${valores.nova === valores.confirmar ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {valores.nova === valores.confirmar
                    ? <><CheckCircle2 size={12} /> Senhas coincidem</>
                    : <><AlertCircle size={12} /> Senhas não coincidem</>}
                </p>
              )}
            </div>
          </div>

          {erro && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-rose-50 border border-rose-200 rounded-lg">
              <AlertCircle size={14} className="text-rose-500 shrink-0" />
              <p className="text-xs text-rose-600">{erro}</p>
            </div>
          )}

          {sucesso && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              <p className="text-xs text-emerald-700 font-medium">Senha alterada com sucesso!</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar senha'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
