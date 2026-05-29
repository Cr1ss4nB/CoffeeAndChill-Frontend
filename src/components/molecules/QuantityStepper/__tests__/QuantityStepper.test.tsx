import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuantityStepper } from '@/components/molecules/QuantityStepper/QuantityStepper'

describe('QuantityStepper', () => {
  describe('rendering', () => {
    it('displays the current value', () => {
      render(<QuantityStepper value={3} onChange={vi.fn()} />)
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('renders increment and decrement buttons', () => {
      render(<QuantityStepper value={2} onChange={vi.fn()} />)
      expect(screen.getByLabelText('Sumar')).toBeInTheDocument()
      expect(screen.getByLabelText('Restar')).toBeInTheDocument()
    })
  })

  describe('increment', () => {
    it('calls onChange with value + 1', () => {
      const onChange = vi.fn()
      render(<QuantityStepper value={2} onChange={onChange} />)
      fireEvent.click(screen.getByLabelText('Sumar'))
      expect(onChange).toHaveBeenCalledWith(3)
    })

    it('button is disabled at max — click does not fire onChange', () => {
      const onChange = vi.fn()
      render(<QuantityStepper value={99} onChange={onChange} max={99} />)
      // Button is disabled, click is ignored
      fireEvent.click(screen.getByLabelText('Sumar'))
      expect(onChange).not.toHaveBeenCalled()
    })

    it('+ button disabled when value = max', () => {
      render(<QuantityStepper value={10} onChange={vi.fn()} max={10} />)
      expect(screen.getByLabelText('Sumar')).toBeDisabled()
    })

    it('+ button enabled when value < max', () => {
      render(<QuantityStepper value={5} onChange={vi.fn()} max={10} />)
      expect(screen.getByLabelText('Sumar')).not.toBeDisabled()
    })
  })

  describe('decrement', () => {
    it('calls onChange with value - 1', () => {
      const onChange = vi.fn()
      render(<QuantityStepper value={3} onChange={onChange} />)
      fireEvent.click(screen.getByLabelText('Restar'))
      expect(onChange).toHaveBeenCalledWith(2)
    })

    it('button is disabled at min — click does not fire onChange', () => {
      const onChange = vi.fn()
      render(<QuantityStepper value={1} onChange={onChange} min={1} />)
      // Button is disabled, click is ignored
      fireEvent.click(screen.getByLabelText('Restar'))
      expect(onChange).not.toHaveBeenCalled()
    })

    it('- button disabled when value = min', () => {
      render(<QuantityStepper value={1} onChange={vi.fn()} min={1} />)
      expect(screen.getByLabelText('Restar')).toBeDisabled()
    })

    it('- button enabled when value > min', () => {
      render(<QuantityStepper value={2} onChange={vi.fn()} min={1} />)
      expect(screen.getByLabelText('Restar')).not.toBeDisabled()
    })
  })

  describe('defaults', () => {
    it('default min is 1', () => {
      render(<QuantityStepper value={1} onChange={vi.fn()} />)
      expect(screen.getByLabelText('Restar')).toBeDisabled()
    })

    it('default max is 99', () => {
      render(<QuantityStepper value={99} onChange={vi.fn()} />)
      expect(screen.getByLabelText('Sumar')).toBeDisabled()
    })
  })

  describe('custom min/max', () => {
    it('respects custom min = 0', () => {
      const onChange = vi.fn()
      render(<QuantityStepper value={0} onChange={onChange} min={0} />)
      expect(screen.getByLabelText('Restar')).toBeDisabled()
      fireEvent.click(screen.getByLabelText('Sumar'))
      expect(onChange).toHaveBeenCalledWith(1)
    })

    it('respects custom max = 5', () => {
      render(<QuantityStepper value={5} onChange={vi.fn()} max={5} />)
      expect(screen.getByLabelText('Sumar')).toBeDisabled()
    })
  })
})
