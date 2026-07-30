/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Signature Global Sarvam — quiet luxury brand system.
        // Shared across projects for now; move under a per-project theme
        // if a future project needs a different palette.
        background: '#111112',
        foreground: '#F4EFE6',
        card: '#1A1A1C',
        border: 'rgba(244, 239, 230, 0.14)',
        input: 'rgba(244, 239, 230, 0.20)',
        secondary: '#202022',
        muted: '#202022',
        'muted-foreground': '#A8A49D',
        destructive: '#E5484D',
        ink: '#111112',
        gold: '#C9A263',
        cream: '#F4EFE6',
      },
      fontFamily: {
        display: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-scrim':
          'linear-gradient(to bottom, rgba(17,17,18,0.30) 0%, rgba(17,17,18,0.65) 45%, rgba(17,17,18,1) 100%)',
        'gold-rule':
          'linear-gradient(90deg, transparent, #C9A263 20%, #C9A263 80%, transparent)',
      },
    },
  },
  plugins: [],
}
