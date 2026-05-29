import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '@/hooks/useIsMobile'

type ChangeHandler = () => void

function stubMatchMedia(matches: boolean) {
  const listeners: ChangeHandler[] = []
  const mql = {
    matches,
    media: '(max-width: 767px)',
    addEventListener: vi.fn((event: string, handler: ChangeHandler) => {
      if (event === 'change') listeners.push(handler)
    }),
    removeEventListener: vi.fn((event: string, handler: ChangeHandler) => {
      const idx = listeners.indexOf(handler)
      if (idx > -1) listeners.splice(idx, 1)
    }),
    dispatchEvent: vi.fn(),
    _triggerChange: (newMatches: boolean) => {
      ;(mql as unknown as { matches: boolean }).matches = newMatches
      listeners.forEach((h) => h())
    },
  }
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn(() => mql),
  })
  return mql
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useIsMobile()', () => {
  describe('initial value', () => {
    it('returns true when viewport is mobile (< 768px)', () => {
      stubMatchMedia(true)
      const { result } = renderHook(() => useIsMobile())
      expect(result.current).toBe(true)
    })

    it('returns false when viewport is desktop (>= 768px)', () => {
      stubMatchMedia(false)
      const { result } = renderHook(() => useIsMobile())
      expect(result.current).toBe(false)
    })
  })

  describe('resize handling', () => {
    it('updates to true when viewport becomes mobile', () => {
      const mql = stubMatchMedia(false)
      const { result } = renderHook(() => useIsMobile())
      expect(result.current).toBe(false)

      act(() => mql._triggerChange(true))
      expect(result.current).toBe(true)
    })

    it('updates to false when viewport becomes desktop', () => {
      const mql = stubMatchMedia(true)
      const { result } = renderHook(() => useIsMobile())
      expect(result.current).toBe(true)

      act(() => mql._triggerChange(false))
      expect(result.current).toBe(false)
    })
  })

  describe('event listener lifecycle', () => {
    it('adds event listener on mount', () => {
      const mql = stubMatchMedia(false)
      renderHook(() => useIsMobile())
      expect(mql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('removes event listener on unmount', () => {
      const mql = stubMatchMedia(false)
      const { unmount } = renderHook(() => useIsMobile())
      unmount()
      expect(mql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('same handler added and removed', () => {
      const mql = stubMatchMedia(false)
      const { unmount } = renderHook(() => useIsMobile())

      const addedHandler = (mql.addEventListener as ReturnType<typeof vi.fn>).mock.calls[0][1]
      unmount()
      const removedHandler = (mql.removeEventListener as ReturnType<typeof vi.fn>).mock.calls[0][1]

      expect(addedHandler).toBe(removedHandler)
    })
  })

  describe('matchMedia query string', () => {
    it('uses (max-width: 767px) media query', () => {
      stubMatchMedia(false)
      renderHook(() => useIsMobile())
      expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)')
    })
  })
})
