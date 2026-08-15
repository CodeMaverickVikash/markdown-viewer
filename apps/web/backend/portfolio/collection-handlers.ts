import { errorResponse, json, readJsonBody } from '../http'
import { createSkill, listSkills } from './service'

export async function GET() {
  try {
    return json(await listSkills())
  } catch (error) {
    return errorResponse(error, 'Unable to load portfolio skills')
  }
}

export async function POST(request: Request) {
  try {
    return json(await createSkill(request.headers.get('x-user-email') ?? undefined, await readJsonBody(request)), { status: 201 })
  } catch (error) {
    return errorResponse(error, 'Unable to create portfolio skill')
  }
}
