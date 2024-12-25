import { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'


export default class TestEmailController {
  public async send(ctx: HttpContext) {
    try {
      await mail.send((message) => {
        message
          .to('destinatario@example.com') // Substitua pelo email de destino
          .from('seu-email@gmail.com') // Substitua pelo seu email
          .subject('Teste de Email')
          .html('<h1>Envio de email no AdonisJS funcionando!</h1>')
      })

      ctx.response.send('Email enviado com sucesso!')
    } catch (error) {
      console.error('Erro ao enviar email:', error)
      ctx.response.internalServerError('Erro ao enviar email.')
    }
  }
}
