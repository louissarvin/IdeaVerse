/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'pixel': ['Press Start 2P', 'monospace'],
        'orbitron': ['Orbitron', 'monospace'],
      },
      colors: {
        'sunset-coral': '#F56C6C',
        'moss-green': '#8BAF96',
        'sky-blue': '#83C5BE',
        'mint-green': '#CFE8E2',
        'lavender': '#EADDE9',
      },
      backgroundImage: {
        'dreamy-gradient': 'linear-gradient(135deg, #CFE8E2 0%, #EADDE9 100%)',
        'hero-gradient': 'linear-gradient(180deg, rgba(207, 232, 226, 0.8) 0%, rgba(234, 221, 233, 0.8) 100%)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
        'slide-up': 'slide-up 0.6s ease-out',
        'helicarrier-float': 'helicarrier-float 8s ease-in-out infinite',
        'support-vehicle-1': 'support-vehicle-1 12s ease-in-out infinite',
        'support-vehicle-2': 'support-vehicle-2 10s ease-in-out infinite',
        'idea-float': 'idea-float 4s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pixel-glow': 'pixel-glow 1.5s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateX(0px) translateY(0px)' },
          '25%': { transform: 'translateX(20px) translateY(-5px)' },
          '50%': { transform: 'translateX(40px) translateY(-10px)' },
          '75%': { transform: 'translateX(20px) translateY(-5px)' },
        },
        'helicarrier-float': {
          '0%, 100%': { transform: 'translateX(-50%) translateY(0px) rotate(0deg)' },
          '25%': { transform: 'translateX(-45%) translateY(-15px) rotate(1deg)' },
          '50%': { transform: 'translateX(-55%) translateY(-25px) rotate(0deg)' },
          '75%': { transform: 'translateX(-50%) translateY(-15px) rotate(-1deg)' },
        },
        'support-vehicle-1': {
          '0%, 100%': { transform: 'translateX(0px) translateY(0px)' },
          '33%': { transform: 'translateX(100px) translateY(-20px)' },
          '66%': { transform: 'translateX(200px) translateY(-10px)' },
        },
        'support-vehicle-2': {
          '0%, 100%': { transform: 'translateX(0px) translateY(0px)' },
          '50%': { transform: 'translateX(-150px) translateY(-30px)' },
        },
        'idea-float': {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '25%': { transform: 'translateY(-20px) scale(1.1)' },
          '50%': { transform: 'translateY(-40px) scale(1)' },
          '75%': { transform: 'translateY(-20px) scale(0.9)' },
        },
        'pulse-glow': {
          '0%': { 
            'box-shadow': '0 0 5px rgba(245, 108, 108, 0.5)',
            'transform': 'scale(1)',
          },
          '100%': { 
            'box-shadow': '0 0 20px rgba(245, 108, 108, 0.8)',
            'transform': 'scale(1.02)',
          },
        },
        'pixel-glow': {
          '0%': { 
            'box-shadow': '0 0 10px rgba(131, 197, 190, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.1)',
          },
          '100%': { 
            'box-shadow': '0 0 20px rgba(131, 197, 190, 0.9), inset 0 0 20px rgba(255, 255, 255, 0.2)',
          },
        },
        'slide-up': {
          '0%': { 
            'opacity': '0',
            'transform': 'translateY(30px)',
          },
          '100%': { 
            'opacity': '1',
            'transform': 'translateY(0)',
          },
        },
      },
      fontSize: {
        'pixel-xs': ['10px', { lineHeight: '14px', letterSpacing: '0.05em' }],
        'pixel-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.05em' }],
        'pixel-base': ['14px', { lineHeight: '20px', letterSpacing: '0.05em' }],
        'pixel-lg': ['16px', { lineHeight: '24px', letterSpacing: '0.05em' }],
        'pixel-xl': ['20px', { lineHeight: '28px', letterSpacing: '0.05em' }],
        'pixel-2xl': ['24px', { lineHeight: '32px', letterSpacing: '0.05em' }],
        'pixel-3xl': ['30px', { lineHeight: '36px', letterSpacing: '0.05em' }],
        'pixel-4xl': ['36px', { lineHeight: '40px', letterSpacing: '0.05em' }],
        'pixel-5xl': ['48px', { lineHeight: '52px', letterSpacing: '0.05em' }],
        'pixel-6xl': ['60px', { lineHeight: '64px', letterSpacing: '0.05em' }],
      },
    },
  },
  plugins: [],
};