// Vitest setup file for web feature tests
// Mock browser globals that don't exist in jsdom

// Mock navigator.vibrate
Object.defineProperty(navigator, 'vibrate', {
  value: () => true,
  writable: true,
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})
