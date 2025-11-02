export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-page': 'rgba(242,242,242,1)',
        'bg-content': 'rgba(255,255,255,1)',
        'bg-wash': 'rgba(0,0,0,0.05)',
        'text-primary': 'rgba(0,0,0,0.85)',
        'text-secondary': 'rgba(0,0,0,0.75)',
        'text-placeholder': 'rgba(0,0,0,0.55)',
        'border-element': 'rgba(0,0,0,0.15)',
        'border-divider': 'rgba(0,0,0,0.55)',
        'interactive-primary': 'rgba(24,119,242,1)',
        'interactive-primary-hover': 'rgba(11,94,202,1)',
        'interactive-primary-active': 'rgba(10,83,178,1)',
        'interactive-selected': 'rgba(24,119,242,0.1)',
        'icon-default': 'rgba(0,0,0,0.75)',
        'icon-placeholder': 'rgba(0,0,0,0.55)',
      },
      borderRadius: {
        'content': '6px',
        'container': '8px',
        'control': '6px',
      },
      spacing: {
        'fine': '4px',
        'normal': '8px',
        'coarse': '12px',
        'component': '16px',
        'page': '24px',
        'section': '32px',
      },
      fontFamily: {
        'custom': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'header1': ['20px', { lineHeight: '1.3', fontWeight: '700', letterSpacing: '-0.02em' }],
        'header2': ['18px', { lineHeight: '1.4', fontWeight: '700', letterSpacing: '-0.01em' }],
        'header3': ['16px', { lineHeight: '1.5', fontWeight: '600', letterSpacing: '-0.01em' }],
        'value': ['14px', { lineHeight: '1.5', fontWeight: '400', letterSpacing: '-0.005em' }],
        'accent': ['12px', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0em' }],
      },
      boxShadow: {
        'card-sm': '0px 0px 5px 0px rgba(0,0,0,0.1), 0px 0px 1px 0px rgba(0,0,0,0.1)',
        'card-md': '0px 2px 8px 0px rgba(0,0,0,0.1), 0px 1px 1px 0px rgba(0,0,0,0.1)',
        'card-lg': '0px 2px 12px 2px rgba(0,0,0,0.1), 0px 1px 2px 0px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
};
