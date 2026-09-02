import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

// Initialize Mercado Pago client safely on backend
const accessToken = process.env.MP_ACCESS_TOKEN || 'TEST-MP-ACCESS-TOKEN-DOCE-DEV'
const client = new MercadoPagoConfig({ accessToken })

export const mpPreference = new Preference(client)
export const mpPayment = new Payment(client)

export interface CreatePreferenceInput {
  orderId: string
  orderNumber: string
  items: {
    title: string
    quantity: number
    unitPrice: number
  }[]
  shippingFee: number
  payer: {
    name: string
    surname: string
    email: string
    phone?: string
  }
}

export async function createCheckoutPreference(input: CreatePreferenceInput) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const preferenceData = {
    items: input.items.map((item) => ({
      id: input.orderId,
      title: item.title,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      currency_id: 'ARS',
    })),
    shipments: {
      cost: input.shippingFee,
      mode: 'not_specified',
    },
    payer: {
      name: input.payer.name,
      surname: input.payer.surname,
      email: input.payer.email,
    },
    back_urls: {
      success: `${baseUrl}/checkout/confirmacion/${input.orderId}?status=approved`,
      pending: `${baseUrl}/checkout/confirmacion/${input.orderId}?status=pending`,
      failure: `${baseUrl}/checkout/confirmacion/${input.orderId}?status=rejected`,
    },
    auto_return: 'approved',
    external_reference: input.orderId,
    statement_descriptor: 'DOCE CAMISETAS',
    notification_url: `${baseUrl}/api/webhooks/mercadopago`,
  }

  try {
    const response = await mpPreference.create({ body: preferenceData })
    return {
      id: response.id,
      initPoint: response.init_point,
      sandboxInitPoint: response.sandbox_init_point,
    }
  } catch (error) {
    console.error('❌ Mercado Pago Preference Error:', error)
    throw new Error('No se pudo generar la preferencia de pago de Mercado Pago')
  }
}

export async function getPaymentStatus(paymentId: string) {
  try {
    const payment = await mpPayment.get({ id: paymentId })
    return {
      id: payment.id?.toString(),
      status: payment.status, // approved, pending, rejected
      statusDetail: payment.status_detail,
      externalReference: payment.external_reference,
      paymentMethodId: payment.payment_method_id,
      transactionAmount: payment.transaction_amount,
    }
  } catch (error) {
    console.error(`❌ Error fetching Mercado Pago payment ${paymentId}:`, error)
    return null
  }
}
