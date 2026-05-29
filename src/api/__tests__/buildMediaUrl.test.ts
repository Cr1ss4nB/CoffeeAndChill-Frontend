import { describe, it, expect } from 'vitest'
import { buildMediaUrl, API_BASE_URL as API_BASE } from '@/api/api.client'

describe('buildMediaUrl()', () => {
  it('null input → null', () => {
    expect(buildMediaUrl(null)).toBeNull()
  })

  it('undefined input → null', () => {
    expect(buildMediaUrl(undefined)).toBeNull()
  })

  it('empty string → null', () => {
    expect(buildMediaUrl('')).toBeNull()
  })

  it('root-relative path → prepends API base', () => {
    expect(buildMediaUrl('/media/images/foo.jpg')).toBe(`${API_BASE}/media/images/foo.jpg`)
  })

  it('path without leading slash → adds slash and prepends base', () => {
    expect(buildMediaUrl('media/images/foo.jpg')).toBe(`${API_BASE}/media/images/foo.jpg`)
  })

  it('absolute http URL → returned as-is', () => {
    const url = 'http://cdn.example.com/img/foo.png'
    expect(buildMediaUrl(url)).toBe(url)
  })

  it('absolute https URL → returned as-is', () => {
    const url = 'https://cdn.example.com/img/bar.png'
    expect(buildMediaUrl(url)).toBe(url)
  })

  it('path with spaces → preserved', () => {
    expect(buildMediaUrl('/media/my image.png')).toBe(`${API_BASE}/media/my image.png`)
  })

  it('nested path → full URL', () => {
    expect(buildMediaUrl('/media/images/products/latte.jpg')).toBe(
      `${API_BASE}/media/images/products/latte.jpg`
    )
  })
})
