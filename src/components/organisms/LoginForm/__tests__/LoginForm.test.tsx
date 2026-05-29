import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/utils/render'
import { LoginForm } from '@/components/organisms/LoginForm/LoginForm'

// Mock toast to avoid rendering the Toaster
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

// Mock logo asset
vi.mock('@/assets/foreground-1773528399195.png', () => ({ default: 'logo.png' }))

// Mock auth store — login must be spyable
const loginSpy = vi.hoisted(() => vi.fn())
vi.mock('@/store/auth.store', () => ({
  useAuthStore: vi.fn((selector: (s: { login: typeof loginSpy }) => unknown) =>
    selector({ login: loginSpy })
  ),
}))

beforeEach(() => {
  loginSpy.mockClear()
})

async function fillAndSubmit(email = 'admin@coffee.com', password = 'pass123') {
  await userEvent.type(screen.getByLabelText(/email/i), email)
  await userEvent.type(screen.getByLabelText(/contraseña/i), password)
  await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
}

describe('LoginForm', () => {
  describe('rendering', () => {
    it('renders email and password fields', () => {
      renderWithProviders(<LoginForm />)
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    })

    it('renders submit button', () => {
      renderWithProviders(<LoginForm />)
      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
    })

    it('renders link to /register', () => {
      renderWithProviders(<LoginForm />)
      expect(screen.getByRole('link', { name: /regístrate/i })).toBeInTheDocument()
    })

    it('renders "ver nuestra carta" link', () => {
      renderWithProviders(<LoginForm />)
      expect(screen.getByRole('button', { name: /ver nuestra carta/i })).toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    it('calls login() with email and password', async () => {
      loginSpy.mockResolvedValue(undefined)
      // Mock getState for post-login navigation
      const { useAuthStore } = await import('@/store/auth.store')
      ;(useAuthStore as unknown as { getState: () => { user: null } }).getState = () => ({ user: null })

      renderWithProviders(<LoginForm />)
      await fillAndSubmit('admin@coffee.com', 'mypassword')
      await waitFor(() => expect(loginSpy).toHaveBeenCalledOnce())
      expect(loginSpy).toHaveBeenCalledWith({
        email: 'admin@coffee.com',
        password: 'mypassword',
      })
    })

    it('submit button shows loading state during submission', async () => {
      // Never resolves — keeps loading
      loginSpy.mockReturnValue(new Promise(() => {}))
      renderWithProviders(<LoginForm />)
      await userEvent.type(screen.getByLabelText(/email/i), 'a@b.com')
      await userEvent.type(screen.getByLabelText(/contraseña/i), 'pass')
      await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
      // Button should be disabled while loading
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeDisabled()
      )
    })
  })

  describe('error handling', () => {
    it('does not show error before submission', () => {
      renderWithProviders(<LoginForm />)
      expect(screen.queryByText(/credenciales/i)).not.toBeInTheDocument()
    })

    it('calls toast.error on login failure', async () => {
      const toast = await import('react-hot-toast')
      const toastError = vi.spyOn(toast.default, 'error')
      loginSpy.mockRejectedValue({
        response: { data: { detail: 'Credenciales incorrectas' } },
      })
      renderWithProviders(<LoginForm />)
      await fillAndSubmit('bad@bad.com', 'wrong')
      await waitFor(() => expect(toastError).toHaveBeenCalled())
    })
  })

  describe('HTML form', () => {
    it('email field has type="email"', () => {
      renderWithProviders(<LoginForm />)
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email')
    })

    it('password field has type="password"', () => {
      renderWithProviders(<LoginForm />)
      const pwInput = document.querySelector('input[type="password"]')
      expect(pwInput).not.toBeNull()
    })
  })
})
