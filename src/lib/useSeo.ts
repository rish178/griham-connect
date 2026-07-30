import { useEffect } from 'react'

/**
 * Applies per-page SEO tags imperatively.
 *
 * The app is a client-rendered SPA, so there is no framework-level document
 * head. Meta tags are written on mount and cleaned up on unmount so that
 * navigating between projects doesn't leak the previous project's metadata.
 *
 * Note: crawlers that don't execute JavaScript won't see these. If organic
 * search becomes a priority for a project (rather than paid-social traffic),
 * move that project to pre-rendering or SSR.
 */
export interface SeoOptions {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  /** JSON-LD structured data object. */
  jsonLd?: Record<string, unknown>
}

type MetaSpec = { key: 'name' | 'property'; value: string; content: string }

export function useSeo({ title, description, canonical, ogImage, jsonLd }: SeoOptions): void {
  useEffect(() => {
    const previousTitle = document.title
    document.title = title

    const url = canonical ?? window.location.origin + window.location.pathname

    const metas: MetaSpec[] = [
      { key: 'name', value: 'description', content: description },
      { key: 'property', value: 'og:title', content: title },
      { key: 'property', value: 'og:description', content: description },
      { key: 'property', value: 'og:type', content: 'website' },
      { key: 'property', value: 'og:url', content: url },
      { key: 'name', value: 'twitter:card', content: 'summary_large_image' },
      { key: 'name', value: 'twitter:title', content: title },
      { key: 'name', value: 'twitter:description', content: description },
    ]

    if (ogImage) {
      const absolute = ogImage.startsWith('http')
        ? ogImage
        : window.location.origin + ogImage
      metas.push({ key: 'property', value: 'og:image', content: absolute })
      metas.push({ key: 'name', value: 'twitter:image', content: absolute })
    }

    const created: Element[] = []

    for (const meta of metas) {
      const selector = `meta[${meta.key}="${meta.value}"]`
      let el = document.head.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(meta.key, meta.value)
        document.head.appendChild(el)
        created.push(el)
      }
      el.setAttribute('content', meta.content)
    }

    let linkEl = document.head.querySelector('link[rel="canonical"]')
    if (!linkEl) {
      linkEl = document.createElement('link')
      linkEl.setAttribute('rel', 'canonical')
      document.head.appendChild(linkEl)
      created.push(linkEl)
    }
    linkEl.setAttribute('href', url)

    let scriptEl: HTMLScriptElement | undefined
    if (jsonLd) {
      scriptEl = document.createElement('script')
      scriptEl.type = 'application/ld+json'
      scriptEl.textContent = JSON.stringify(jsonLd)
      document.head.appendChild(scriptEl)
    }

    return () => {
      document.title = previousTitle
      created.forEach((el) => el.remove())
      scriptEl?.remove()
    }
  }, [title, description, canonical, ogImage, jsonLd])
}
