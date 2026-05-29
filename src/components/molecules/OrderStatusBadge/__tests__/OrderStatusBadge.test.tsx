import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OrderStatusBadge } from '@/components/molecules/OrderStatusBadge/OrderStatusBadge'

describe('OrderStatusBadge', () => {
  describe('known statuses', () => {
    it('PENDING → "En espera"', () => {
      render(<OrderStatusBadge status="PENDING" />)
      expect(screen.getByText('En espera')).toBeInTheDocument()
    })

    it('PREPARING → "Preparando"', () => {
      render(<OrderStatusBadge status="PREPARING" />)
      expect(screen.getByText('Preparando')).toBeInTheDocument()
    })

    it('READY → "Listo"', () => {
      render(<OrderStatusBadge status="READY" />)
      expect(screen.getByText('Listo')).toBeInTheDocument()
    })

    it('DELIVERED → "Entregado"', () => {
      render(<OrderStatusBadge status="DELIVERED" />)
      expect(screen.getByText('Entregado')).toBeInTheDocument()
    })

    it('CANCELLED → "Cancelado"', () => {
      render(<OrderStatusBadge status="CANCELLED" />)
      expect(screen.getByText('Cancelado')).toBeInTheDocument()
    })
  })

  describe('CSS classes per status', () => {
    it('PENDING → purple color classes', () => {
      render(<OrderStatusBadge status="PENDING" />)
      expect(screen.getByText('En espera').className).toContain('purple')
    })

    it('PREPARING → orange color classes', () => {
      render(<OrderStatusBadge status="PREPARING" />)
      expect(screen.getByText('Preparando').className).toContain('orange')
    })

    it('READY → green color classes', () => {
      render(<OrderStatusBadge status="READY" />)
      expect(screen.getByText('Listo').className).toContain('green')
    })

    it('CANCELLED → red color classes', () => {
      render(<OrderStatusBadge status="CANCELLED" />)
      expect(screen.getByText('Cancelado').className).toContain('red')
    })
  })

  describe('unknown status', () => {
    it('displays raw status string as fallback', () => {
      render(<OrderStatusBadge status="WEIRD_STATUS" />)
      expect(screen.getByText('WEIRD_STATUS')).toBeInTheDocument()
    })

    it('applies gray fallback classes', () => {
      render(<OrderStatusBadge status="UNKNOWN" />)
      expect(screen.getByText('UNKNOWN').className).toContain('gray')
    })
  })

  describe('structure', () => {
    it('renders as a <span>', () => {
      render(<OrderStatusBadge status="PENDING" />)
      expect(screen.getByText('En espera').tagName.toLowerCase()).toBe('span')
    })
  })
})
