import { Router } from 'express';
import { productDBManager } from '../dao/productDBManager.js';
import { cartDBManager } from '../dao/cartDBManager.js';
import { ProductDTO } from '../dto/productDTO.js';
import { CartDTO } from '../dto/cartDTO.js';
import { CartUtils } from '../utils/cartUtils.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();
const ProductService = new productDBManager();
const CartService = new cartDBManager(ProductService);

// GET / - Redirigir a productos
router.get('/', async (req, res) => {
    res.redirect('/products');
});

// GET /products - Renderizar la vista de productos (publica)
router.get('/products', async (req, res) => {
   try {
    const products = await ProductService.getAllProducts(req.query);

    //uso el DTO para transformar los productos
    const productsDTO = ProductDTO.fromProducts(products.docs);

    res.render('index', {
        title: 'Productos',
        style: 'index.css',
        products: productsDTO
    });
   } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.render('index', {
        title: 'Productos',
            style: 'index.css',
            products: [],
            error: 'Error al cargar los productos'
        });
   }
});

// GET /realtimeproducts - Productos en tiempo real publica
router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await ProductService.getAllProducts(req.query);
        
        //uso el DTO para transformar los productos
        const productsDTO = ProductDTO.fromProducts(products.docs);
        
        res.render('realTimeProducts', {
            title: 'Productos en Tiempo Real',
            style: 'index.css',
            products: productsDTO
        });
    } catch (error) {
        console.error('Error cargando productos en tiempo real:', error);
        res.render('realTimeProducts', {
            title: 'Productos en Tiempo Real',
            style: 'index.css',
            products: [],
            error: 'Error al cargar los productos'
        });
    }
});

// GET /cart/:cid - Vista del carrito solo usuarios autenticados
router.get('/cart/:cid', requireAuth, async (req, res) => {
    try {
        //verificar que el usuario solo vea su propio carrito
        if (req.user.cart.toString() !== req.params.cid) {
            return res.render('notFound', {
                title: 'Acceso Denegado',
                style: 'index.css',
                message: 'No tienes permisos para acceder a este carrito'
            });
        }

        const response = await CartService.getProductsFromCartByID(req.params.cid);

        if (response.status === 'error') {
            return res.render('notFound', {
                title: 'Carrito No Encontrado',
                style: 'index.css',
                message: 'El carrito especificado no existe'
            });
        }

        //uso CartUtils para obtener resumen del carrito
        const cartSummary = CartUtils.getCartSummary(response);
        
        //uso el DTO para transformar los productos del carrito
        const cartDTO = CartDTO.fromCart(response);

        res.render('cart', {
            title: 'Mi Carrito',
            style: 'index.css',
            user: req.user,
            cart: cartDTO,
            total: cartSummary.total,
            totalItems: cartSummary.totalItems
        });
    } catch (error) {
        console.error('Error cargando carrito:', error);
        res.render('notFound', {
            title: 'Error',
            style: 'index.css',
            message: 'Error al cargar el carrito'
        });
    }
});

// GET /login - Página de login (PÚBLICA)
router.get('/login', (req, res) => {
    // Si ya está autenticado, redirigir a productos
    if (req.user) {
        return res.redirect('/products');
    }

    res.render('login', {
        title: 'Iniciar Sesión',
        style: 'index.css',
        user: null
    });
});

// GET /register - Página de registro (PÚBLICA)
router.get('/register', (req, res) => {
    // Si ya está autenticado, redirigir a productos
    if (req.user) {
        return res.redirect('/products');
    }

    res.render('register', {
        title: 'Registrarse',
        style: 'index.css',
        user: null
    });
});

// GET /profile - Perfil del usuario (SOLO USUARIO AUTENTICADO)
router.get('/profile', requireAuth, (req, res) => {
    res.render('profile', {
        title: 'Mi Perfil',
        style: 'index.css',
        user: req.user
    });
});

// GET /admin - Panel de administración (SOLO ADMIN)
router.get('/admin', requireAuth, (req, res) => {
    // Verificar que sea admin
    if (req.user.role !== 'admin') {
        return res.render('notFound', {
            title: 'Acceso Denegado',
            style: 'index.css',
            message: 'No tienes permisos para acceder al panel de administración'
        });
    }

    res.render('admin', {
        title: 'Panel de Administración',
        style: 'index.css',
        user: req.user
    });
});

export default router;