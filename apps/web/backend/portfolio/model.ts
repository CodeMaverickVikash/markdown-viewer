export interface PortfolioSkill {
  id: string
  name: string
  description: string
  category: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  year: string
  paradigm: string
  features: string[]
  useCases: string[]
  icon: string
  isActive: boolean
}

export interface PortfolioSkillRow {
  id: string
  name: string
  description: string
  category: string
  difficulty: PortfolioSkill['difficulty']
  year: string
  paradigm: string
  features: string[]
  use_cases: string[]
  icon: string
  is_active: boolean
}

const difficulties = new Set<PortfolioSkill['difficulty']>(['Beginner', 'Intermediate', 'Advanced'])

export function mapSkill(row: PortfolioSkillRow): PortfolioSkill {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    difficulty: row.difficulty,
    year: row.year,
    paradigm: row.paradigm,
    features: row.features,
    useCases: row.use_cases,
    icon: row.icon,
    isActive: row.is_active,
  }
}

export function normalizeSkill(body: Record<string, unknown>): PortfolioSkill {
  const value = (key: string) => typeof body[key] === 'string' ? body[key].trim() : ''
  const list = (key: string) => Array.isArray(body[key])
    ? body[key].filter((item): item is string => typeof item === 'string').map(item => item.trim()).filter(Boolean)
    : []
  const difficulty = value('difficulty') as PortfolioSkill['difficulty']
  const id = value('id').toLowerCase()

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error('Skill ID must use lowercase letters, numbers, and hyphens.')
  if (!value('name') || !value('description') || !value('category') || !value('year') || !value('paradigm')) {
    throw new Error('Name, description, category, year, and paradigm are required.')
  }
  if (!difficulties.has(difficulty)) throw new Error('Difficulty must be Beginner, Intermediate, or Advanced.')

  return {
    id,
    name: value('name'),
    description: value('description'),
    category: value('category'),
    difficulty,
    year: value('year'),
    paradigm: value('paradigm'),
    features: list('features'),
    useCases: list('useCases'),
    icon: value('icon') || 'default',
    isActive: body.isActive !== false,
  }
}
