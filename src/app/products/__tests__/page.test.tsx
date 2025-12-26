import '@testing-library/jest-dom'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import ProductsPage from '../page'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useProductsStore } from '../../store/useProductsStore'

// Mock modules
jest.mock('next-auth/react')
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))
jest.mock('../../store/useProductsStore')

describe('ProductsPage', () => {
  const mockPush = jest.fn()
  const mockUseSession = useSession as jest.Mock
  const mockSignOut = signOut as jest.Mock
  const mockSetProducts = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    ;(useProductsStore as unknown as jest.Mock).mockReturnValue({
      products: [],
      setProducts: mockSetProducts,
    })
    global.fetch = jest.fn()
  })

  it('redirects to home if unauthenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })

    render(<ProductsPage />)

    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('renders loading state initially', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
    })

    render(<ProductsPage />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('fetches and displays products successfully', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Test Product',
        description: 'Desc',
        price: 100,
        image: 'img.jpg',
        category: 'Cat',
        stock: 5,
      },
    ]

    mockUseSession.mockReturnValue({
      data: { user: { name: 'Test User' }, accessToken: 'token' },
      status: 'authenticated',
    })

    // Mock store returning products after update
    ;(useProductsStore as unknown as jest.Mock).mockReturnValue({
      products: mockProducts,
      setProducts: mockSetProducts,
    })
    ;(global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/products') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ products: mockProducts }),
        })
      }
      return Promise.resolve({ ok: false })
    })

    render(<ProductsPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/products')
    expect(mockSetProducts).toHaveBeenCalledWith(mockProducts)
  })

  it('displays error message on fetch failure', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: 'Test User' }, accessToken: 'token' },
      status: 'authenticated',
    })
    ;(global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/products') {
        return Promise.resolve({
          ok: false,
        })
      }
      return Promise.resolve({ ok: true })
    })

    render(<ProductsPage />)

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch products')).toBeInTheDocument()
    })
  })

  it('displays empty state when no products found', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: 'Test User' }, accessToken: 'token' },
      status: 'authenticated',
    })
    ;(useProductsStore as unknown as jest.Mock).mockReturnValue({
      products: [],
      setProducts: mockSetProducts,
    })
    ;(global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/products') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ products: [] }),
        })
      }
      return Promise.resolve({ ok: false })
    })

    render(<ProductsPage />)

    await waitFor(() => {
      expect(screen.getByText('No products available')).toBeInTheDocument()
    })
  })

  it('calls signOut when sign out button is clicked', () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: 'Test User' }, accessToken: 'token' },
      status: 'authenticated',
    })

    render(<ProductsPage />)

    // We need to wait for the page to render content (not loading) or force it

    const signOutButton = screen.getByText('Sign Out')
    fireEvent.click(signOutButton)

    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/' })
  })
})
