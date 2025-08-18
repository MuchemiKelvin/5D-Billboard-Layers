import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				hologram: {
					primary: 'hsl(var(--hologram-primary))',
					secondary: 'hsl(var(--hologram-secondary))',
					accent: 'hsl(var(--hologram-accent))'
				},
				neon: 'hsl(var(--neon-glow))',
				cyber: 'hsl(var(--cyber-dark))',
				'slot-border': 'hsl(var(--slot-border))',
				'live-bidding': 'hsl(var(--live-bidding))'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'hologram-glow': {
					'0%, 100%': {
						opacity: '0.8',
						transform: 'scale(1)',
						filter: 'hue-rotate(0deg)'
					},
					'50%': {
						opacity: '1',
						transform: 'scale(1.05)',
						filter: 'hue-rotate(90deg)'
					}
				},
				'neon-pulse': {
					'0%, 100%': {
						opacity: '1',
						boxShadow: '0 0 20px hsl(var(--neon-glow) / 0.5)'
					},
					'50%': {
						opacity: '0.8',
						boxShadow: '0 0 40px hsl(var(--neon-glow) / 0.8), 0 0 60px hsl(var(--neon-glow) / 0.3)'
					}
				},
				'slot-fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px) scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0) scale(1)'
					}
				},
				'slot-fade-out': {
					'0%': {
						opacity: '1',
						transform: 'translateY(0) scale(1)'
					},
					'100%': {
						opacity: '0',
						transform: 'translateY(-20px) scale(0.95)'
					}
				},
				'cyber-scan': {
					'0%': {
						transform: 'translateX(-100%)'
					},
					'100%': {
						transform: 'translateX(100%)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'hologram-glow': 'hologram-glow 3s ease-in-out infinite',
				'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
				'slot-fade-in': 'slot-fade-in 0.6s ease-out',
				'slot-fade-out': 'slot-fade-out 0.6s ease-out',
				'cyber-scan': 'cyber-scan 2s linear infinite'
			},
			backgroundImage: {
				'gradient-hologram': 'var(--gradient-hologram)',
				'gradient-cyber': 'var(--gradient-cyber)',
				'gradient-neon': 'var(--gradient-neon)',
				'gradient-sponsor-slot': 'var(--gradient-sponsor-slot)'
			},
			boxShadow: {
				'hologram': 'var(--shadow-hologram)',
				'neon': 'var(--shadow-neon)',
				'cyber': 'var(--shadow-cyber)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
