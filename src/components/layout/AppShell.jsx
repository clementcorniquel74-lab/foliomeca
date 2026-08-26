import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import InstallPWAPrompt from '../InstallPWAPrompt'

export default function AppShell() {
  return (
    <div className="min-h-screen flex bg-base-950">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-4 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
      <InstallPWAPrompt />
    </div>
  )
}
