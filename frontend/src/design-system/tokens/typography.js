// Typography system that emphasizes readability and professionalism
export const typography = {
  fontFamily: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'IBM Plex Mono', monospace"
  },
  
  // Professional type scale with clear hierarchy
  size: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    md: '1.125rem',   // 18px
    lg: '1.25rem',    // 20px
    xl: '1.5rem',     // 24px
    '2xl': '1.875rem',// 30px
    '3xl': '2.25rem', // 36px
  },

  // Line heights optimized for readability
  lineHeight: {
    tight: 1.2,
    base: 1.5,
    relaxed: 1.75
  },

  // Font weights that work well across different screens
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },

  // Standardized styles for common text elements
  styles: {
    h1: {
      fontSize: '2.25rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.02em'
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.01em'
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.2
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.2
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.5
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.2,
      textTransform: 'none' // More modern approach than all-caps
    }
  }
}
