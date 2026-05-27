import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import { login } from '@/lib/auth'
import { useAuth } from '@/store/useAuth'
import logo from '@/assets/logo.png'

function formatCPF(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export default function LoginPage() {
  const navigate = useNavigate()
  const setUsuario = useAuth((s) => s.setUsuario)

  const [cpf, setCpf] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    const cpfDigits = cpf.replace(/\D/g, '')
    if (cpfDigits.length !== 11) { setErro('Informe um CPF válido com 11 dígitos'); return }
    if (!senha) { setErro('Informe a senha'); return }

    setLoading(true)
    try {
      const usuario = await login(cpf, senha)
      setUsuario(usuario)
      navigate('/', { replace: true })
    } catch (err: any) {
      setErro(err.message ?? 'Erro ao autenticar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl border border-zinc-100 overflow-hidden">

          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center border-b border-zinc-100">
            <img src={logo} alt="InovaTech" className="h-24 w-auto mx-auto mb-3 object-contain" />
            <p className="text-sm text-zinc-400 mt-1">Faça login para continuar</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">CPF</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => { setCpf(formatCPF(e.target.value)); setErro('') }}
                className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all tracking-wider"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => { setSenha(e.target.value); setErro('') }}
                  className="w-full px-3.5 pr-10 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {mostrarSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {erro && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-rose-50 border border-rose-200 rounded-lg">
                <AlertCircle size={14} className="text-rose-500 shrink-0" />
                <p className="text-xs text-rose-600">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors mt-2"
            >
              <LogIn size={15} />
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
