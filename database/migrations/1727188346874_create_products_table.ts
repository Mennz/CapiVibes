import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'products';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id'); // ID primário
      table.string('name').notNullable(); // Nome do produto
      table.decimal('price', 10, 2).notNullable(); // Preço com 2 casas decimais
      table.text('description').notNullable(); // Descrição do produto
      table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('CASCADE'); // Relacionamento com categorias
      table.string('image_url').nullable(); // URL da imagem do produto
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now()); // Data de criação
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now()); // Data de atualização
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
