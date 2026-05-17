import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/sidebar/Sidebar'

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
