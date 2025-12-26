import { create } from 'zustand'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
}

interface ProductsState {
  products: Product[]
  setProducts: (products: Product[]) => void
}

export const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  setProducts: (products: Product[]) => set({ products }),
}))
