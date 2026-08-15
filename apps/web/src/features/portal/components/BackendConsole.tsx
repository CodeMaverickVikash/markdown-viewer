'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Database, Pencil, Plus, RefreshCw, Trash2 } from '@mypartner/common/dependencies'
import { getApiUrl } from '@mypartner/common'

interface PortfolioSkill {
  id: string; name: string; description: string; category: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'; year: string; paradigm: string
  features: string[]; useCases: string[]; icon: string; isActive: boolean
}
interface BackendConsoleProps { ownerEmail: string }
const blankSkill = (): PortfolioSkill => ({ id: '', name: '', description: '', category: 'Frontend', difficulty: 'Intermediate', year: String(new Date().getFullYear()), paradigm: '', features: [], useCases: [], icon: 'default', isActive: true })
const listValue = (value: string) => value.split(',').map(item => item.trim()).filter(Boolean)

export default function BackendConsole({ ownerEmail }: BackendConsoleProps) {
  const [skills, setSkills] = useState<PortfolioSkill[]>([])
  const [skill, setSkill] = useState<PortfolioSkill>(blankSkill)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadSkills = useCallback(async () => {
    setIsLoading(true); setError('')
    try {
      const response = await fetch(getApiUrl('/api/portfolio/skills'))
      if (!response.ok) throw new Error('Unable to load portfolio skills.')
      const data = await response.json() as { skills?: PortfolioSkill[] }
      setSkills(data.skills ?? [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load portfolio skills.')
    } finally { setIsLoading(false) }
  }, [])

  useEffect(() => { void loadSkills() }, [loadSkills])

  const saveSkill = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setIsSaving(true); setError(''); setMessage('')
    const isEditing = skills.some(item => item.id === skill.id)
    try {
      const response = await fetch(getApiUrl(`/api/portfolio/skills${isEditing ? `/${skill.id}` : ''}`), {
        method: isEditing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json', 'x-user-email': ownerEmail }, body: JSON.stringify(skill),
      })
      const data = await response.json() as { error?: string }
      if (!response.ok) throw new Error(data.error ?? 'Unable to save this skill.')
      setMessage(isEditing ? 'Skill updated.' : 'Skill created.'); setSkill(blankSkill()); await loadSkills()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save this skill.')
    } finally { setIsSaving(false) }
  }

  const removeSkill = async (id: string) => {
    if (!confirm('Delete this portfolio skill?')) return
    setError(''); setMessage('')
    try {
      const response = await fetch(getApiUrl(`/api/portfolio/skills/${id}`), { method: 'DELETE', headers: { 'x-user-email': ownerEmail } })
      if (!response.ok) { const data = await response.json() as { error?: string }; throw new Error(data.error ?? 'Unable to delete this skill.') }
      if (skill.id === id) setSkill(blankSkill())
      setMessage('Skill deleted.'); await loadSkills()
    } catch (removeError) { setError(removeError instanceof Error ? removeError.message : 'Unable to delete this skill.') }
  }

  const fieldClass = 'mt-1 w-full rounded-lg border border-line bg-surface-0 px-3 py-2 text-sm text-ink-1 outline-none focus:border-forest focus:ring-2 focus:ring-forest/20'
  const editing = skills.some(item => item.id === skill.id)

  return <main className="flex flex-1 overflow-auto bg-surface-0 p-5 sm:p-8"><div className="mx-auto w-full max-w-6xl">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-forest"><Database className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-widest">Portfolio management</span></div><h1 className="mt-2 text-2xl font-extrabold text-ink-1">Manage portfolio skills</h1><p className="mt-1 text-sm text-ink-2">Create, edit, activate, and remove skills displayed in the public portfolio.</p></div><button type="button" onClick={() => void loadSkills()} disabled={isLoading} className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-1 px-4 py-2 text-sm font-semibold text-ink-2 transition hover:bg-surface-2 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh</button></div>
    {(message || error) && <p className={`mt-5 rounded-lg px-4 py-3 text-sm font-medium ${error ? 'bg-crimson/10 text-crimson' : 'bg-forest/10 text-forest'}`}>{error || message}</p>}
    <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="overflow-hidden rounded-xl border border-line bg-surface-1"><div className="flex items-center justify-between border-b border-line px-5 py-4"><div><h2 className="font-bold text-ink-1">Published skill records</h2><p className="text-xs text-ink-3">{skills.length} total · {skills.filter(item => item.isActive).length} active</p></div><CheckCircle2 className="h-5 w-5 text-forest" /></div><div className="divide-y divide-line">{isLoading ? <div className="p-6 text-sm text-ink-3">Loading skills…</div> : skills.length === 0 ? <div className="p-6 text-sm text-ink-3">No managed skills yet. Add one using the form.</div> : skills.map(item => <article key={item.id} className="flex items-center gap-3 p-4"><span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.isActive ? 'bg-forest' : 'bg-ink-3'}`} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-ink-1">{item.name}</p><p className="mt-0.5 text-xs text-ink-3">{item.category} · {item.difficulty} · {item.year}</p></div><button type="button" onClick={() => { setSkill(item); setMessage('') }} className="rounded-lg p-2 text-ink-2 transition hover:bg-surface-2 hover:text-forest" title={`Edit ${item.name}`}><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => void removeSkill(item.id)} className="rounded-lg p-2 text-ink-2 transition hover:bg-crimson/10 hover:text-crimson" title={`Delete ${item.name}`}><Trash2 className="h-4 w-4" /></button></article>)}</div></section>
      <form onSubmit={saveSkill} className="rounded-xl border border-line bg-surface-1 p-5"><div className="flex items-center justify-between"><h2 className="font-bold text-ink-1">{editing ? 'Edit skill' : 'Add skill'}</h2>{editing && <button type="button" onClick={() => setSkill(blankSkill())} className="text-xs font-semibold text-forest">New skill</button>}</div><div className="mt-4 grid gap-3"><label className="text-xs font-semibold text-ink-2">Skill ID<input required disabled={editing} value={skill.id} onChange={event => setSkill({ ...skill, id: event.target.value.toLowerCase() })} placeholder="react" className={fieldClass} /></label><label className="text-xs font-semibold text-ink-2">Name<input required value={skill.name} onChange={event => setSkill({ ...skill, name: event.target.value })} placeholder="React" className={fieldClass} /></label><label className="text-xs font-semibold text-ink-2">Description<textarea required value={skill.description} onChange={event => setSkill({ ...skill, description: event.target.value })} className={`${fieldClass} min-h-20 resize-y`} /></label><div className="grid grid-cols-2 gap-3"><label className="text-xs font-semibold text-ink-2">Category<input required value={skill.category} onChange={event => setSkill({ ...skill, category: event.target.value })} className={fieldClass} /></label><label className="text-xs font-semibold text-ink-2">Year<input required value={skill.year} onChange={event => setSkill({ ...skill, year: event.target.value })} className={fieldClass} /></label></div><div className="grid grid-cols-2 gap-3"><label className="text-xs font-semibold text-ink-2">Difficulty<select value={skill.difficulty} onChange={event => setSkill({ ...skill, difficulty: event.target.value as PortfolioSkill['difficulty'] })} className={fieldClass}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label><label className="text-xs font-semibold text-ink-2">Paradigm<input required value={skill.paradigm} onChange={event => setSkill({ ...skill, paradigm: event.target.value })} className={fieldClass} /></label></div><label className="text-xs font-semibold text-ink-2">Features <span className="font-normal text-ink-3">(comma separated)</span><input value={skill.features.join(', ')} onChange={event => setSkill({ ...skill, features: listValue(event.target.value) })} className={fieldClass} /></label><label className="text-xs font-semibold text-ink-2">Use cases <span className="font-normal text-ink-3">(comma separated)</span><input value={skill.useCases.join(', ')} onChange={event => setSkill({ ...skill, useCases: listValue(event.target.value) })} className={fieldClass} /></label><label className="flex items-center gap-2 text-sm font-medium text-ink-2"><input type="checkbox" checked={skill.isActive} onChange={event => setSkill({ ...skill, isActive: event.target.checked })} className="accent-forest" /> Show publicly</label><button type="submit" disabled={isSaving} className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-strong disabled:opacity-60"><Plus className="h-4 w-4" />{isSaving ? 'Saving…' : editing ? 'Save changes' : 'Create skill'}</button></div></form>
    </div>
  </div></main>
}
