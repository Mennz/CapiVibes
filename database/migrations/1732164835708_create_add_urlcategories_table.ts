import { BaseSchema } from '@adonisjs/lucid/schema';

export default class Categories extends BaseSchema {
  protected tableName = 'categories';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('image_url').nullable(); // Campo para o caminho da imagem
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('image_url');
    });
  }
}