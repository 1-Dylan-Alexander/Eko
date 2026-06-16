import { Resend } from 'resend'

// Server-side only — never import in client components
// Lazy singleton so build doesn't fail if env var is missing at compile time
let _resend: Resend | null = null

export const resend = new Proxy({} as Resend, {
  get(_, prop: string) {
    if (!_resend) {
      const key = process.env.RESEND_API_KEY
      if (!key) throw new Error('RESEND_API_KEY is not set')
      _resend = new Resend(key)
    }
    return _resend[prop as keyof Resend]
  },
})
