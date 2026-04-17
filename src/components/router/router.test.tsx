// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';
import { useAuthStore } from '@/store/auth.store';
import type { Role } from '@/types';

function renderWithRouter(ui: React.ReactNode, initialEntries = ['/']) {
  return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);
}

const adminUser = { id: '1', name: 'Admin', email: 'admin@test.com', role: 'ADMIN' as Role, active: true };
const employeeUser = { id: '2', name: 'Emp', email: 'emp@test.com', role: 'EMPLOYEE' as Role, active: true };
const customerUser = { id: '3', name: 'Cust', email: 'cust@test.com', role: 'CUSTOMER' as Role, active: true };

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  });

  it('renders children when authenticated', () => {
    useAuthStore.setState({ user: adminUser, token: 'test-token', isAuthenticated: true });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      ['/protected']
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('does NOT render children when not authenticated', () => {
    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      ['/protected']
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    const { container } = renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      ['/protected']
    );

    expect(container.querySelector('div')).not.toBeInTheDocument();
  });
});

describe('RoleGuard', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  });

  it('renders children when user has the allowed role (ADMIN)', () => {
    useAuthStore.setState({ user: adminUser, token: 'tok', isAuthenticated: true });

    renderWithRouter(
      <RoleGuard allowedRoles={['ADMIN']}>
        <div>Admin Panel</div>
      </RoleGuard>
    );

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('renders children when user role is in a list of allowed roles', () => {
    useAuthStore.setState({ user: employeeUser, token: 'tok', isAuthenticated: true });

    renderWithRouter(
      <RoleGuard allowedRoles={['EMPLOYEE', 'ADMIN']}>
        <div>Shared Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Shared Content')).toBeInTheDocument();
  });

  it('does NOT render children when user role is not allowed', () => {
    useAuthStore.setState({ user: customerUser, token: 'tok', isAuthenticated: true });

    renderWithRouter(
      <RoleGuard allowedRoles={['ADMIN']}>
        <div>Admin Only</div>
      </RoleGuard>
    );

    expect(screen.queryByText('Admin Only')).not.toBeInTheDocument();
  });

  it('does NOT render children when user is null', () => {
    renderWithRouter(
      <RoleGuard allowedRoles={['ADMIN', 'EMPLOYEE']}>
        <div>Auth Required</div>
      </RoleGuard>
    );

    expect(screen.queryByText('Auth Required')).not.toBeInTheDocument();
  });

  it('EMPLOYEE cannot access ADMIN-only route', () => {
    useAuthStore.setState({ user: employeeUser, token: 'tok', isAuthenticated: true });

    renderWithRouter(
      <RoleGuard allowedRoles={['ADMIN']}>
        <div>Admin Only</div>
      </RoleGuard>
    );

    expect(screen.queryByText('Admin Only')).not.toBeInTheDocument();
  });

  it('CUSTOMER cannot access EMPLOYEE routes', () => {
    useAuthStore.setState({ user: customerUser, token: 'tok', isAuthenticated: true });

    renderWithRouter(
      <RoleGuard allowedRoles={['EMPLOYEE', 'ADMIN']}>
        <div>Staff Only</div>
      </RoleGuard>
    );

    expect(screen.queryByText('Staff Only')).not.toBeInTheDocument();
  });
});
