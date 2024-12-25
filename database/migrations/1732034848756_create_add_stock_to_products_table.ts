import { BaseSchema } from '@adonisjs/lucid/schema';

export default class AddStockToProducts extends BaseSchema {
  protected tableName = 'products';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('stock').defaultTo(0).notNullable(); // Campo de estoque com valor padrão 0
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('stock'); // Remove o campo ao desfazer a migration
    });
  }
}
