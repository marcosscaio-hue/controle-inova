import { supabase } from './supabase'

export type Usuario = {
  id: number
  cpf: string
  nome: string | null
}

export async function sha256(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function login(cpf: string, senha: string): Promise<Usuario> {
  const cpfDigits = cpf.replace(/\D/g, '')
  const hash = await sha256(senha)

  const { data, error } = await supabase
    .from('usuarios')
    .select('id, cpf, nome')
    .eq('cpf', cpfDigits)
    .eq('senha_hash', hash)
    .eq('ativo', true)
    .single()

  if (error || !data) throw new Error('CPF ou senha inválidos')
  return data as Usuario
}

export async function alterarSenha(
  usuarioId: number,
  senhaAtual: string,
  novaSenha: string
): Promise<void> {
  const hashAtual = await sha256(senhaAtual)

  const { data, error } = await supabase
    .from('usuarios')
    .select('id')
    .eq('id', usuarioId)
    .eq('senha_hash', hashAtual)
    .eq('ativo', true)
    .single()

  if (error || !data) throw new Error('Senha atual incorreta')

  const novoHash = await sha256(novaSenha)
  const { error: updateError } = await supabase
    .from('usuarios')
    .update({ senha_hash: novoHash })
    .eq('id', usuarioId)

  if (updateError) throw new Error('Erro ao atualizar senha')
}
