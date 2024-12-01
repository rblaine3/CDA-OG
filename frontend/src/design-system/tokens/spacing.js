// Spacing system based on 4px grid for consistency
export const spacing = {
  // Base unit: 4px
  0: '0',
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
}

// Layout-specific spacing
export const layout = {
  page: {
    maxWidth: '1280px',
    padding: {
      desktop: spacing[6],
      tablet: spacing[4],
      mobile: spacing[3]
    }
  },
  section: {
    spacing: {
      desktop: spacing[16],
      tablet: spacing[12],
      mobile: spacing[8]
    }
  },
  card: {
    padding: {
      desktop: spacing[6],
      tablet: spacing[4],
      mobile: spacing[3]
    }
  }
}
