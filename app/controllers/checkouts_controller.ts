import type { HttpContext } from '@adonisjs/core/http';

export default class CheckoutController {
  async index({ session, view }: HttpContext) {
    const cart: { price: number; quantity: number }[] = session.get('cart', []);
    
    // Adicionando tipagem explícita no reduce
    const totalPrice = cart.reduce((sum: number, item: { price: number; quantity: number }) => {
      return sum + item.price * item.quantity;
    }, 0);

    return view.render('pages/checkout/index', { cart, totalPrice });
  }

  async process({ session, request, response }: HttpContext) {
    const cart: { price: number; quantity: number }[] = session.get('cart', []);
    const address = request.input('address');
    const paymentMethod = request.input('paymentMethod');

    if (!cart || cart.length === 0) {
      session.flash('error', 'Seu carrinho está vazio!');
      return response.redirect('/cart');
    }

    // Simulando processamento do pedido
    console.log('Pedido realizado com sucesso: ', { cart, address, paymentMethod });

    // Limpa o carrinho após o checkout
    session.forget('cart');
    session.flash('success', 'Pedido realizado com sucesso!');
    return response.redirect('/');
  }
}
