import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Newsletters extends BaseSchema {
  protected tableName = 'newsletters'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id') // ID único para cada inscrição
      table.string('email').notNullable().unique() // E-mail único
      table.timestamps(true, true) // Campos created_at e updated_at
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}