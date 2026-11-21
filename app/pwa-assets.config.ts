import { defineConfig } from '@vite-pwa/assets-generator/config'

// Icônes (H12) générées depuis public/favicon.svg : logo blanc sur un carré bleu nuit arrondi.
// Masquable et Apple : même dessin réduit, sur fond bleu nuit plein (marge de sécurité).
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    transparent: { sizes: [64, 192, 512], favicons: [[48, 'favicon.ico']], padding: 0 },
    maskable: { sizes: [512], padding: 0.3, resizeOptions: { background: '#1E2B4F' } },
    apple: { sizes: [180], padding: 0.2, resizeOptions: { background: '#1E2B4F' } },
  },
  images: ['public/favicon.svg'],
})
