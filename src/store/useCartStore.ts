import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  variantId: string
  productId: string
  name: string
  price: number
  size: string
  image: string
  quantity: number
  stock: number
  sku: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => boolean
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getSubtotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const qtyToAdd = newItem.quantity || 1
        const currentItems = get().items
        const existingIndex = currentItems.findIndex((i) => i.variantId === newItem.variantId)

        if (existingIndex > -1) {
          const existingItem = currentItems[existingIndex]
          const newQty = existingItem.quantity + qtyToAdd
          if (newQty > newItem.stock) {
            return false // Stock limit exceeded
          }
          const updatedItems = [...currentItems]
          updatedItems[existingIndex] = { ...existingItem, quantity: newQty }
          set({ items: updatedItems })
          return true
        } else {
          if (qtyToAdd > newItem.stock) return false
          set({ items: [...currentItems, { ...newItem, quantity: qtyToAdd }] })
          return true
        }
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) })
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId)
          return
        }
        set({
          items: get().items.map((i) => {
            if (i.variantId === variantId) {
              const validQty = Math.min(quantity, i.stock)
              return { ...i, quantity: validQty }
            }
            return i
          }),
        })
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),

      getSubtotal: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    {
      name: 'doce-cart-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
    }
  )
)
