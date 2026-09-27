import type { ComponentType } from 'react'
import type { Project } from '@/projects/types'
import SignatureSarvamPage from '@/projects/signature-sarvam/SignatureSarvamPage'
import { RERA_ID, SEO_DESCRIPTION, SEO_TITLE, signatureSarvam } from '@/projects/signature-sarvam/data'

/**
 * Central registry of live builder projects, keyed by slug.
 *
 * Each entry pairs the project's structured data with an optional bespoke
 * landing page and its SEO metadata. Projects without a `Page` fall back to
 * the generic layout in `app/projects/[slug]/page.tsx`.
 *
 * To add a project: create `projects/<slug>/data.ts`, optionally a page
 * component, then register it below.
 */
export interface ProjectEntry {
  project: Project
  Page?: ComponentType
  seo?: {
    title: string
    description: string
    jsonLd?: Record<string, unknown>
  }
}

export const projectRegistry: Record<string, ProjectEntry> = {
  'signature-sarvam': {
    project: signatureSarvam,
    Page: SignatureSarvamPage,
    seo: {
      title: SEO_TITLE,
      description: SEO_DESCRIPTION,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Residence',
        name: signatureSarvam.name,
        description: SEO_DESCRIPTION,
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Sector 37D, Dwarka Expressway',
          addressLocality: 'Gurugram',
          addressRegion: 'Haryana',
          addressCountry: 'IN',
        },
        numberOfRooms: '3-4 BHK',
        identifier: {
          '@type': 'PropertyValue',
          name: 'HARERA Registration',
          value: RERA_ID,
        },
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Price Range', value: 'From INR 2.89 Cr' },
          { '@type': 'PropertyValue', name: 'Developer', value: signatureSarvam.builder },
        ],
      },
    },
  },
}

export function getProjectEntry(slug: string): ProjectEntry | undefined {
  return projectRegistry[slug]
}

export function getProject(slug: string): Project | undefined {
  return projectRegistry[slug]?.project
}
