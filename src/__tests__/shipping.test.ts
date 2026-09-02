import { describe, it, expect } from 'vitest'
import { getShippingQuotes } from '@/lib/shipping'

describe('Shipping Quote Service', () => {
  it('should return quotes for Andreani and Correo Argentino in AMBA (C1043)', async () => {
    const quotes = await getShippingQuotes('C1043')

    expect(quotes.length).toBe(2)
    
    const andreani = quotes.find((q) => q.courierId === 'ANDREANI')
    const correo = quotes.find((q) => q.courierId === 'CORREO_ARGENTINO')

    expect(andreani).toBeDefined()
    expect(correo).toBeDefined()
    expect(andreani?.price).toBe(3500)
    expect(correo?.price).toBe(2900)
  })

  it('should calculate national rates for interior postal codes (X5000)', async () => {
    const quotes = await getShippingQuotes('X5000')

    const andreani = quotes.find((q) => q.courierId === 'ANDREANI')
    const correo = quotes.find((q) => q.courierId === 'CORREO_ARGENTINO')

    expect(andreani?.price).toBe(4900)
    expect(correo?.price).toBe(4200)
  })
})
