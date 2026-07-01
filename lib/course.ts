import fs from 'fs'
import path from 'path'

const CONTENT_ROOT = path.join(process.cwd(), 'content', 'balanzas-electronicas')

export interface Modulo {
  orden: number
  slug: string
  titulo: string
  tiene_evaluacion: boolean
}

export interface Curso {
  slug: string
  titulo: string
  version: string
  modulos: Modulo[]
}

export function getCourse(): Curso {
  const filePath = path.join(CONTENT_ROOT, 'curso.json')
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as Curso
}
