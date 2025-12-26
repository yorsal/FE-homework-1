import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import Home from '../page'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// Mock the modules
jest.mock('next-auth/react')
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('Home Page', () => {
  const mockPush = jest.fn()
  const mockUseSession = useSession as jest.Mock
  const mockSignIn = signIn as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })

  it('renders loading state when status is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
    })

    render(<Home />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders login button when unauthenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })

    render(<Home />)

    expect(screen.getByText('Login with OAuth2')).toBeInTheDocument()
  })

  it('calls signIn when login button is clicked', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })

    render(<Home />)

    const loginButton = screen.getByText('Login with OAuth2')
    fireEvent.click(loginButton)

    expect(mockSignIn).toHaveBeenCalledWith('mock-oauth2')
  })

  it('redirects to /products when authenticated', () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: 'Test User' } },
      status: 'authenticated',
    })

    render(<Home />)

    expect(mockPush).toHaveBeenCalledWith('/products')
  })
})
