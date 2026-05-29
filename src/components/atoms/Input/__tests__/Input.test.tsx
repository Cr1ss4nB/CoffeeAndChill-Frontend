import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/atoms/Input/Input'

describe('Input', () => {
  describe('rendering', () => {
    it('renders an input element', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders with placeholder', () => {
      render(<Input placeholder="correo@ejemplo.com" />)
      expect(screen.getByPlaceholderText('correo@ejemplo.com')).toBeInTheDocument()
    })

    it('renders with value', () => {
      render(<Input value="test@test.com" onChange={() => {}} />)
      expect(screen.getByDisplayValue('test@test.com')).toBeInTheDocument()
    })

    it('forwards ref', () => {
      const ref = { current: null }
      render(<Input ref={ref} />)
      expect(ref.current).not.toBeNull()
    })
  })

  describe('interaction', () => {
    it('calls onChange with input value', async () => {
      const onChange = vi.fn()
      render(<Input onChange={onChange} />)
      await userEvent.type(screen.getByRole('textbox'), 'hello')
      expect(onChange).toHaveBeenCalled()
    })

    it('reflects typed value in controlled input', async () => {
      render(<Input defaultValue="" />)
      const input = screen.getByRole('textbox')
      await userEvent.type(input, 'café')
      expect(input).toHaveValue('café')
    })
  })

  describe('disabled state', () => {
    it('is not editable when disabled', async () => {
      const onChange = vi.fn()
      render(<Input disabled onChange={onChange} />)
      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })
  })

  describe('password type', () => {
    it('type="password" hides value', () => {
      render(<Input type="password" />)
      // No role="textbox" for password inputs — use querySelector
      const input = document.querySelector('input[type="password"]')
      expect(input).not.toBeNull()
    })
  })

  describe('error state', () => {
    it('renders without error by default', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input.className).not.toContain('border-red')
    })

    it('applies error styles when error=true', () => {
      render(<Input error />)
      const input = screen.getByRole('textbox')
      expect(input.className).toContain('border-red')
    })
  })

  describe('HTML attributes', () => {
    it('passes name attribute through', () => {
      render(<Input name="email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('name', 'email')
    })

    it('passes autoComplete through', () => {
      render(<Input autoComplete="email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('autocomplete', 'email')
    })

    it('applies custom className', () => {
      render(<Input className="!pl-10" />)
      expect(screen.getByRole('textbox').className).toContain('pl-10')
    })
  })
})
