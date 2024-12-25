import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Hash from '@adonisjs/core/services/hash'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    await User.create({
      fullName: 'Administrador',
      email: 'admin@example.com',
      password: await Hash.make('adminpassword'), // Escolha uma senha segura
      isAdmin: true,
    })
  }
}