import type { Project } from '../types'

/**
 * Signature Global Sarvam — Sector 37D, Dwarka Expressway, Gurugram.
 *
 * Every figure here is transcribed from the developer's brochure and price
 * list via the Campaign Brief. Do not add a possession date until the exact
 * RERA-filed date is confirmed in writing, and do not add guaranteed-return
 * or appreciation claims (RERA compliance).
 */
export const RERA_ID = 'RC/REP/HARERA/GGM/1008/740/2025/111'

export const WHATSAPP_URL =
  'https://wa.me/918882075497?text=Hi%2C%20I%27m%20interested%20in%20Signature%20Global%20Sarvam'

export const signatureSarvam: Project = {
  slug: 'signature-sarvam',
  name: 'Signature Global Sarvam',
  builder: 'SignatureGlobal Homes Limited',
  reraId: RERA_ID,
  location: 'Sector 37D · Dwarka Expressway, Gurugram',
  heroImage: '/projects/signature-sarvam/hero.png',
  gallery: [],
  description:
    'Wellness-led 3 & 4 BHK residences at Sector 37D, Dwarka Expressway, Gurugram. Starting ₹2.89 Cr*.',
  units: [
    { type: '3BHK + 2T', areaSqft: 1815 },
    { type: '3BHK + 3T', areaSqft: 2040 },
    { type: '3BHK + 3T + Utility', areaSqft: 2260 },
    { type: '4BHK + 4T + Utility', areaSqft: 2495 },
  ],
  amenities: [
    { name: 'Vastu-conscious design by Hafeez Contractor' },
    { name: 'Tattva Wellness Spa' },
    { name: 'Michael Phelps Swimming Academy' },
    { name: 'Matrix Dance Academy by Tiger Shroff' },
  ],
  contact: {
    phone: '+918882075497',
    whatsapp: WHATSAPP_URL,
  },
}

/** Page-specific display content, kept out of the shared Project shape. */
export const TAGLINES = [
  'The New Benchmark of Luxury Living',
  "Where wellness isn't an option",
]

export const TRAVEL = [
  { time: '10', unit: 'min', place: 'Delhi' },
  { time: '15', unit: 'min', place: 'IGI Airport' },
  { time: '15', unit: 'min', place: 'Aerocity' },
  { time: '15', unit: 'min', place: 'Cyber City' },
  { time: '10', unit: 'min', place: 'Yashobhoomi Convention Centre' },
  { time: '25', unit: 'min', place: 'Diplomatic Enclave II' },
]

export const SIGNATURE_WELLNESS = [
  'Vastu-conscious design by Hafeez Contractor',
  'Iyengar Yoga by Shriyog',
  'Fitness by FITTR',
  'Tagda Raho functional training',
  'Tattva Wellness Spa — first Delhi-NCR developer tie-up',
  'Michael Phelps Swimming Academy',
  'Matrix Dance Academy by Tiger Shroff',
  'Ajivasan Music Academy by Suresh Wadkar',
  'CLIMB UP adventure & climbing by Arjun Vajpai',
]

export const EVERYDAY_AMENITIES = [
  'Lap pool',
  'Indoor pool',
  "Kids' pool",
  'Jacuzzi',
  'Mini theatre',
  'Co-working spaces',
  'Meditation zone',
  'Creche',
  "Kids' theme park",
  'Jogging track',
  'Sports courts',
  'Amphitheatre',
  'Senior citizen area',
  'Pet garden',
  'Gated community with advanced security & CCTV',
]

/** Display ranges, matching the price list exactly. */
export const UNIT_ROWS = [
  { type: '3BHK + 2T', area: '1,815 – 1,840 sq.ft.' },
  { type: '3BHK + 3T', area: '2,040 sq.ft.' },
  { type: '3BHK + 3T + Utility', area: '2,260 – 2,340 sq.ft.' },
  { type: '4BHK + 4T + Utility', area: '2,495 sq.ft.' },
]

export const PAYMENT_PLAN = [
  { pct: '9%', label: 'On booking' },
  { pct: '16%', label: 'Within 60 days' },
  { pct: '50%', label: 'Linked to construction milestones' },
  { pct: '20%', label: 'On plaster + OC application' },
  { pct: '5%', label: '+ possession charges on handover' },
]

export const SEO_TITLE =
  'Signature Global Sarvam | Luxury 3-4 BHK Homes on Dwarka Expressway, Gurugram'

export const SEO_DESCRIPTION =
  'Wellness-led 3 & 4 BHK residences at Sector 37D, Dwarka Expressway, Gurugram. Starting ₹2.89 Cr*. Book a site visit with Griham Connect.'
