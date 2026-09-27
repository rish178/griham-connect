export interface ProjectAmenity {
  name: string
  icon?: string
}

export interface ProjectUnit {
  type: string // e.g. "3 BHK"
  areaSqft: number
  priceInr?: number
}

export interface Project {
  slug: string
  name: string
  builder: string
  reraId: string
  location: string
  possessionDate?: string
  heroImage: string
  gallery: string[]
  description: string
  units: ProjectUnit[]
  amenities: ProjectAmenity[]
  contact: {
    phone: string
    whatsapp: string
    email?: string
  }
}
