import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '@/store/useCartStore'

describe('Cart Store Logic', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart()
  })

  it('should add item to cart and calculate correct totals', () => {
    const store = useCartStore.getState()

    const added = store.addItem({
      variantId: 'var-1',
      productId: 'prod-1',
      name: 'Camiseta Albiceleste',
      price: 45000,
      size: 'M',
      image: '/img.jpg',
      stock: 10,
      sku: 'ALB-M',
      quantity: 2,
    })

    expect(added).toBe(true)
    expect(useCartStore.getState().getTotalItems()).toBe(2)
    expect(useCartStore.getState().getSubtotal()).toBe(90000)
  })

  it('should enforce stock limit when adding items', () => {
    const store = useCartStore.getState()

    const addedFirst = store.addItem({
      variantId: 'var-2',
      productId: 'prod-2',
      name: 'Camiseta Retrópolis',
      price: 50000,
      size: 'L',
      image: '/img.jpg',
      stock: 3,
      sku: 'RET-L',
      quantity: 2,
    })

    expect(addedFirst).toBe(true)

    // Try to add 2 more (exceeding total stock of 3)
    const addedSecond = store.addItem({
      variantId: 'var-2',
      productId: 'prod-2',
      name: 'Camiseta Retrópolis',
      price: 50000,
      size: 'L',
      image: '/img.jpg',
      stock: 3,
      sku: 'RET-L',
      quantity: 2,
    })

    expect(addedSecond).toBe(false)
    expect(useCartStore.getState().getTotalItems()).toBe(2)
  })

  it('should update item quantity and remove item', () => {
    const store = useCartStore.getState()

    store.addItem({
      variantId: 'var-3',
      productId: 'prod-3',
      name: 'Camiseta Arquero',
      price: 40000,
      size: 'S',
      image: '/img.jpg',
      stock: 5,
      sku: 'ARQ-S',
      quantity: 1,
    })

    store.updateQuantity('var-3', 3)
    expect(useCartStore.getState().getTotalItems()).toBe(3)
    expect(useCartStore.getState().getSubtotal()).toBe(120000)

    store.removeItem('var-3')
    expect(useCartStore.getState().getTotalItems()).toBe(0)
    expect(useCartStore.getState().getSubtotal()).toBe(0)
  })
})
