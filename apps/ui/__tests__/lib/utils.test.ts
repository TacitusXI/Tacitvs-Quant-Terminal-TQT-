import {
  cn,
  getLampColor,
  getLampGlow,
  formatCurrency,
  formatPercentage,
  formatR,
  formatTimestamp,
  truncate,
} from '@/lib/utils'

describe('utils', () => {
  describe('cn', () => {
    it('should combine class names', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3')
    })

    it('should handle objects', () => {
      expect(cn({ 'class1': true, 'class2': false })).toBe('class1')
    })
  })

  describe('getLampColor', () => {
    it('should return emerald for EV > 0.05', () => {
      expect(getLampColor(0.1)).toBe('emerald')
      expect(getLampColor(0.06)).toBe('emerald')
    })

    it('should return amber for EV between -0.02 and 0.05', () => {
      expect(getLampColor(0.05)).toBe('amber')
      expect(getLampColor(0)).toBe('amber')
      expect(getLampColor(-0.01)).toBe('amber')
    })

    it('should return rose for EV < -0.02', () => {
      expect(getLampColor(-0.02)).toBe('rose')
      expect(getLampColor(-0.1)).toBe('rose')
    })
  })

  describe('getLampGlow', () => {
    it('should return correct glow class for positive EV', () => {
      expect(getLampGlow(0.1)).toBe('glow-emerald')
    })

    it('should return correct glow class for neutral EV', () => {
      expect(getLampGlow(0.02)).toBe('glow-amber')
    })

    it('should return correct glow class for negative EV', () => {
      expect(getLampGlow(-0.05)).toBe('glow-rose')
    })
  })

  describe('formatCurrency', () => {
    it('should format USD currency by default', () => {
      expect(formatCurrency(1000)).toBe('$1,000')
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
    })

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0')
    })

    it('should handle negative numbers', () => {
      expect(formatCurrency(-500)).toBe('-$500')
    })

    it('should format large numbers with commas', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000')
    })

    it('should handle custom currency', () => {
      expect(formatCurrency(1000, 'EUR')).toContain('1,000')
    })
  })

  describe('formatPercentage', () => {
    it('should format percentage with default 1 decimal', () => {
      expect(formatPercentage(0.123)).toBe('12.3%')
      expect(formatPercentage(0.5)).toBe('50.0%')
    })

    it('should format percentage with custom decimals', () => {
      expect(formatPercentage(0.12345, 2)).toBe('12.35%')
      expect(formatPercentage(0.12345, 0)).toBe('12%')
    })

    it('should handle zero', () => {
      expect(formatPercentage(0)).toBe('0.0%')
    })

    it('should handle negative percentages', () => {
      expect(formatPercentage(-0.25)).toBe('-25.0%')
    })
  })

  describe('formatR', () => {
    it('should format positive R with + sign', () => {
      expect(formatR(1.23)).toBe('+1.23R')
      expect(formatR(0.05)).toBe('+0.05R')
    })

    it('should format negative R without + sign', () => {
      expect(formatR(-1.23)).toBe('-1.23R')
      expect(formatR(-0.5)).toBe('-0.50R')
    })

    it('should format zero with + sign', () => {
      expect(formatR(0)).toBe('+0.00R')
    })

    it('should use custom decimal places', () => {
      expect(formatR(1.23456, 3)).toBe('+1.235R')
      expect(formatR(-1.23456, 1)).toBe('-1.2R')
    })
  })

  describe('formatTimestamp', () => {
    it('should format timestamp in 24h format with Z suffix', () => {
      // Mock date: 2024-01-01 12:30:45 UTC
      const timestamp = new Date('2024-01-01T12:30:45Z').getTime()
      const formatted = formatTimestamp(timestamp)
      
      // Should contain hours, minutes, seconds and Z
      expect(formatted).toMatch(/\d{2}:\d{2}:\d{2}Z/)
      expect(formatted).toContain('Z')
    })

    it('should use 24-hour format', () => {
      const timestamp = new Date('2024-01-01T14:30:00Z').getTime()
      const formatted = formatTimestamp(timestamp)
      
      // Should not contain AM/PM
      expect(formatted).not.toMatch(/AM|PM/)
    })
  })

  describe('truncate', () => {
    it('should truncate long text', () => {
      expect(truncate('Hello World!', 5)).toBe('Hello...')
      expect(truncate('Testing', 4)).toBe('Test...')
    })

    it('should not truncate short text', () => {
      expect(truncate('Hello', 10)).toBe('Hello')
      expect(truncate('Test', 4)).toBe('Test')
    })

    it('should handle exact length', () => {
      expect(truncate('Hello', 5)).toBe('Hello')
    })

    it('should handle empty string', () => {
      expect(truncate('', 10)).toBe('')
    })
  })
})

