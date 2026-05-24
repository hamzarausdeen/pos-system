export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 20px 60px rgba(15, 23, 42, 0.12)'
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at top, rgba(16, 185, 129, 0.18), transparent 40%)'
      }
    }
  },
  plugins: []
};
