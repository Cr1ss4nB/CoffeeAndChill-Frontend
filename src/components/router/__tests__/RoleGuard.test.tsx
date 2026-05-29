import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils/render'
import { RoleGuard } from '@/components/router/RoleGuard'
import type { User } from '@/types'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    Navigate: vi.fn(({ to }: { to: string }) => (
      <div data-testid={`navigate:${to}`} />
    )),
  }
})

const userStub = vi.hoisted(() => ({ value: null as User | null }))

vi.mock('@/store/auth.store', () => ({
  useAuthStore: vi.fn((selector: (s: { user: User | null }) => unknown) =>
    selector({ user: userStub.value })
  ),
}))

describe('RoleGuard', () => {
  describe('allowed role', () => {
    it('renders children for ADMIN', () => {
      userStub.value = { id: '1', name: 'Admin', email: 'a@b.com', role: 'ADMIN', active: true }
      renderWithProviders(
        <RoleGuard allowedRoles={['ADMIN']}>
          <div>Admin Panel</div>
        </RoleGuard>
      )
      expect(screen.getByText('Admin Panel')).toBeInTheDocument()
    })

    it('renders children for EMPLOYEE when both allowed', () => {
      userStub.value = { id: '2', name: 'Emp', email: 'e@b.com', role: 'EMPLOYEE', active: true }
      renderWithProviders(
        <RoleGuard allowedRoles={['ADMIN', 'EMPLOYEE']}>
          <div>Staff Content</div>
        </RoleGuard>
      )
      expect(screen.getByText('Staff Content')).toBeInTheDocument()
    })

    it('does NOT render Navigate when role is allowed', () => {
      userStub.value = { id: '1', name: 'Admin', email: 'a@b.com', role: 'ADMIN', active: true }
      renderWithProviders(
        <RoleGuard allowedRoles={['ADMIN']}>
          <div>Content</div>
        </RoleGuard>
      )
      expect(screen.queryByTestId('navigate:/menu')).not.toBeInTheDocument()
    })
  })

  describe('disallowed role', () => {
    it('does NOT render children for CUSTOMER on admin guard', () => {
      userStub.value = { id: '3', name: 'Cust', email: 'c@b.com', role: 'CUSTOMER', active: true }
      renderWithProviders(
        <RoleGuard allowedRoles={['ADMIN']}>
          <div>Admin Only</div>
        </RoleGuard>
      )
      expect(screen.queryByText('Admin Only')).not.toBeInTheDocument()
    })

    it('renders Navigate to /menu for CUSTOMER', () => {
      userStub.value = { id: '3', name: 'Cust', email: 'c@b.com', role: 'CUSTOMER', active: true }
      renderWithProviders(
        <RoleGuard allowedRoles={['ADMIN']}>
          <div>Admin Only</div>
        </RoleGuard>
      )
      expect(screen.getByTestId('navigate:/menu')).toBeInTheDocument()
    })

    it('EMPLOYEE cannot access ADMIN-only guard', () => {
      userStub.value = { id: '2', name: 'Emp', email: 'e@b.com', role: 'EMPLOYEE', active: true }
      renderWithProviders(
        <RoleGuard allowedRoles={['ADMIN']}>
          <div>Admin Only</div>
        </RoleGuard>
      )
      expect(screen.queryByText('Admin Only')).not.toBeInTheDocument()
      expect(screen.getByTestId('navigate:/menu')).toBeInTheDocument()
    })
  })

  describe('null user', () => {
    it('does NOT render children', () => {
      userStub.value = null
      renderWithProviders(
        <RoleGuard allowedRoles={['ADMIN', 'EMPLOYEE']}>
          <div>Staff Only</div>
        </RoleGuard>
      )
      expect(screen.queryByText('Staff Only')).not.toBeInTheDocument()
    })

    it('renders Navigate to /menu', () => {
      userStub.value = null
      renderWithProviders(
        <RoleGuard allowedRoles={['ADMIN']}>
          <div>Admin</div>
        </RoleGuard>
      )
      expect(screen.getByTestId('navigate:/menu')).toBeInTheDocument()
    })
  })
})
