import type { ComponentType } from 'react'
import type { Project } from '../projects/types'
import SignatureSarvamPage from '../projects/signature-sarvam/SignatureSarvamPage'
import { signatureSarvam } from '../projects/signature-sarvam/data'

/**
 * Central registry of live builder projects, keyed by slug.
 *
 * Each entry pairs the project's structured data with an optional bespoke
 * landing page. Projects without a `Page` fall back to the generic layout in
 * `pages/ProjectLandingPage.tsx`.
 *
 * To add a project: create `src/projects/<slug>/data.ts` (see
 * `cluade_skills/04-brochure-parser.md`), optionally a page component, then
 * register it below.
 */
export interface ProjectEntry {
  project: Project
  Page?: ComponentType
}

export const projectRegistry: Record<string, ProjectEntry> = {
  'signature-sarvam': {
    project: signatureSarvam,
    Page: SignatureSarvamPage,
  },
}

export function getProjectEntry(slug: string): ProjectEntry | undefined {
  return projectRegistry[slug]
}

export function getProject(slug: string): Project | undefined {
  return projectRegistry[slug]?.project
}
