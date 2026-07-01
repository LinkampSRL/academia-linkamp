import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CONTENT_ROOT = path.join(process.cwd(), 'content', 'balanzas-electronicas')

export interface ModuleFrontmatter {
  modulo: string
  titulo: string
  curso: string
  version: string
}

export interface ModuleContent {
  frontmatter: ModuleFrontmatter
  content: string
}

export function getModuleContent(slug: string): ModuleContent {
  const filePath = path.join(CONTENT_ROOT, slug, 'contenido.md')
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return {
    frontmatter: data as ModuleFrontmatter,
    content,
  }
}

// Extrae los títulos ### (subsecciones) del Markdown para mostrarlos en el sidebar.
export function getModuleSections(slug: string): string[] {
  const { content } = getModuleContent(slug)
  const matches = content.match(/^### .+/gm) ?? []
  return matches.map((h) => h.replace(/^### /, '').trim())
}
