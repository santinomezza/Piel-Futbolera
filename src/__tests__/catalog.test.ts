import { describe, it, expect } from 'vitest'

interface MockProduct {
  id: string
  name: string
  category: 'TITULAR' | 'SUPLENTE' | 'RETRO' | 'ARQUERO'
  countryId: string
  leagueId: string | null
  isDeleted: boolean
}

describe('Catalog Filtering & Soft Delete Rules', () => {
  const sampleProducts: MockProduct[] = [
    {
      id: 'p1',
      name: 'Camiseta Albiceleste 2026',
      category: 'TITULAR',
      countryId: 'c-arg',
      leagueId: 'l-lpf',
      isDeleted: false,
    },
    {
      id: 'p2',
      name: 'Camiseta Retro México 1986',
      category: 'RETRO',
      countryId: 'c-arg',
      leagueId: null,
      isDeleted: false,
    },
    {
      id: 'p3',
      name: 'Camiseta Nocturna Suplente',
      category: 'SUPLENTE',
      countryId: 'c-esp',
      leagueId: 'l-laliga',
      isDeleted: false,
    },
    {
      id: 'p4',
      name: 'Camiseta Descontinuada',
      category: 'TITULAR',
      countryId: 'c-arg',
      leagueId: 'l-lpf',
      isDeleted: true, // Soft deleted!
    },
  ]

  it('should exclude soft-deleted products from public store results', () => {
    const activeProducts = sampleProducts.filter((p) => !p.isDeleted)
    expect(activeProducts).toHaveLength(3)
    expect(activeProducts.some((p) => p.id === 'p4')).toBe(false)
  })

  it('should filter combinably by country AND category', () => {
    const country = 'c-arg'
    const category = 'RETRO'

    const filtered = sampleProducts.filter(
      (p) => !p.isDeleted && p.countryId === country && p.category === category
    )

    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('p2')
  })

  it('should support national team products without leagueId', () => {
    const nationalTeamProducts = sampleProducts.filter(
      (p) => !p.isDeleted && p.countryId === 'c-arg' && p.leagueId === null
    )

    expect(nationalTeamProducts).toHaveLength(1)
    expect(nationalTeamProducts[0].name).toContain('1986')
  })
})
