import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import { getMercadoPagoAccessToken, getMercadoPagoPublicKey } from './storeConfig'

let _client: MercadoPagoConfig | null = null
let _clientToken: string | null = null

async function getClient(): Promise<MercadoPagoConfig> {
  const token = await getMercadoPagoAccessToken()
  if (!token) {
    throw new Error('Mercado Pago access token no configurado. Configuralo en /admin/configuracion')
  }
  if (!_client || _clientToken !== token) {
    _client = new MercadoPagoConfig({ accessToken: token })
    _clientToken = token
  }
  return _client
}

export async function getPreferenceClient(): Promise<Preference> {
  const c = await getClient()
  return new Preference(c)
}

export async function getPaymentClient(): Promise<Payment> {
  const c = await getClient()
  return new Payment(c)
}

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

  const isHttps = baseUrl.startsWith('https://')
  const isLocalhost = /localhost|127\.0\.0\.1/.test(baseUrl)
  const autoReturn = isHttps && !isLocalhost

  const preferenceData: Record<string, unknown> = {
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
    external_reference: input.orderId,
    statement_descriptor: 'PIELFUTBOLERA',
    notification_url: `${baseUrl}/api/webhooks/mercadopago`,
  }

  if (autoReturn) {
    preferenceData.auto_return = 'approved'
  }

  try {
    const mp = await getPreferenceClient()
    const response = await mp.create({ body: preferenceData as never })
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
    const mp = await getPaymentClient()
    const payment = await mp.get({ id: paymentId })
    return {
      id: payment.id?.toString(),
      status: payment.status,
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

export async function getPublicConfig() {
  const publicKey = await getMercadoPagoPublicKey()
  return {
    publicKey,
    isConfigured: Boolean(publicKey),
  }
}
