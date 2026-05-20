/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
		"./node_modules/flyonui/dist/js/*.js"
	],
	theme: {
		extend: {
			colors: {
				// Grove semantic tokens (HSL via CSS vars defined in index.css)
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				surface: 'hsl(var(--surface))',
				forest: {
					DEFAULT: 'hsl(var(--forest))',
					deep: 'hsl(var(--forest-deep))',
				},
				leaf: 'hsl(var(--leaf))',
				clay: 'hsl(var(--clay))',
				amber: {
					DEFAULT: 'hsl(var(--amber))',
					400: '#dba94f',
					500: 'hsl(var(--amber))',
				},
				ink: {
					DEFAULT: 'hsl(var(--foreground))',
					soft: 'hsl(var(--muted))',
					mute: 'hsl(var(--muted-foreground))',
				},

				// shadcn-style scaffolding kept so existing components don't break
				card: {
					DEFAULT: '#ffffff',
					foreground: 'hsl(var(--foreground))'
				},
				popover: {
					DEFAULT: '#ffffff',
					foreground: 'hsl(var(--foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--forest))',
					foreground: 'hsl(var(--background))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--surface))',
					foreground: 'hsl(var(--foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--surface))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--leaf))',
					foreground: '#ffffff'
				},
				destructive: {
					DEFAULT: 'hsl(var(--clay))',
					foreground: '#ffffff'
				},
				border: 'hsl(var(--foreground) / 0.10)',
				input: 'hsl(var(--foreground) / 0.10)',
				ring: 'hsl(var(--ring))',

				// Legacy aliases (so old components like Beacon/Command/Ledger keep
				// rendering instead of throwing during the migration). They now map
				// to the closest Grove semantic equivalent.
				beacon: 'hsl(var(--clay))',
				command: 'hsl(var(--forest))',
				ledger: 'hsl(var(--amber))',
			},
			fontFamily: {
				sans: [
					'DM Sans',
					'Inter',
					'system-ui',
					'sans-serif'
				],
				mono: [
					'JetBrains Mono',
					'ui-monospace',
					'monospace'
				]
			},
			backdropBlur: {
				xs: '2px'
			},
			animation: {
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				chip: '999px',
			},
			boxShadow: {
				'grove-card': '0 8px 22px -14px rgba(31,51,34,0.35)',
				'grove-sheet': '0 -14px 32px -16px rgba(31,51,34,0.3)',
				'grove-fab': '0 14px 30px -10px rgba(204,90,58,0.55)',
				'grove-primary': '0 12px 28px -12px rgba(31,51,34,0.55)',
			},
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		require("flyonui"),
		require('@iconify/tailwind').addDynamicIconSelectors(),
	],
}
