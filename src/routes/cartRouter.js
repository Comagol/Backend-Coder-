import { Router } from 'express';
import { CartRepository } from '../repositories/index.js';
import { requireUser } from '../middlewares/auth.js';

const router = Router();
const cartRepository = new CartRepository();


// GET /api/carts/:cid - Obtener carrito por ID (SOLO USUARIO AUTENTICADO)
router.get('/:cid', requireUser, async (req, res) => {
    try {
        // Verifico que el usuario solo acceda a su propio carrito
        if (req.user.cart.toString() !== req.params.cid) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para acceder a este carrito'
            });
        }

        const cartDTO = await cartRepository.getCartById(req.params.cid);
        const cartSummary = await cartRepository.getCartSummary(req.params.cid);
        
        res.json({
            status: 'success',
            payload: {
                ...cartDTO,
                total: cartSummary.total,
                totalItems: cartSummary.totalItems
            }
        });
    } catch (error) {
        console.error('Error obteniendo carrito:', error);
        res.status(404).json({
            status: 'error',
            message: error.message || 'Carrito no encontrado'
        });
    }
});

// POST /api/carts - Crear nuevo carrito (SOLO USUARIO AUTENTICADO)
router.post('/', requireUser, async (req, res) => {
    try {
        const cartDTO = await cartRepository.createCart();
        
        res.status(201).json({
            status: 'success',
            message: 'Carrito creado correctamente',
            payload: cartDTO
        });
    } catch (error) {
        console.error('Error creando carrito:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al crear carrito'
        });
    }
});

// POST /api/carts/:cid/product/:pid - Agregar producto al carrito (SOLO USUARIO AUTENTICADO)
router.post('/:cid/product/:pid', requireUser, async (req, res) => {
    try {
        // Verifico que el usuario solo acceda a su propio carrito
        if (req.user.cart.toString() !== req.params.cid) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para modificar este carrito'
            });
        }

        const result = await cartRepository.addProductToCart(req.params.cid, req.params.pid);
        const cartSummary = await cartRepository.getCartSummary(req.params.cid);
        
        res.json({
            status: 'success',
            message: 'Producto agregado al carrito correctamente',
            payload: {
                cart: result,
                total: cartSummary.total,
                totalItems: cartSummary.totalItems
            }
        });
    } catch (error) {
        console.error('Error agregando producto al carrito:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Error al agregar producto al carrito'
        });
    }
});

// DELETE /api/carts/:cid/product/:pid - Eliminar producto del carrito (SOLO USUARIO AUTENTICADO)
router.delete('/:cid/product/:pid', requireUser, async (req, res) => {
    try {
        // Verifico que el usuario solo acceda a su propio carrito
        if (req.user.cart.toString() !== req.params.cid) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para modificar este carrito'
            });
        }

        const result = await cartRepository.removeProductFromCart(req.params.cid, req.params.pid);
        
        res.json({
            status: 'success',
            message: 'Producto eliminado del carrito correctamente',
            payload: result
        });
    } catch (error) {
        console.error('Error eliminando producto del carrito:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Error al eliminar producto del carrito'
        });
    }
});

// PUT /api/carts/:cid - Actualizar todos los productos del carrito (SOLO USUARIO AUTENTICADO)
router.put('/:cid', requireUser, async (req, res) => {
    try {
        // Verifico que el usuario solo acceda a su propio carrito
        if (req.user.cart.toString() !== req.params.cid) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para modificar este carrito'
            });
        }

        const result = await cartRepository.updateCartProducts(req.params.cid, req.body.products);
        
        res.json({
            status: 'success',
            message: 'Carrito actualizado correctamente',
            payload: result
        });
    } catch (error) {
        console.error('Error actualizando carrito:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Error interno del servidor al actualizar carrito'
        });
    }
});


// PUT /api/carts/:cid/product/:pid - Actualizar cantidad de producto (SOLO USUARIO AUTENTICADO)
router.put('/:cid/product/:pid', requireUser, async (req, res) => {
    try {
        // Verifico que el usuario solo acceda a su propio carrito
        if (req.user.cart.toString() !== req.params.cid) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para modificar este carrito'
            });
        }

        const { quantity } = req.body;
        const result = await cartRepository.updateProductQuantity(req.params.cid, req.params.pid, quantity);
        
        res.json({
            status: 'success',
            message: 'Cantidad actualizada correctamente',
            payload: result
        });
    } catch (error) {
        console.error('Error actualizando cantidad:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Error al actualizar cantidad'
        });
    }
});

// DELETE /api/carts/:cid - Vaciar carrito (SOLO USUARIO AUTENTICADO)
router.delete('/:cid', requireUser, async (req, res) => {
    try {
        // Verifico que el usuario solo acceda a su propio carrito
        if (req.user.cart.toString() !== req.params.cid) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para modificar este carrito'
            });
        }

        const result = await cartRepository.clearCart(req.params.cid);
        
        res.json({
            status: 'success',
            message: 'Carrito vaciado correctamente',
            payload: result
        });
    } catch (error) {
        console.error('Error vaciando carrito:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al vaciar carrito'
        });
    }
});

export default router;