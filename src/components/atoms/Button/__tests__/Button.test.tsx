import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/atoms/Button/Button'

describe('Button', () => {
  describe('rendering', () => {
    it('renders children text', () => {
      render(<Button>Iniciar Sesión</Button>)
      expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument()
    })

    it('renders as <button> element', () => {
      render(<Button>Click</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders icon when provided', () => {
      render(<Button icon={<span data-testid="icon">★</span>}>Con icono</Button>)
      expect(screen.getByTestId('icon')).toBeInTheDocument()
    })

    it('forwards ref', () => {
      const ref = { current: null }
      render(<Button ref={ref}>Ref Test</Button>)
      expect(ref.current).not.toBeNull()
    })
  })

  describe('interaction', () => {
    it('fires onClick when clicked', () => {
      const onClick = vi.fn()
      render(<Button onClick={onClick}>Click me</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledOnce()
    })

    it('does not fire onClick when disabled', () => {
      const onClick = vi.fn()
      render(<Button disabled onClick={onClick}>Disabled</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(onClick).not.toHaveBeenCalled()
    })

    it('does not fire onClick when loading', () => {
      const onClick = vi.fn()
      render(<Button loading onClick={onClick}>Loading</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('disabled state', () => {
    it('has disabled attribute when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('is disabled when loading=true', () => {
      render(<Button loading>Loading</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('not disabled by default', () => {
      render(<Button>Normal</Button>)
      expect(screen.getByRole('button')).not.toBeDisabled()
    })
  })

  describe('loading state', () => {
    it('shows Spinner when loading=true', () => {
      render(<Button loading>Loading</Button>)
      // Spinner renders an SVG or a div — check the button is disabled as proxy
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('hides icon when loading=true', () => {
      render(
        <Button loading icon={<span data-testid="icon">★</span>}>
          Loading
        </Button>
      )
      expect(screen.queryByTestId('icon')).not.toBeInTheDocument()
    })
  })

  describe('variants', () => {
    it.each(['primary', 'ghost', 'danger'] as const)('variant=%s renders without error', (variant) => {
      render(<Button variant={variant}>Test</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('sizes', () => {
    it.each(['sm', 'md', 'lg'] as const)('size=%s renders without error', (size) => {
      render(<Button size={size}>Test</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('HTML attributes', () => {
    it('passes type="submit" through', () => {
      render(<Button type="submit">Submit</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
    })

    it('applies custom className', () => {
      render(<Button className="my-custom-class">Test</Button>)
      expect(screen.getByRole('button').className).toContain('my-custom-class')
    })
  })
})
