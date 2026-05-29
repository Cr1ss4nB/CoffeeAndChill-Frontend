import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from '@/components/atoms/Modal/Modal'

describe('Modal', () => {
  describe('visibility', () => {
    it('does not render when isOpen=false', () => {
      render(
        <Modal isOpen={false} onClose={vi.fn()}>
          <div>Hidden Content</div>
        </Modal>
      )
      expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument()
    })

    it('renders children when isOpen=true', () => {
      render(
        <Modal isOpen onClose={vi.fn()}>
          <div>Visible Content</div>
        </Modal>
      )
      expect(screen.getByText('Visible Content')).toBeInTheDocument()
    })

    it('renders with title', () => {
      render(
        <Modal isOpen onClose={vi.fn()} title="Editar Producto">
          <div>Body</div>
        </Modal>
      )
      expect(screen.getByText('Editar Producto')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has role="dialog"', () => {
      render(
        <Modal isOpen onClose={vi.fn()}>
          <div>Content</div>
        </Modal>
      )
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('has aria-modal="true"', () => {
      render(
        <Modal isOpen onClose={vi.fn()}>
          <div>Content</div>
        </Modal>
      )
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    })

    it('close button has aria-label="Cerrar"', () => {
      render(
        <Modal isOpen onClose={vi.fn()} title="Test">
          <div>Content</div>
        </Modal>
      )
      expect(screen.getByLabelText('Cerrar')).toBeInTheDocument()
    })
  })

  describe('close behavior', () => {
    it('calls onClose when clicking the overlay', () => {
      const onClose = vi.fn()
      render(
        <Modal isOpen onClose={onClose}>
          <div>Content</div>
        </Modal>
      )
      // The overlay has aria-hidden="true", query by aria-hidden
      const overlay = document.querySelector('[aria-hidden="true"]')
      expect(overlay).not.toBeNull()
      fireEvent.click(overlay!)
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('calls onClose when clicking the X button (title modal)', () => {
      const onClose = vi.fn()
      render(
        <Modal isOpen onClose={onClose} title="My Modal">
          <div>Content</div>
        </Modal>
      )
      fireEvent.click(screen.getByLabelText('Cerrar'))
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('calls onClose when Escape key is pressed', () => {
      const onClose = vi.fn()
      render(
        <Modal isOpen onClose={onClose}>
          <div>Content</div>
        </Modal>
      )
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('does not call onClose on other key presses', () => {
      const onClose = vi.fn()
      render(
        <Modal isOpen onClose={onClose}>
          <div>Content</div>
        </Modal>
      )
      fireEvent.keyDown(document, { key: 'Enter' })
      fireEvent.keyDown(document, { key: 'Tab' })
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('body scroll lock', () => {
    it('sets overflow hidden when open', () => {
      render(
        <Modal isOpen onClose={vi.fn()}>
          <div>Content</div>
        </Modal>
      )
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('restores overflow when closed', () => {
      const { rerender } = render(
        <Modal isOpen onClose={vi.fn()}>
          <div>Content</div>
        </Modal>
      )
      expect(document.body.style.overflow).toBe('hidden')
      rerender(
        <Modal isOpen={false} onClose={vi.fn()}>
          <div>Content</div>
        </Modal>
      )
      expect(document.body.style.overflow).toBe('')
    })
  })

  describe('sizes', () => {
    it.each(['sm', 'md', 'lg'] as const)('size=%s renders without error', (size) => {
      render(
        <Modal isOpen onClose={vi.fn()} size={size}>
          <div>Content</div>
        </Modal>
      )
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })
})
