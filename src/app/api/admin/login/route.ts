import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(4, 'Contraseña requerida'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 400 })
    }

    const { email, password } = parsed.data

    // Validate admin credentials (development default: admin@doce.com.ar / admin123)
    if (email === 'admin@doce.com.ar' && (password === 'admin123' || password === 'admin123_dev_password_hash')) {
      const cookieStore = await cookies()
      cookieStore.set('admin_session', 'authenticated_token_doce_admin_2026', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 })
  } catch (error) {
    console.error('❌ Admin login error:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
