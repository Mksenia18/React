import type { ReactNode } from 'react'
import { useAuthStore } from '../store/authStore'
import { NavBar } from './NavBar'

interface AppLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function AppLayout({ title, subtitle, children }: AppLayoutProps) {
  const { userId, email } = useAuthStore()

  return (
    <>
      <NavBar userId={userId} email={email} />
      <main className="page">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
        {children}
      </main>
    </>
  )
}

