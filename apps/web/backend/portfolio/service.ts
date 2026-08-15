import { access, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { isAllowedEmail } from '../env'
import { ApiError } from '../http'
import { normalizeSkill, type PortfolioSkill } from './model'

export async function listSkills() {
  return { skills: await readSkills() }
}

export async function createSkill(adminEmail: string | undefined, body: Record<string, unknown>) {
  requireAdmin(adminEmail)
  const skill = normalizeSkill(body)
  const skills = await readSkills()
  if (skills.some(item => item.id === skill.id)) raise('A skill with this ID already exists.', 409)
  skills.push(skill)
  await writeSkills(skills)
  return { skill }
}

export async function updateSkill(adminEmail: string | undefined, id: string, body: Record<string, unknown>) {
  requireAdmin(adminEmail)
  const skill = normalizeSkill({ ...body, id })
  const skills = await readSkills()
  const index = skills.findIndex(item => item.id === id)
  if (index < 0) raise('Portfolio skill not found.', 404)
  skills[index] = skill
  await writeSkills(skills)
  return { skill }
}

export async function removeSkill(adminEmail: string | undefined, id: string) {
  requireAdmin(adminEmail)
  const skills = await readSkills()
  const updatedSkills = skills.filter(item => item.id !== id)
  if (updatedSkills.length === skills.length) raise('Portfolio skill not found.', 404)
  await writeSkills(updatedSkills)
}

async function readSkills(): Promise<PortfolioSkill[]> {
  const filePath = await getSkillsFilePath()
  try {
    const raw = await readFile(filePath, 'utf8')
    const value: unknown = JSON.parse(raw)
    if (!Array.isArray(value)) throw new Error('Portfolio skills data must be an array.')
    return value.map(item => normalizeSkill(item as Record<string, unknown>))
  } catch (error) {
    raise(error instanceof Error ? error.message : 'Unable to read portfolio skills.', 500)
  }
}

async function writeSkills(skills: PortfolioSkill[]) {
  const filePath = await getSkillsFilePath()
  try {
    await writeFile(filePath, `${JSON.stringify(skills, null, 2)}\n`, 'utf8')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to write portfolio skills.'
    raise(`${message} Portfolio skill management requires a writable project filesystem.`, 500)
  }
}

async function getSkillsFilePath() {
  const candidates = [
    resolve(process.cwd(), 'packages/my-portfolio/src/data/tech-stack.json'),
    resolve(process.cwd(), '../../packages/my-portfolio/src/data/tech-stack.json'),
  ]
  for (const filePath of candidates) {
    try {
      await access(filePath)
      return filePath
    } catch {
      // Try the next workspace layout.
    }
  }
  raise('Unable to locate packages/my-portfolio/src/data/tech-stack.json.', 500)
}

function requireAdmin(email: string | undefined) {
  if (!isAllowedEmail(email)) raise('Portfolio management requires an authorized account.', 403)
}

function raise(message: string, status: number): never {
  throw new ApiError(message, status)
}
