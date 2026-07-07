import fs from 'fs'
import path from 'path'
import type { BancoPreguntas } from './evaluacion'

const CONTENT_ROOT = path.join(process.cwd(), 'content', 'balanzas-electronicas')

function preguntasPath(slug: string): string {
  return path.join(CONTENT_ROOT, slug, 'preguntas.json')
}

// Indica si el módulo ya tiene su banco de preguntas cargado.
// Se usa tanto para generar la ruta de evaluación como para mostrar
// el botón "Rendir evaluación" solo donde realmente hay datos.
export function tienePreguntas(slug: string): boolean {
  return fs.existsSync(preguntasPath(slug))
}

export function getPreguntas(slug: string): BancoPreguntas {
  const raw = fs.readFileSync(preguntasPath(slug), 'utf-8')
  return JSON.parse(raw) as BancoPreguntas
}
