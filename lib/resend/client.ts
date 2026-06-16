import { Resend } from 'resend'

// Server-side only — never import in client components
export const resend = new Resend(process.env.RESEND_API_KEY!)
