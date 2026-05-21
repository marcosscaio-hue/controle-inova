import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MainLayout from '@/layouts/MainLayout'
import DashboardPage from '@/pages/DashboardPage'
import ProdutosPage from '@/pages/produtos/ProdutosPage'
import VendasPage from '@/pages/vendas/VendasPage'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/controle-inova">
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="produtos" element={<ProdutosPage />} />
            <Route path="vendas" element={<VendasPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
