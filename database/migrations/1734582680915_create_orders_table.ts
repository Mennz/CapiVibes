import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.string('customer_name').notNullable(); // Nome do cliente
      table.text('address').notNullable(); // Endereço de entrega
      table.string('payment_method').notNullable(); // Método de pagamento
      table.decimal('total_price', 12, 2).notNullable(); // Total do pedido
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now());
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}