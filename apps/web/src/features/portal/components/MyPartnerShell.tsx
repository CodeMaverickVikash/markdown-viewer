import { useState, type ReactNode, type SyntheticEvent } from 'react'
import {
  ArrowRight,
  BookOpenText,
  BriefcaseBusiness,
  CheckCircle2,
  Database,
  Download,
  Loader2,
  LogOut,
  Moon,
  NotebookTabs,
  Sun,
  Zap,
  type LucideIcon
} from '@mypartner/common/dependencies'
import { getApiUrl } from '@mypartner/common'
import { toast } from '@mypartner/common/dependencies'
import { useInstallPrompt } from '../../pwa/hooks/useInstallPrompt'

export type ThemeMode = 'light' | 'dark'
export type AuthenticatedFeatureId = 'notes' | 'backend'

export interface AuthSession {
  name: string
  email: string
  company: string
  signedInAt: string
}

interface ShellProps {
  theme: ThemeMode
  onToggleTheme: () => void
}

interface LoginProps extends ShellProps {
  onLogin: (session: AuthSession) => void
  onNavigate: (path: string) => void
}

interface PortalProps extends ShellProps {
  session: AuthSession
  children?: ReactNode
  onLogout: () => void
  activeFeature: AuthenticatedFeatureId
  onNavigate: (path: string) => void
}

interface AuthenticatedFeature {
  id: AuthenticatedFeatureId
  label: string
  route: string
  icon: LucideIcon
}

const authenticatedFeatures: AuthenticatedFeature[] = [
  { id: 'notes', label: 'Notes', route: '/notes', icon: NotebookTabs },
  { id: 'backend', label: 'Backend UI', route: '/backend', icon: Database },
]

interface FeatureRegistryItem {
  id: string
  label: string
  tagline: string
  route: string
  icon: LucideIcon
}

// Kept for the legacy portal home component; public apps route outside authentication.
export const featureRegistry: FeatureRegistryItem[] = [
  { id: 'markdown', label: 'Markdown', tagline: 'Local markdown editor', route: '/markdown', icon: BookOpenText },
  { id: 'notes', label: 'Notes', tagline: 'Pinnable notes, offline-first', route: '/notes', icon: NotebookTabs },
  { id: 'portfolio', label: 'Portfolio', tagline: 'Engineer profile and stack', route: '/portfolio', icon: BriefcaseBusiness },
]

function BrandMark() {
  return (
    <div className="inline-flex shrink-0 items-center gap-2.5" aria-label="myPartner">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-[#0f766e] to-[#14b8a6] text-xs font-black text-white shadow-sm">
        mP
      </span>
      <span className="hidden sm:block">
        <strong className="block text-sm font-extrabold leading-none text-ink-1">myPartner</strong>
        <small className="block text-[10px] leading-none text-ink-3 mt-0.5">Work portal</small>
      </span>
    </div>
  )
}

function ThemeButton({ theme, onToggleTheme }: ShellProps) {
  return (
    <button
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-1 text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink-1 cursor-pointer"
      type="button"
      onClick={onToggleTheme}
      title="Toggle theme"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="h-[15px] w-[15px]" /> : <Moon className="h-[15px] w-[15px]" />}
    </button>
  )
}

const loginFeatures = [
  'Direct file system access with auto-sync',
  'Rich markdown editor with live preview',
  'Color-coded pinnable notes',
  'Offline-first — no data leaves your browser',
]

const fetchWithTimeout = (url: string, options: RequestInit, timeoutMs = 4000) => {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)

  return fetch(url, { ...options, signal: controller.signal }).finally(() => {
    window.clearTimeout(timeout)
  })
}

export function MyPartnerLogin({ theme, onLogin, onNavigate, onToggleTheme }: LoginProps) {
  const { canInstall, installed, install } = useInstallPrompt()
  const [isChecking, setIsChecking] = useState(false)
  const [emailError, setEmailError] = useState('')

  const inputClass =
    'mt-1.5 w-full rounded-xl border border-line bg-surface-0 px-4 py-2.5 text-sm text-ink-1 placeholder:text-ink-3 outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/20'

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const email   = String(fd.get('email')   ?? '').trim()
    const name    = String(fd.get('name')    ?? '').trim()
    const company = String(fd.get('company') ?? '').trim()

    setIsChecking(true)
    setEmailError('')
    try {
      const res = await fetchWithTimeout(getApiUrl('/api/auth/check-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const { allowed } = (await res.json()) as { allowed: boolean }
      if (!allowed) {
        setEmailError('Access restricted. This email is not authorized.')
        setIsChecking(false)
        return
      }
    } catch {
      // fail open — a broken API should not lock users out
    }
    setIsChecking(false)

    onLogin({
      email,
      name:    name    || email.split('@')[0] || 'Partner',
      company: company || 'Workspace',
      signedInAt: new Date().toISOString(),
    })
  }

  return (
    <main className="min-h-screen bg-surface-0">
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface-1 px-5 lg:px-10">
        <BrandMark />
        <ThemeButton theme={theme} onToggleTheme={onToggleTheme} />
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-5xl flex-col items-center justify-center gap-12 px-5 py-12 lg:grid lg:grid-cols-[1fr_400px] lg:gap-20">

        {/* Hero */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">
            <Zap className="h-3 w-3" />
            Feature-focused workspace
          </span>

          <h1 className="mt-4 text-[clamp(36px,5vw,60px)] font-black leading-[1.05] tracking-tight text-ink-1">
            Your workspace,<br />your pace.
          </h1>

          <p className="mt-4 max-w-md text-base leading-7 text-ink-2">
            Access Markdown editor and Notes from one focused local portal — live file sync and full privacy, no backend required.
          </p>

          <ul className="mt-8 space-y-3">
            {loginFeatures.map(f => (
              <li key={f} className="flex items-center gap-3 text-sm text-ink-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-forest" />
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">No sign-in required</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/markdown')}
                className="inline-flex items-center gap-2 rounded-lg border border-forest/30 bg-forest/5 px-4 py-2 text-sm font-semibold text-forest transition hover:bg-forest/10"
              >
                <BookOpenText className="h-4 w-4" />
                Open Markdown Editor
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/portfolio')}
                className="inline-flex items-center gap-2 rounded-lg border border-forest/30 bg-forest/5 px-4 py-2 text-sm font-semibold text-forest transition hover:bg-forest/10"
              >
                <BriefcaseBusiness className="h-4 w-4" />
                View Portfolio
              </button>
            </div>
          </div>
        </div>

        {/* Login card */}
        <form
          className="w-full rounded-2xl border border-line bg-surface-1 p-7 shadow-2xl"
          onSubmit={handleSubmit}
        >
          <h2 className="text-xl font-bold text-ink-1">Sign in to continue</h2>
          <p className="mt-1 text-sm text-ink-3">Local workspace</p>

          <div className="mt-6 space-y-4">
            <label className="block text-xs font-semibold text-ink-2">
              Work email *
              <input
                className={inputClass}
                name="email"
                type="email"
                placeholder="you@company.com"
                required
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'email-error' : undefined}
                onChange={() => setEmailError('')}
              />
              {emailError && (
                <p id="email-error" role="alert" className="mt-1.5 text-xs text-crimson">
                  {emailError}
                </p>
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={isChecking}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-6 py-3 font-semibold text-white transition hover:opacity-90 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isChecking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking…
              </>
            ) : (
              <>
                Open portal
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  )
}

export function MyPartnerPortal({
  session,
  children,
  theme,
  onLogout,
  onToggleTheme,
  activeFeature,
  onNavigate,
}: PortalProps) {
  return (
    <main className="flex h-screen flex-col overflow-hidden bg-surface-0 max-lg:min-h-dvh">
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-surface-1 px-4 lg:px-5">
        <BrandMark />
        <div className="ml-auto flex items-center gap-2.5">
          <div className="hidden text-right sm:block">
            <p className="truncate text-[11px] font-bold uppercase tracking-wide text-ink-3">{session.company}</p>
            <p className="truncate text-xs text-ink-2">{session.name}</p>
          </div>

          <ThemeButton theme={theme} onToggleTheme={onToggleTheme} />

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink-2 transition hover:border-crimson/40 hover:bg-crimson/5 hover:text-crimson cursor-pointer"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden pt-14 max-lg:flex-col">
        <aside className="flex w-52 shrink-0 flex-col border-r border-line bg-surface-1 p-3 max-lg:fixed max-lg:inset-x-0 max-lg:top-14 max-lg:z-20 max-lg:h-16 max-lg:w-full max-lg:border-b max-lg:border-r-0 max-lg:p-2">
          <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-widest text-ink-3 max-lg:hidden">Apps</p>
          <nav className="flex gap-1 lg:flex-col" aria-label="Authenticated apps">
            {authenticatedFeatures.map(feature => {
              const Icon = feature.icon
              const isActive = activeFeature === feature.id
              return (
                <button
                  key={feature.id}
                  type="button"
                  onClick={() => onNavigate(feature.route)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex min-w-max items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition cursor-pointer max-lg:flex-1 max-lg:flex-col max-lg:justify-center max-lg:gap-0.5 max-lg:py-1.5 max-lg:text-[11px] ${
                    isActive
                      ? 'bg-forest text-white'
                      : 'text-ink-2 hover:bg-surface-2 hover:text-ink-1'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {feature.label}
                </button>
              )
            })}
          </nav>
        </aside>

        <section
          className="flex min-h-0 flex-1 flex-col overflow-auto pt-16 lg:overflow-hidden lg:pt-0 [&>.app-container]:flex-1 [&>.app-container]:min-h-0 [&>main]:flex-1 [&>main]:min-h-0"
          aria-label="Feature workspace"
        >
          {children}
        </section>
      </div>
    </main>
  )
}
