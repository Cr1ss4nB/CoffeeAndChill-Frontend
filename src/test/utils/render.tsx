import { type ReactNode } from 'react'
import { render as rtlRender, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  })
}

export function renderWithProviders(
  ui: ReactNode,
  { initialRoute = '/', ...options }: CustomRenderOptions = {}
) {
  const queryClient = createTestQueryClient()

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialRoute]}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }

  return { queryClient, ...rtlRender(ui, { wrapper: Wrapper, ...options }) }
}

// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react'
