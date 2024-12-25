import router from '@adonisjs/core/services/router';
import User from '#models/user';
import Product from '#models/product';
import { middleware } from './kernel.js';
import Category from '#models/category';
import path from 'path';
import Application from '@adonisjs/core/services/app';

const CategoryController = () => import('#controllers/categories_controller');
const UsersController = () => import('#controllers/users_controller');
const ProductsController = () => import('#controllers/products_controller');
const AuthController = () => import('#controllers/auth_controller');
const HomeController = () => import('#controllers/home_controller');
const TestEmailController = () => import('#controllers/test_emails_controller');
const CartController = () => import('#controllers/cart_controller');
const CheckoutController = () => import('#controllers/checkouts_controller')


// Página inicial
router.get('/', [HomeController, 'index']).as('home'); 

router.get('/api/products', 'HomeController.fetchProducts').as('api.products');
router.get('/api/categories', 'HomeController.fetchCategories').as('api.categories'); 

// Autenticação
router.group(() => {
  router.get('/login', [AuthController, 'create']).as('auth.create');
  router.post('/login', [AuthController, 'store']).as('auth.store');
  router.get('/logout', [AuthController, 'destroy']).use(middleware.auth()).as('auth.destroy');
});

// Registro de usuário
router.get('/user', [UsersController, 'create']).as('users.create');
router.post('/user', [UsersController, 'store']).as('users.store');

// Email
router.get('/test-email', [TestEmailController, 'send']);

// Perfil do usuário
router.group(() => {
  router.get('/perfil', async ({ view, auth }) => {
    return view.render('pages/users/profile', { user: auth.user });
  }).as('users.profile');

  router.get('/perfil/editar', async ({ view, auth }) => {
    return view.render('pages/users/edit', { user: auth.user });
  }).as('users.edit');

  router.post('/perfil', [UsersController, 'update']).as('users.update');
}).use(middleware.auth());

// Produtos (Acesso público)
router.group(() => {
  router.get('/products', [ProductsController, 'index']).as('products.index'); // Lista produtos
  router.get('/products/:id', [ProductsController, 'show']).as('products.show'); // Detalhes do produto
  router.get('/categories/:id', async ({ params, view }) => {
    const category = await Category.find(params.id);

    if (!category) {
      return view.render('errors/not-found', { message: 'Categoria não encontrada.' });
    }

    // Buscar produtos relacionados à categoria
    const products = await Product.query().where('categoryId', params.id);

    return view.render('pages/categories/show', {
      category,
      products,
    });
  });
});

// Produtos (Acesso administrativo)
router
  .group(() => {
    router.get('/admin/products', [ProductsController, 'admin']).as('products.admin'); 
    router.get('/admin/products/new', [ProductsController, 'create']).as('products.create'); 
    router.post('/admin/products', [ProductsController, 'store']).as('products.store'); 
    router.get('/admin/products/:id/edit', [ProductsController, 'edit']).as('products.edit'); 
    router.post('/admin/products/:id/update', [ProductsController, 'update']).as('products.update');
    router.post('/admin/products/:id', [ProductsController, 'destroy']).as('products.destroy'); 
  })
  .use(middleware.auth())
  .use(async ({ auth, response }, next) => {
    if (!auth.user?.isAdmin) {
      return response.redirect('/');
    }
    await next();
  });

// Rota genérica para exibir arquivos do storage
router.get('/storage/*', async ({ params, response }) => {
  const filePath = params['*'].join('/');
  const fullPath = path.join(Application.publicPath('uploads'), filePath);

  const normalizedPath = path.normalize(fullPath);
  if (!normalizedPath.startsWith(Application.publicPath('uploads'))) {
    return response.badRequest('Caminho malformado.');
  }

  return response.download(normalizedPath);
}).as('storage.file');

// Categorias (Somente administradores)
router
  .group(() => {
    router.get('/admin/categories', [CategoryController, 'index']).as('categories.index'); 
    router.get('/admin/categories/create', [CategoryController, 'create']).as('categories.create'); 
    router.post('/admin/categories', [CategoryController, 'store']).as('categories.store'); 
    router.get('/admin/categories/:id/edit', [CategoryController, 'edit']).as('categories.edit'); 
    router.post('/admin/categories/:id/update', [CategoryController, 'update']).as('categories.update'); 
    router.post('/admin/categories/:id', [CategoryController, 'destroy']).as('categories.destroy'); 
  })
  .use(middleware.auth())
  .use(async ({ auth, response }, next) => {
    if (!auth.user?.isAdmin) {
      return response.redirect('/');
    }
    await next();
  });

//carrinho
router.group(() => {
  router.get('/cart', [CartController, 'index']).as('cart.index') // Visualizar o carrinho
  router.post('/cart/add', [CartController, 'add']).as('cart.add') // Adicionar ao carrinho
  router.post('/cart/:id/remove', [CartController, 'remove']).as('cart.remove') // Remover do carrinho
  router.get('/api/cart', [CartController, 'getCart']).as('cart.api'); // Retornar itens do carrinho (API)
})

// Checkout
router.group(() => {
  router.get('/checkout', [CheckoutController, 'index']).as('checkout.index');
  router.post('/checkout', [CheckoutController, 'process']).as('checkout.process');
}).use(middleware.auth());





router.get('/api/products/search', async ({ request }) => {
  const query = request.input('query', '');
  if (!query) {
    return [];
  }

  return await Product.query()
    .where('name', 'like', `%${query}%`)
    .select(['id', 'name', 'price', 'imageUrl'])
    .limit(10);
});

// Autenticação com Google usando Ally
router.get('/login/google', async ({ ally }) => {
  return ally.use('google').redirect();
}).as('auth.google');

router.get('/login/google/callback', async ({ ally, auth, response }) => {
  try {
    const googleUser = await ally.use('google').user();

    const user = await User.firstOrCreate(
      { email: googleUser.email },
      {
        fullName: googleUser.name,
        password: 'generated-password',
      }
    );

    await auth.use('web').login(user);
    return response.redirect('/');
  } catch (error) {
    console.error('Erro ao autenticar com Google:', error);
    return response.redirect('/login');
  }
}).as('auth.google.callback');
