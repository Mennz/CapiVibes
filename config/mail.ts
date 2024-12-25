import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

const mailConfig = defineConfig({
  default: 'smtp',

  mailers: {
    smtp: transports.smtp({
      host: env.get('SMTP_HOST', 'smtp.gmail.com'), // Sempre retorna string
      port: Number(env.get('SMTP_PORT', '587')), // Converte para número
      auth: {
        type: 'login',
        user: env.get('SMTP_USERNAME', 'default-email@gmail.com'), // Valor padrão como string
        pass: env.get('SMTP_PASSWORD', 'default-password'), // Valor padrão como string
      },
    }),
  },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
