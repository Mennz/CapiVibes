import { HttpContext } from "@adonisjs/core/http";
import { join } from "path";
import { promises as fs } from "fs";
import Product from "#models/product";
import Category from "#models/category";
import Application from "@adonisjs/core/services/app";

export default class ProductsController {
  

  async index({ request, view }: HttpContext) {
    const search = request.input('search');
    const categoryId = request.input('category');
  
    const query = Product.query().preload('category');
  
    if (search) {
      query.where('name', 'like', `%${search}%`);
    }
  
    if (categoryId) {
      query.where('categoryId', categoryId);
    }
  
    // Certifique-se de que o campo 'stock' está sendo selecionado
    const products = await query.select('id', 'name', 'price', 'stock', 'imageUrl');
  
    const categories = await Category.all();
  
    return view.render('pages/products/index', {
      products,
      categories,
    });
  }
  
  
  

  async admin({ request, view }: HttpContext) {
    const page = request.input("page", 1); // Página atual
    const limit = 10; // Número de produtos por página
    const products = await Product.query().preload("category").paginate(page, limit);

    return view.render("pages/products/admin", { products });
  }

  // Exibir formulário de criação de produto
  async create({ view }: HttpContext) {
    const categories = await Category.all();
    return view.render("pages/products/create", { categories });
  }

  // Salvar produto no banco de dados
  async store({ request, response, session }: HttpContext) {
    const payload = request.only(["name", "price", "description", "categoryId", "stock"]);
    let imageUrl: string | null = null;

    const image = request.file("image", {
      size: "2mb",
      extnames: ["jpg", "jpeg", "png"],
    });

    if (image && image.isValid) {
      try {
        const uploadsPath = join(Application.publicPath(), "uploads");
        await fs.mkdir(uploadsPath, { recursive: true });
        const imageName = `${new Date().getTime()}_${image.clientName}`;
        await image.move(uploadsPath, { name: imageName });
        imageUrl = `/uploads/${imageName}`;
      } catch (error) {
        console.error("Erro ao salvar a imagem:", error);
        session.flash({
          error: "Erro ao salvar a imagem. O produto será criado sem imagem.",
        });
      }
    }

    try {
      await Product.create({ ...payload, imageUrl });
      session.flash({ success: "Produto criado com sucesso!" });
      return response.redirect().toRoute("products.admin");
    } catch (error) {
      console.error("Erro ao criar o produto:", error);
      session.flash({ error: "Erro ao criar o produto." });
      return response.redirect().back();
    }
  }

  // Exibir formulário de edição de produto
  async edit({ params, view }: HttpContext) {
    try {
      const product = await Product.findOrFail(params.id);
      const categories = await Category.all();

      return view.render("pages/products/edit", { product, categories });
    } catch (error) {
      console.error("Erro ao carregar produto para edição:", error);
      return view.render("errors/not-found", { message: "Produto não encontrado." });
    }
  }

  // Atualizar produto
  async update({ params, request, response, session }: HttpContext) {
    try {
      // Encontrar o produto
      const product = await Product.findOrFail(params.id);
  
      // Obter dados enviados no formulário
      const payload = request.only(['name', 'price', 'description', 'categoryId', 'stock']);
  
      // Processar imagem (opcional)
      const image = request.file('image', {
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png'],
      });
  
      let imageUrl = product.imageUrl; // Manter a imagem existente por padrão
  
      if (image && image.isValid) {
        const uploadsPath = join(Application.publicPath(), 'uploads');
        await fs.mkdir(uploadsPath, { recursive: true });
        const imageName = `${new Date().getTime()}_${image.clientName}`;
        await image.move(uploadsPath, { name: imageName });
  
        imageUrl = `/uploads/${imageName}`;
  
        // Excluir a imagem antiga se existir
        if (product.imageUrl) {
          const oldImagePath = join(Application.publicPath(), product.imageUrl);
          await fs.unlink(oldImagePath).catch(() =>
            console.error('Erro ao excluir a imagem antiga.')
          );
        }
      }
  
      // Atualizar o produto com os novos dados
      product.merge({ ...payload, imageUrl });
      await product.save();
  
      // Sucesso
      session.flash({ success: 'Produto atualizado com sucesso!' });
      return response.redirect().toRoute('products.admin');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      session.flash({ error: 'Erro ao atualizar produto.' });
      return response.redirect().back();
    }
  }  
  

  // Excluir produto
  async destroy({ params, response, session }: HttpContext) {
    try {
      const product = await Product.findOrFail(params.id);

      // Remove a imagem associada, se existir
      if (product.imageUrl) {
        const imagePath = join(Application.publicPath(), product.imageUrl);
        await fs.unlink(imagePath).catch(() =>
          console.error("Erro ao excluir a imagem associada.")
        );
      }

      await product.delete();
      session.flash({ success: "Produto excluído com sucesso!" });
      return response.redirect().toRoute("products.admin");
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      session.flash({ error: "Erro ao excluir produto." });
      return response.redirect().back();
    }
  }

  async show({ params, view }: HttpContext) {
    try {
      const product = await Product.query()
        .preload('category') // Carrega a categoria associada ao produto
        .where('id', params.id)
        .firstOrFail(); // Lança um erro se o produto não for encontrado

      return view.render('pages/products/show', { product });
    } catch (error) {
      console.error('Erro ao carregar o produto:', error);
      return view.render('errors/not-found', {
        message: 'Produto não encontrado.',
      });
    }
  }
}
