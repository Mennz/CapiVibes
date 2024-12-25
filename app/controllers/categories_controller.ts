import { HttpContext } from "@adonisjs/core/http";
import { join } from "path";
import { promises as fs } from "fs";
import Category from "#models/category";
import Application from "@adonisjs/core/services/app";
import { Database } from "@adonisjs/lucid/database";


export default class CategoryController {
  async index({ view }: HttpContext) {
    const categories = await Category.all();
    return view.render("pages/categories/index", { categories });
  }

  async create({ view }: HttpContext) {
    return view.render("pages/categories/create");
  }

  async store({ request, response, session }: HttpContext) {
    const payload = request.only(['name']);
    let imageUrl: string | null = null;
  
    const image = request.file('image', {
      size: '2mb',
      extnames: ['jpg', 'jpeg', 'png'],
    });
  
    if (image && image.isValid) {
      const uploadsPath = join(Application.publicPath(), 'uploads');
      await fs.mkdir(uploadsPath, { recursive: true });
      const imageName = `${new Date().getTime()}_${image.clientName}`;
      await image.move(uploadsPath, { name: imageName });
      imageUrl = `/uploads/${imageName}`;
    }
  
    try {
      await Category.create({ ...payload, imageUrl });
      session.flash({ success: 'Categoria criada com sucesso!' });
      return response.redirect().toRoute('categories.index');
    } catch {
      session.flash({ error: 'Erro ao criar a categoria.' });
      return response.redirect().back();
    }
  }

  async edit({ params, view }: HttpContext) {
    try {
      const category = await Category.findOrFail(params.id);
      return view.render("pages/categories/edit", { category });
    } catch (error) {
      console.error("Erro ao carregar categoria para edição:", error);
      return view.render("errors/not-found", { message: "Categoria não encontrada." });
    }
  }

  async update({ params, request, response, session }: HttpContext) {
    try {
      // Encontrar a categoria pelo ID
      const category = await Category.findOrFail(params.id);

      // Atualizar os dados da categoria
      const payload = request.only(['name']);
      let imageUrl = category.imageUrl; // Manter a imagem atual como padrão

      // Processar nova imagem se enviada
      const image = request.file('image', {
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png'],
      });

      if (image && image.isValid) {
        // Salvar a nova imagem
        const uploadsPath = join(Application.publicPath(), 'uploads/categories');
        await fs.mkdir(uploadsPath, { recursive: true });

        const imageName = `${new Date().getTime()}_${image.clientName}`;
        await image.move(uploadsPath, { name: imageName });

        // Atualizar URL da nova imagem
        imageUrl = `/uploads/categories/${imageName}`;
      }

      // Atualizar a categoria no banco de dados
      category.merge({ ...payload, imageUrl });
      await category.save();

      // Feedback de sucesso
      session.flash({ success: 'Categoria atualizada com sucesso!' });
      return response.redirect().toRoute('categories.index');
    } catch (error) {
      console.error('Erro ao atualizar a categoria:', error);
      session.flash({ error: 'Erro ao atualizar a categoria.' });
      return response.redirect().back();
    }
  }

  public async show({ params, view }: HttpContext) {
    try {
      // Buscar a categoria manualmente
      const category = await Database.from('categories').where('id', params.id).first();

      // Se a categoria não existir, lança erro
      if (!category) {
        return view.render('errors/not-found', {
          message: 'Categoria não encontrada.',
        });
      }

      // Buscar os produtos relacionados à categoria
      const products = await Database.from('products').where('category_id', params.id);

      // Renderizar a view com os dados
      return view.render('pages/categories/show', {
        category,
        products,
      });
    } catch (error) {
      console.error('Erro ao carregar a categoria:', error);
      return view.render('errors/not-found', {
        message: 'Erro ao carregar os dados da categoria.',
      });
    }
  }
  

  async destroy({ params, response, session }: HttpContext) {
    try {
      const category = await Category.findOrFail(params.id);
      await category.delete();
      session.flash({ success: 'Categoria excluída com sucesso!' });
      return response.redirect().toRoute('categories.admin');
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      session.flash({ error: 'Erro ao excluir categoria.' });
      return response.redirect().back();
    }
  }
  
}
