import User from "#models/user"
import { createAuthValidator } from "#validators/auth"
import { HttpContext } from "@adonisjs/core/http"

export default class AuthController {
  create({ view, session }: HttpContext) {
    return view.render('pages/auth/create', {
      emailError: session.flashMessages.get('errors.email'),
      passwordError: session.flashMessages.get('errors.password'),
    })
  }

  async store({ auth, request, response, session }: HttpContext) {
    try {
      const payload = await request.validateUsing(createAuthValidator)
      const user = await User.verifyCredentials(payload.email, payload.password)
      await auth.use('web').login(user)
    } catch (exception: any) {
      session.flashOnly(['email'])

      // Verifica se exception possui mensagens de erro do validator
      if (exception.messages?.errors) {
        const errors = exception.messages.errors as { field: string; message: string }[]

        // Mensagens específicas para email e senha
        session.flash({
          errors: {
            email: errors.find((e) => e.field === 'email')?.message || 'Email inválido.',
            password: errors.find((e) => e.field === 'password')?.message || 'Senha incorreta.',
          },
        })
      } else {
        // Mensagem geral de erro de login
        session.flash({
          errors: {
            email: 'Email inválido.',
            password: 'Senha incorreta.',
          },
        })
      }

      return response.redirect().back()
    }

    // Corrigido para redirecionar para a rota 'home'
    return response.redirect().toRoute('home')
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    // Corrigido para redirecionar para a rota 'home'
    return response.redirect().toRoute('home')
  }
}
