import { HttpContext } from "@adonisjs/core/http";
import Product from '#models/product';
import Category from '#models/category';

export default class HomeController {
  public async index({ view }: HttpContext) {
    try {
      const products = await Product.query().limit(10); // Busca os 10 produtos mais recentes
      const categories = await Category.query(); // Todas as categorias

      return view.render('pages/home/show', { products, categories });
    } catch (error) {
      console.error('Erro ao carregar a página inicial:', error);
      return view.render('errors/server-error', { message: 'Erro ao carregar a página inicial.' });
    }
  }
}

