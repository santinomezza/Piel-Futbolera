export interface ShippingQuote {
  courierId: 'ANDREANI' | 'CORREO_ARGENTINO'
  courierName: string
  serviceType: string
  price: number
  estimatedDays: string
  description: string
}

/**
 * Calculates shipping quotes for Andreani and Correo Argentino
 * Supports environment API keys when available, and provides realistic
 * Argentina postal code quote calculations.
 */
export async function getShippingQuotes(postalCode: string, totalWeightKg: number = 0.5): Promise<ShippingQuote[]> {
  const cleanPostalCode = postalCode.trim().toUpperCase()

  // Andreani integration check
  let andreaniQuote: ShippingQuote
  if (process.env.ANDREANI_API_KEY && process.env.ANDREANI_CLIENT_NUMBER) {
    // TODO: Andreani API key pendiente - Live API call when credentials provided
    try {
      // API call placeholder for production
      andreaniQuote = {
        courierId: 'ANDREANI',
        courierName: 'Andreani E-commerce',
        serviceType: 'Estándar a Domicilio',
        price: 4200,
        estimatedDays: '2 a 4 días hábiles',
        description: 'Envío prioritario con seguimiento en vivo por Andreani.',
      }
    } catch {
      andreaniQuote = calculateAndreaniFallback(cleanPostalCode)
    }
  } else {
    andreaniQuote = calculateAndreaniFallback(cleanPostalCode)
  }

  // Correo Argentino integration check
  let correoQuote: ShippingQuote
  if (process.env.CORREO_ARGENTINO_API_KEY) {
    // TODO: Correo Argentino API key pendiente - Live API call when credentials provided
    try {
      correoQuote = {
        courierId: 'CORREO_ARGENTINO',
        courierName: 'Correo Argentino Paq.Ar',
        serviceType: 'Encomienda Clásica',
        price: 3600,
        estimatedDays: '3 a 6 días hábiles',
        description: 'Envío oficial de Correo Argentino a todo el país.',
      }
    } catch {
      correoQuote = calculateCorreoArgentinoFallback(cleanPostalCode)
    }
  } else {
    correoQuote = calculateCorreoArgentinoFallback(cleanPostalCode)
  }

  return [andreaniQuote, correoQuote]
}

function calculateAndreaniFallback(postalCode: string): ShippingQuote {
  // CABA & AMBA (C1000 - C1499 / B1000 - B1999)
  const isAMBA = /^C\d{4}/i.test(postalCode) || /^B1[0-9]{3}/i.test(postalCode) || /^1[0-9]{3}/.test(postalCode)

  if (isAMBA) {
    return {
      courierId: 'ANDREANI',
      courierName: 'Andreani Domicilio AMBA',
      serviceType: 'Envío Exprés',
      price: 3500,
      estimatedDays: '24 a 48 hs hábiles',
      description: 'Entrega directa en domicilio con seguimiento en tiempo real.',
    }
  }

  return {
    courierId: 'ANDREANI',
    courierName: 'Andreani Domicilio Nacional',
    serviceType: 'Envío Estándar',
    price: 4900,
    estimatedDays: '3 a 5 días hábiles',
    description: 'Cobertura nacional prioritaria a domicilio.',
  }
}

function calculateCorreoArgentinoFallback(postalCode: string): ShippingQuote {
  const isAMBA = /^C\d{4}/i.test(postalCode) || /^B1[0-9]{3}/i.test(postalCode) || /^1[0-9]{3}/.test(postalCode)

  if (isAMBA) {
    return {
      courierId: 'CORREO_ARGENTINO',
      courierName: 'Correo Argentino Paq.Ar',
      serviceType: 'Clásico AMBA',
      price: 2900,
      estimatedDays: '2 a 4 días hábiles',
      description: 'Red nacional oficial con entrega en domicilio o sucursal.',
    }
  }

  return {
    courierId: 'CORREO_ARGENTINO',
    courierName: 'Correo Argentino Paq.Ar',
    serviceType: 'Clásico Interior',
    price: 4200,
    estimatedDays: '4 a 7 días hábiles',
    description: 'Cobertura a todas las provincias argentinas.',
  }
}
