import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils/render'
import { ProtectedRoute } from '@/components/router/ProtectedRoute'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    Navigate: vi.fn(({ to, state }: { to: string; state?: unknown }) => (
      <div data-testid={`navigate:${to}`} data-state={JSON.stringify(state)} />
    )),
  }
})

const isAuthStub = vi.hoisted(() => ({ value: false }))

vi.mock('@/store/auth.store', () => ({
  useAuthStore: vi.fn((selector: (s: { isAuthenticated: boolean }) => unknown) =>
    selector({ isAuthenticated: isAuthStub.value })
  ),
}))

describe('ProtectedRoute', () => {
  describe('authenticated user', () => {
    it('renders children', () => {
      isAuthStub.value = true
      renderWithProviders(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      )
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('renders multiple children', () => {
      isAuthStub.value = true
      renderWithProviders(
        <ProtectedRoute>
          <span>Child A</span>
          <span>Child B</span>
        </ProtectedRoute>
      )
      expect(screen.getByText('Child A')).toBeInTheDocument()
      expect(screen.getByText('Child B')).toBeInTheDocument()
    })

    it('does NOT render a Navigate', () => {
      isAuthStub.value = true
      renderWithProviders(
        <ProtectedRoute>
          <div>Content</div>
        </ProtectedRoute>
      )
      expect(screen.queryByTestId('navigate:/login')).not.toBeInTheDocument()
    })
  })

  describe('unauthenticated user', () => {
    it('does NOT render children', () => {
      isAuthStub.value = false
      renderWithProviders(
        <ProtectedRoute>
          <div data-testid="secret">Secret</div>
        </ProtectedRoute>
      )
      expect(screen.queryByTestId('secret')).not.toBeInTheDocument()
    })

    it('renders Navigate to /login', () => {
      isAuthStub.value = false
      renderWithProviders(
        <ProtectedRoute>
          <div>Secret</div>
        </ProtectedRoute>
      )
      expect(screen.getByTestId('navigate:/login')).toBeInTheDocument()
    })

    it('Navigate carries returnTo in state', () => {
      isAuthStub.value = false
      renderWithProviders(
        <ProtectedRoute>
          <div>Secret</div>
        </ProtectedRoute>,
        { initialRoute: '/dashboard' }
      )
      const nav = screen.getByTestId('navigate:/login')
      const state = JSON.parse(nav.getAttribute('data-state') ?? '{}')
      expect(state.returnTo).toBe('/dashboard')
    })
  })
})
