import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MainLayout from '@/layouts/MainLayout'
import DashboardPage from '@/pages/DashboardPage'
import ProdutosPage from '@/pages/produtos/ProdutosPage'
import VendasPage from '@/pages/vendas/VendasPage'
import LoginPage from '@/pages/login/LoginPage'
import ProtectedRoute from '@/components/ProtectedRoute'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="produtos" element={<ProdutosPage />} />
            <Route path="vendas" element={<VendasPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  )
}
