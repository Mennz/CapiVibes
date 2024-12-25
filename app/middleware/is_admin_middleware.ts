import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class IsAdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { auth, response } = ctx

    await auth.check()
    const user = auth.user

    if (!user || !user.isAdmin) {
      
      return response.unauthorized({ message: 'Acesso não autorizado. Apenas administradores podem acessar esta rota.' })
    }

    await next()
  }
}
