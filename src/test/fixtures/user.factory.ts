import type { User } from '@/types'

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: '1',
    name: 'Test Admin',
    email: 'admin@coffee.com',
    role: 'ADMIN',
    active: true,
    ...overrides,
  }
}
