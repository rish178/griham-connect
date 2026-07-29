import type { Project } from '../projects/types'

/**
 * Central registry of live builder projects, keyed by slug.
 * Register a project here once its content has been parsed
 * (see cluade_skills/04-brochure-parser.md) and approved.
 *
 * Example, once signature-sarvam is added:
 *   import { signatureSarvam } from '../projects/signature-sarvam/data'
 *   export const projectRegistry: Record<string, Project> = {
 *     'signature-sarvam': signatureSarvam,
 *   }
 */
export const projectRegistry: Record<string, Project> = {}

export function getProject(slug: string): Project | undefined {
  return projectRegistry[slug]
}
