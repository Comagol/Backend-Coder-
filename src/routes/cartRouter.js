import { Router } from 'express';
import { productDBManager } from '../dao/productDBManager.js';
import { cartDBManager } from '../dao/cartDBManager.js';
import { CartDTO } from '../dto/cartDTO.js';
import { CartUtils } from '../utils/cartUtils.js';
import { requireUser } from '../middlewares/auth.js';

const router = Router();
const ProductService = new productDBManager();
const CartService = new cartDBManager(ProductService);

router.get('/:cid', requireUser, async (req, res) => {

    try {
        if (req.user.cart.toString() !== req.params.cid) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para acceder a este carrito'
            });
        }

        const result = await CartService.getProductsFromCartByID(req.params.cid);

        const cartSummary = CartUtils.getCartSummary(result);

        const cartDTO = CartDTO.fromCart(result);

        res.json({
            status: 'success',
            payload: {
                ...cartDTO,
                total: cartSummary.total,
                totalItems: cartSummary.totalItems,
            }
        });
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        res.status(404).json({
            status: 'error',
            message: error.message || 'Carrito no encontrado'
        });
    }
});

router.post('/', requireUser, async (req, res) => {

    try {
        const result = await CartService.createCart()

        const cartDTO = CartDTO.fromCart(result)

        res.status(201).json({
            status: 'success',
            message: 'Carrito creado correctamente',
            payload: cartDTO
        })
    } catch (error) {
        console.error('Error al crear el carrito:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servido al crear el carrito'
        });
    }
});

router.post('/:cid/product/:pid', requireUser, async (req, res) => {

    try {
        if (req.user.cart.toString() !== req.params.cid) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para acceder a este carrito'
            });
        }

        const result = await CartService.addProductByID(req.params.cid, req.params.pid);

        const cartSummary = CartUtils.getCartSummary(result);

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

router.delete('/:cid/product/:pid',requireUser , async (req, res) => {

    try {
        if (req.user.cart.toString() !== req.params.cid) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para modificar este carrito'
            });
        }

        const result = await CartService.deleteProductByID(req.params.cid, req.params.pid);

        res.json({
            status: 'success',
            message: 'Producto eliminado del carrito correctamente',
            payload: result
        });
    } catch (error) {
        console.error('Error eliminando el producto del carrito:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Error al eliminar el producto del carrito'
        });
    }
});

router.put('/:cid',requireUser ,  async (req, res) => {

    try {
        const result = await CartService.updateAllProducts(req.params.cid, req.body.products)
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        res.status(400).send({
            status: 'error',
            message: error.message
        });
    }
});

router.put('/:cid/product/:pid', async (req, res) => {

    try {
        const result = await CartService.updateProductByID(req.params.cid, req.params.pid, req.body.quantity)
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        res.status(400).send({
            status: 'error',
            message: error.message
        });
    }
});

router.delete('/:cid', async (req, res) => {

    try {
        const result = await CartService.deleteAllProducts(req.params.cid)
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        res.status(400).send({
            status: 'error',
            message: error.message
        });
    }
});

export default router;