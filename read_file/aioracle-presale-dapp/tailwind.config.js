module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#020617',
        panel: 'rgba(255,255,255,0.03)',
        cyan: '#22d3ee',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        cyan: '0 0 50px rgba(34, 211, 238, 0.08)',
      },
    },
  },
  plugins: [],
};
