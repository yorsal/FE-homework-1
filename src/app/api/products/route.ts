import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

// Mock products database
const mockProducts = [
  {
    id: '1',
    name: 'Premium Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    category: 'Electronics',
    stock: 45,
  },
  {
    id: '2',
    name: 'Smart Watch',
    description: 'Feature-rich smartwatch with health tracking',
    price: 399.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    category: 'Electronics',
    stock: 32,
  },
  {
    id: '3',
    name: 'Laptop Stand',
    description: 'Ergonomic aluminum laptop stand',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop',
    category: 'Accessories',
    stock: 120,
  },
  {
    id: '4',
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with custom switches',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop',
    category: 'Electronics',
    stock: 67,
  },
  {
    id: '5',
    name: 'Wireless Mouse',
    description: 'Precision wireless mouse for productivity',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop',
    category: 'Electronics',
    stock: 89,
  },
  {
    id: '6',
    name: 'USB-C Hub',
    description: 'Multi-port USB-C hub with HDMI and SD card reader',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500&h=500&fit=crop',
    category: 'Accessories',
    stock: 156,
  },
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'You must be logged in to view products' },
        { status: 401 }
      )
    }

    // Return mock products data
    return NextResponse.json({
      products: mockProducts,
      total: mockProducts.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Products endpoint error:', error)
    return NextResponse.json(
      { error: 'server_error', message: 'Internal server error' },
      { status: 500 }
    )
  }
}
