import type { HttpContext } from '@adonisjs/core/http';
import Product from '#models/product';

export default class CartController {
  async index({ session, view }: HttpContext) {
    const cart = session.get('cart', []);

    // Adiciona a verificação do estoque de cada produto no carrinho
    const cartWithStockInfo = await Promise.all(
      cart.map(async (item) => {
        const product = await Product.find(item.id);
        return {
          ...item,
          maxReached: product ? item.quantity >= product.stock : false,
        };
      })
    );

    return view.render('pages/cart/index', { cart: cartWithStockInfo });
  }

  async add({ session, request, response }: HttpContext) {
    const productId = request.input('productId');
    const quantity = parseInt(request.input('quantity'), 10) || 1;

    const product = await Product.find(productId);
    if (!product) {
      session.flash('error', 'Produto não encontrado.');
      return response.redirect('/cart');
    }

    const cart = session.get('cart', []);
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      const totalQuantity = existingItem.quantity + quantity;

      if (totalQuantity > product.stock) {
        session.flash('error', 'Quantidade total excede o estoque disponível.');
        return response.redirect('/cart');
      }

      existingItem.quantity = totalQuantity;
    } else {
      if (quantity > product.stock) {
        session.flash('error', 'Quantidade indisponível em estoque.');
        return response.redirect('/cart');
      }

      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity,
      });
    }

    session.put('cart', cart);
    session.flash('success', `${product.name} adicionado ao carrinho.`);
    return response.redirect('/cart');
  }

  async remove({ session, params, response }: HttpContext) {
    const productId = parseInt(params.id, 10);
    const cart = session.get('cart', []);
    const updatedCart = cart.filter((item) => item.id !== productId);
    session.put('cart', updatedCart);
    return response.redirect('/cart');
  }

  // Método para API que retorna os itens do carrinho
  async getCart({ session, response }: HttpContext) {
    const cart = session.get('cart', []);
    return response.json(cart);
  }
}
