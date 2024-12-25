import User from '#models/user'
import { createUserValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class UsersController {
  async create({ view }: HttpContext) {
    return view.render('pages/users/create')
  }

  async store({ request, response, session }: HttpContext) {
    try {
      const payload = await request.validateUsing(createUserValidator)

      // Criação do usuário
      const user = new User()

      // Trata o campo birthDate separadamente, convertendo diretamente para DateTime
      if (payload.birthDate) {
        user.birthDate = DateTime.fromISO(payload.birthDate) // Converte para DateTime
      }

      // Merge dos demais campos
      user.merge({
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password,
        cpf: payload.cpf,
        phone: payload.phone,
        landline: payload.landline,
        gender: payload.gender,
      })

      await user.save()

      session.flash({ success: 'Conta criada com sucesso!' })
      return response.redirect().toRoute('auth.create')
    } catch (error) {
      console.error('Erro ao criar o usuário:', error)
      session.flash({ error: 'Erro ao processar sua solicitação. Verifique os dados e tente novamente.' })
      return response.redirect().back()
    }
  }

  async update({ auth, request, response, session }: HttpContext) {
    try {
      // Recuperar o usuário autenticado
      const user = auth.user!;
      
      // Capturar os dados do formulário
      const payload = request.only(['fullName', 'email', 'cpf', 'phone', 'gender']);
  
      // Atualizar as informações do usuário
      user.merge(payload);
      await user.save();
  
      // Flash de sucesso
      session.flash({ success: 'Perfil atualizado com sucesso!' });
      return response.redirect().toRoute('users.profile');
    } catch (error) {
      console.error('Erro ao atualizar o perfil:', error);
      session.flash({ error: 'Não foi possível atualizar o perfil. Tente novamente mais tarde.' });
      return response.redirect().back();
    }
  }
  
}
