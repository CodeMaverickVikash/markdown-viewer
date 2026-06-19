'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  AlignLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Clock,
  Copy,
  GripVertical,
  Loader2,
  Palette,
  Pin,
  PinOff,
  Plus,
  Trash2,
  toast,
} from '@mypartner/common/dependencies'
import { cx } from '@mypartner/common'
import type { LocalNote, NoteColor, SyncStatus } from '../types'

// ── Helpers ───────────────────────────────────────────────────────────────────

const accent: Record<NoteColor, string> = {
  mint: '#36a278', sky: '#3b82f6', coral: '#f87171', gold: '#f59e0b',
}

const colorLabel: Record<NoteColor, string> = {
  mint: 'Mint', sky: 'Sky', coral: 'Coral', gold: 'Gold',
}

const getTitle = (body: string) =>
  body.trim().split('\n')[0].replace(/^#+\s*/, '').trim() || 'Untitled'

const formatRelativeDate = (value: string) => {
  const diffMs = Date.now() - new Date(value).getTime()
  const mins = diffMs / 60000
  const hours = mins / 60
  const days = hours / 24
  if (mins < 1) return 'just now'
  if (mins < 60) return `${Math.floor(mins)}m ago`
  if (hours < 24) return `${Math.floor(hours)}h ago`
  if (days < 7)
    return new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(new Date(value))
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
    new Date(value),
  )
}

// ── Types / constants ─────────────────────────────────────────────────────────

type ColId = 'title' | 'color' | 'date'
type SortKey = 'title' | 'updatedAt' | null
type SortDir = 'asc' | 'desc'

const COL_LABEL: Record<ColId, string> = { title: 'Title', color: 'Color', date: 'Updated' }
const COL_SORT: Partial<Record<ColId, 'title' | 'updatedAt'>> = { title: 'title', date: 'updatedAt' }
const COL_W_DEFAULT: Record<ColId, number> = { title: 92, color: 50, date: 54 }
const COL_W_MIN: Record<ColId, number> = { title: 60, color: 44, date: 48 }
const COL_W_MAX: Record<ColId, number> = { title: 280, color: 120, date: 160 }

export interface NoteTableProps {
  notes: LocalNote[]
  activeNoteId: string | null
  dirtyNoteIds: Set<string>
  onSelect: (localId: string) => void
  onTogglePin: (localId: string, pinned: boolean) => void
  onDelete?: (localId: string) => void
  onAdd?: () => void
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ColIcon({ colId }: { colId: ColId }) {
  if (colId === 'title') return <AlignLeft className="h-3 w-3" />
  if (colId === 'color') return <Palette className="h-3 w-3" />
  return <Calendar className="h-3 w-3" />
}

function SortIcon({
  colId, sortKey, sortDir,
}: { colId: ColId; sortKey: SortKey; sortDir: SortDir }) {
  const sortCol = COL_SORT[colId]
  if (!sortCol || sortKey !== sortCol)
    return <ChevronsUpDown className="h-3 w-3 opacity-0 group-hover/col:opacity-40 transition-opacity" />
  return sortDir === 'asc'
    ? <ChevronUp className="h-3 w-3 text-forest" />
    : <ChevronDown className="h-3 w-3 text-forest" />
}

function ResizeHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  return (
    <div
      className="absolute right-0 top-0 h-full w-4 cursor-col-resize flex items-center justify-center opacity-0 group-hover/col:opacity-100 transition-opacity z-10"
      onMouseDown={onMouseDown}
    >
      <div className="w-0.5 h-5 rounded-full bg-forest" />
    </div>
  )
}

function RowSyncIcon({ status }: { status: SyncStatus }) {
  if (status === 'synced') return null
  if (status === 'syncing') return <Loader2 className="h-3 w-3 animate-spin text-forest" />
  if (status === 'failed') return <AlertCircle className="h-3 w-3 text-crimson" />
  return <Clock className="h-3 w-3 text-ink-3" />
}

// ── Main component ────────────────────────────────────────────────────────────

export default function NoteTable({
  notes,
  activeNoteId,
  dirtyNoteIds,
  onSelect,
  onTogglePin,
  onDelete,
  onAdd,
}: NoteTableProps) {
  // Column order — draggable middle columns; # and Actions are fixed
  const [colOrder, setColOrder] = useState<ColId[]>(['title', 'color', 'date'])
  // Column widths
  const [colW, setColW] = useState<Record<ColId, number>>({ ...COL_W_DEFAULT })
  // Sort
  const [sortKey, setSortKey] = useState<SortKey>(null)
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  // Hover & resize indicator
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [resizeLineX, setResizeLineX] = useState<number | null>(null)
  // Manual row order (overrides sort when user drags rows)
  const [rowOrder, setRowOrder] = useState<string[]>([])
  // Column DnD visual state
  const [dragOverColId, setDragOverColId] = useState<ColId | null>(null)
  const [dragOverColSide, setDragOverColSide] = useState<'left' | 'right'>('left')
  // Row DnD visual state
  const [dragOverRowId, setDragOverRowId] = useState<string | null>(null)
  const [dropPos, setDropPos] = useState<'above' | 'below'>('below')
  const [isDraggingRow, setIsDraggingRow] = useState(false)

  // Mutable refs — no re-renders needed for these
  const resizingRef = useRef<{ col: ColId; startX: number; startW: number } | null>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const dragColRef = useRef<ColId | null>(null)
  const dragRowRef = useRef<string | null>(null)
  const dragOverColSideRef = useRef<'left' | 'right'>('left')
  const dropPosRef = useRef<'above' | 'below'>('below')

  // ── Derived notes ─────────────────────────────────────────────────────────────

  const displayNotes = useMemo(() => {
    if (!sortKey) return notes
    return [...notes].sort((a, b) => {
      const cmp = sortKey === 'title'
        ? getTitle(a.body).localeCompare(getTitle(b.body))
        : new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [notes, sortKey, sortDir])

  // Reset manual row order when user applies a column sort
  useEffect(() => { setRowOrder([]) }, [sortKey])

  // Merge manual row order with the current note list
  const orderedNotes = useMemo(() => {
    if (rowOrder.length === 0) return displayNotes
    const orderMap = new Map(rowOrder.map((id, i) => [id, i]))
    const inOrder = displayNotes
      .filter(n => orderMap.has(n.localId))
      .sort((a, b) => (orderMap.get(a.localId) ?? 0) - (orderMap.get(b.localId) ?? 0))
    const notInOrder = displayNotes.filter(n => !orderMap.has(n.localId))
    return [...inOrder, ...notInOrder]
  }, [displayNotes, rowOrder])

  // Keep a ref so drop handlers can read the latest order without a dep
  const orderedNotesRef = useRef(orderedNotes)
  orderedNotesRef.current = orderedNotes

  // ── Column resize ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const r = resizingRef.current
      if (!r) return
      const delta = e.clientX - r.startX
      const clamped = Math.max(COL_W_MIN[r.col], Math.min(COL_W_MAX[r.col], r.startW + delta))
      setColW(prev => ({ ...prev, [r.col]: clamped }))
      if (tableRef.current) {
        const rect = tableRef.current.getBoundingClientRect()
        setResizeLineX(Math.max(0, e.clientX - rect.left))
      }
    }
    const onUp = () => {
      if (!resizingRef.current) return
      resizingRef.current = null
      setResizeLineX(null)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [])

  const startResize = useCallback((col: ColId, e: React.MouseEvent) => {
    e.preventDefault()
    resizingRef.current = { col, startX: e.clientX, startW: colW[col] }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [colW])

  // ── Sort ──────────────────────────────────────────────────────────────────────

  const handleSortClick = useCallback((key: 'title' | 'updatedAt') => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc')
      else { setSortKey(null); setSortDir('desc') }
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }, [sortKey, sortDir])

  // ── Copy ──────────────────────────────────────────────────────────────────────

  const handleCopy = useCallback(async (body: string) => {
    await navigator.clipboard.writeText(getTitle(body))
    toast.success('Copied')
  }, [])

  // ── Column DnD ────────────────────────────────────────────────────────────────

  const handleColDragStart = useCallback((colId: ColId, e: React.DragEvent) => {
    dragColRef.current = colId
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleColDragOver = useCallback((colId: ColId, e: React.DragEvent) => {
    e.preventDefault()
    if (dragColRef.current === colId) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const side: 'left' | 'right' = e.clientX < rect.left + rect.width / 2 ? 'left' : 'right'
    dragOverColSideRef.current = side
    setDragOverColId(colId)
    setDragOverColSide(side)
  }, [])

  const handleColDrop = useCallback((targetCol: ColId) => {
    const from = dragColRef.current
    if (!from || from === targetCol) {
      setDragOverColId(null)
      dragColRef.current = null
      return
    }
    const side = dragOverColSideRef.current
    setColOrder(prev => {
      const next = [...prev].filter(c => c !== from)
      let idx = next.indexOf(targetCol)
      if (side === 'right') idx += 1
      next.splice(idx, 0, from)
      return next
    })
    setDragOverColId(null)
    dragColRef.current = null
  }, [])

  const handleColDragEnd = useCallback(() => {
    dragColRef.current = null
    setDragOverColId(null)
  }, [])

  // ── Row DnD ───────────────────────────────────────────────────────────────────

  const handleRowDragStart = useCallback((localId: string, e: React.DragEvent) => {
    dragRowRef.current = localId
    setIsDraggingRow(true)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleRowDragOver = useCallback((localId: string, e: React.DragEvent) => {
    e.preventDefault()
    if (dragRowRef.current === localId) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const pos: 'above' | 'below' = e.clientY < rect.top + rect.height / 2 ? 'above' : 'below'
    dropPosRef.current = pos
    setDragOverRowId(localId)
    setDropPos(pos)
  }, [])

  const handleRowDrop = useCallback((targetId: string) => {
    const fromId = dragRowRef.current
    if (!fromId || fromId === targetId) {
      setDragOverRowId(null)
      dragRowRef.current = null
      setIsDraggingRow(false)
      return
    }
    const pos = dropPosRef.current
    setRowOrder(prev => {
      const base = prev.length > 0 ? prev : orderedNotesRef.current.map(n => n.localId)
      const next = [...base].filter(id => id !== fromId)
      let idx = next.indexOf(targetId)
      if (pos === 'below') idx += 1
      next.splice(Math.max(0, idx), 0, fromId)
      return next
    })
    setDragOverRowId(null)
    dragRowRef.current = null
    setIsDraggingRow(false)
  }, [])

  const handleRowDragEnd = useCallback(() => {
    dragRowRef.current = null
    setDragOverRowId(null)
    setIsDraggingRow(false)
  }, [])

  // ── Layout ────────────────────────────────────────────────────────────────────

  // Fixed first col (36) + dynamic middle cols + fixed actions col (52)
  const totalWidth = 36 + colOrder.reduce((sum, c) => sum + colW[c], 0) + 52

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div
      ref={tableRef}
      className="relative mt-1 rounded-lg border border-line overflow-x-auto animate-fade-in"
    >
      {/* Column resize live indicator */}
      {resizeLineX !== null && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-forest z-20 pointer-events-none"
          style={{ left: resizeLineX }}
        />
      )}

      <table className="border-collapse table-fixed text-left" style={{ width: totalWidth }}>
        <colgroup>
          <col style={{ width: 36 }} />
          {colOrder.map(colId => <col key={colId} style={{ width: colW[colId] }} />)}
          <col style={{ width: 52 }} />
        </colgroup>

        {/* ── Header ── */}
        <thead className="bg-surface-2 border-b-2 border-line">
          <tr>
            {/* Serial # — fixed, not draggable */}
            <th className="py-2 pl-1 pr-0">
              <div className="flex items-center gap-0.5">
                <GripVertical className="h-3.5 w-3.5 text-ink-3/30 shrink-0" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">#</span>
              </div>
            </th>

            {colOrder.map(colId => {
              const sortCol = COL_SORT[colId]
              const isDropTarget = dragOverColId === colId
              return (
                <th
                  key={colId}
                  draggable
                  onDragStart={e => handleColDragStart(colId, e)}
                  onDragOver={e => handleColDragOver(colId, e)}
                  onDrop={() => handleColDrop(colId)}
                  onDragEnd={handleColDragEnd}
                  className={cx(
                    'group/col relative py-2 pl-2 pr-0 select-none transition-colors cursor-grab active:cursor-grabbing',
                    isDropTarget ? 'bg-forest/10' : '',
                  )}
                  style={{
                    boxShadow: isDropTarget
                      ? dragOverColSide === 'left'
                        ? 'inset 2px 0 0 var(--color-forest)'
                        : 'inset -2px 0 0 var(--color-forest)'
                      : undefined,
                  }}
                >
                  <div className="flex items-center gap-0.5">
                    <GripVertical className="h-3.5 w-3.5 text-ink-3 opacity-20 group-hover/col:opacity-60 transition-opacity shrink-0" />
                    {sortCol ? (
                      <button
                        type="button"
                        onClick={() => handleSortClick(sortCol)}
                        className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-3 hover:text-ink-1 transition-colors cursor-pointer"
                      >
                        <span className="text-ink-3/60"><ColIcon colId={colId} /></span>
                        {COL_LABEL[colId]}
                        <SortIcon colId={colId} sortKey={sortKey} sortDir={sortDir} />
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                        <span className="text-ink-3/60"><ColIcon colId={colId} /></span>
                        {COL_LABEL[colId]}
                      </span>
                    )}
                  </div>
                  <ResizeHandle onMouseDown={e => startResize(colId, e)} />
                </th>
              )
            })}

            {/* Actions — fixed, not draggable */}
            <th className="py-2 pr-1" />
          </tr>
        </thead>

        {/* ── Body ── */}
        <tbody>
          {orderedNotes.map((note, i) => {
            const active = note.localId === activeNoteId
            const dirty = dirtyNoteIds.has(note.localId)
            const isHovered = hoveredId === note.localId
            const isDropTarget = dragOverRowId === note.localId
            const title = getTitle(note.body)

            return (
              <tr
                key={note.localId}
                draggable
                onDragStart={e => handleRowDragStart(note.localId, e)}
                onDragOver={e => handleRowDragOver(note.localId, e)}
                onDragLeave={() => setDragOverRowId(null)}
                onDrop={() => handleRowDrop(note.localId)}
                onDragEnd={handleRowDragEnd}
                onClick={() => onSelect(note.localId)}
                onMouseEnter={() => setHoveredId(note.localId)}
                onMouseLeave={() => setHoveredId(null)}
                className={cx(
                  'border-b border-line/40 cursor-pointer transition-colors duration-100 animate-note-in',
                  active ? 'bg-forest/[0.07]' : isHovered && !isDraggingRow ? 'bg-surface-2' : '',
                )}
                style={{
                  animationDelay: `${Math.min(i * 20, 180)}ms`,
                  ...(active
                    ? { outline: '2px solid var(--color-forest)', outlineOffset: '-1px' }
                    : {}),
                  ...(isDropTarget
                    ? { boxShadow: dropPos === 'above' ? 'inset 0 2px 0 var(--color-forest)' : 'inset 0 -2px 0 var(--color-forest)' }
                    : {}),
                }}
              >
                {/* Serial number + persistent grip handle */}
                <td
                  className="py-2.5 pl-1 pr-0"
                  style={{ borderLeft: `3px solid ${accent[note.color]}` }}
                >
                  <div className="flex items-center gap-0.5">
                    <GripVertical
                      className={cx(
                        'h-3.5 w-3.5 shrink-0 transition-all duration-150',
                        isHovered ? 'text-ink-2 opacity-100 cursor-grab' : 'text-ink-3 opacity-20',
                      )}
                    />
                    <span className={cx(
                      'text-[10px] tabular-nums leading-none transition-colors',
                      active ? 'font-semibold text-forest' : 'text-ink-3',
                    )}>
                      {i + 1}
                    </span>
                  </div>
                </td>

                {/* Dynamic columns rendered in colOrder */}
                {colOrder.map(colId => {
                  if (colId === 'title') return (
                    <td key="title" className="py-2.5 pl-2 pr-1 overflow-hidden">
                      <div className="flex items-center gap-1 min-w-0">
                        {note.pinned && <Pin className="h-3 w-3 shrink-0 text-forest" />}
                        <span className={cx(
                          'truncate text-[13px]',
                          active ? 'font-semibold text-forest' : 'font-medium text-ink-1',
                        )}>
                          {title}
                        </span>
                      </div>
                    </td>
                  )
                  if (colId === 'color') return (
                    <td key="color" className="py-2.5 pl-2 overflow-hidden">
                      <span
                        className="inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                        style={{ backgroundColor: `${accent[note.color]}22`, color: accent[note.color] }}
                      >
                        {colorLabel[note.color]}
                      </span>
                    </td>
                  )
                  return (
                    <td key="date" className="py-2.5 pl-2 overflow-hidden">
                      <span className="block truncate text-[11px] text-ink-3">
                        {formatRelativeDate(note.updatedAt)}
                      </span>
                    </td>
                  )
                })}

                {/* Row actions */}
                <td className="py-2.5 pr-1.5">
                  <div className="flex items-center justify-end gap-0.5">
                    {isHovered && !isDraggingRow ? (
                      <>
                        <button
                          type="button"
                          title="Copy title"
                          onClick={e => { e.stopPropagation(); void handleCopy(note.body) }}
                          className="flex h-5 w-5 items-center justify-center rounded text-ink-3 hover:text-ink-1 hover:bg-surface-0 transition-colors"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          title={note.pinned ? 'Unpin' : 'Pin'}
                          onClick={e => { e.stopPropagation(); onTogglePin(note.localId, note.pinned) }}
                          className={cx(
                            'flex h-5 w-5 items-center justify-center rounded transition-colors',
                            note.pinned
                              ? 'text-forest hover:bg-forest/10'
                              : 'text-ink-3 hover:text-forest hover:bg-forest/10',
                          )}
                        >
                          {note.pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                        </button>
                        {onDelete && (
                          <button
                            type="button"
                            title="Delete"
                            onClick={e => { e.stopPropagation(); onDelete(note.localId) }}
                            className="flex h-5 w-5 items-center justify-center rounded text-ink-3 hover:text-crimson hover:bg-crimson/10 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </>
                    ) : dirty ? (
                      <Clock className="h-3 w-3 text-amber-500" />
                    ) : (
                      <RowSyncIcon status={note.syncStatus} />
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>

        {/* ── Footer: + New ── */}
        {onAdd && (
          <tfoot>
            <tr>
              <td colSpan={colOrder.length + 2} className="border-t border-line/50 py-1.5 pl-3">
                <button
                  type="button"
                  onClick={onAdd}
                  className="flex items-center gap-1.5 text-[11px] text-ink-3 hover:text-forest transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New
                </button>
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
