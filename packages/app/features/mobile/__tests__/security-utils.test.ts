import { describe, expect, it, vi } from 'vitest'

vi.mock('react-native', () => ({
  Platform: {
    OS: 'web',
    constants: {},
  },
  Alert: {
    alert: vi.fn(),
  },
}))

vi.mock('expo-secure-store', () => ({
  setItemAsync: vi.fn(),
  getItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}))

import {
  isUrlSafe,
  sanitizeEmail,
  sanitizeForQuery,
  sanitizeInput,
} from '../security-utils'

describe('sanitizeInput', () => {
  it('strips HTML tags', () => {
    expect(sanitizeInput('<b>bold</b> text')).not.toContain('<b>')
  })

  it('removes script tags and content', () => {
    expect(sanitizeInput('hello <script>alert("xss")</script> world')).toBe('hello  world')
  })

  it('escapes special characters', () => {
    const result = sanitizeInput('a & b < c > d')
    expect(result).toContain('&amp;')
    expect(result).toContain('&lt;')
    expect(result).toContain('&gt;')
  })

  it('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello')
  })

  it('handles an empty string', () => {
    expect(sanitizeInput('')).toBe('')
  })
})

describe('sanitizeEmail', () => {
  it('lowercases email values', () => {
    expect(sanitizeEmail('User@Example.COM')).toBe('user@example.com')
  })

  it('trims surrounding whitespace', () => {
    expect(sanitizeEmail('  user@test.com  ')).toBe('user@test.com')
  })

  it('removes invalid characters', () => {
    expect(sanitizeEmail('user{}@test.com')).toBe('user@test.com')
  })

  it('preserves valid email characters', () => {
    expect(sanitizeEmail('user+tag@sub.domain.com')).toBe('user+tag@sub.domain.com')
  })
})

describe('sanitizeForQuery', () => {
  it('removes single quotes', () => {
    expect(sanitizeForQuery("O'Brien")).toBe('OBrien')
  })

  it('removes semicolons', () => {
    expect(sanitizeForQuery('DROP; TABLE')).toBe('DROP TABLE')
  })

  it('removes double dashes', () => {
    expect(sanitizeForQuery('value--comment')).toBe('valuecomment')
  })
})

describe('isUrlSafe', () => {
  it('allows HTTPS URLs', () => {
    expect(isUrlSafe('https://api.vct-platform.com/v1/test')).toBe(true)
  })

  it('allows the custom app scheme', () => {
    expect(isUrlSafe('vctplatform://tournaments/123')).toBe(true)
  })

  it('blocks HTTP URLs', () => {
    expect(isUrlSafe('http://evil.com/phishing')).toBe(false)
  })

  it('blocks javascript URLs', () => {
    expect(isUrlSafe('javascript:alert(1)')).toBe(false)
  })

  it('blocks IP addresses', () => {
    expect(isUrlSafe('https://192.168.1.1/admin')).toBe(false)
  })

  it('blocks localhost hosts', () => {
    expect(isUrlSafe('https://localhost:3000/api')).toBe(false)
  })

  it('returns false for invalid URLs', () => {
    expect(isUrlSafe('not-a-url')).toBe(false)
  })
})
