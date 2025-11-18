export const themes = {
  starry: {
    name: "Starry Handdrawn",
    description: "Cozy anime vibes with hand-drawn elements",
    icon: "✨",
    preview: "bg-anime-purple"
  },
  sakura: {
    name: "Sakura Dreams",
    description: "Soft pink cherry blossom aesthetic",
    icon: "🌸",
    preview: "bg-pink-400"
  },
  neon: {
    name: "Neon City",
    description: "Vibrant cyberpunk inspired colors",
    icon: "🌃",
    preview: "bg-cyan-500"
  },
  minimal: {
    name: "Minimal Zen",
    description: "Clean and simple design",
    icon: "⚪",
    preview: "bg-slate-600"
  }
} as const;

export type ThemeKey = keyof typeof themes;