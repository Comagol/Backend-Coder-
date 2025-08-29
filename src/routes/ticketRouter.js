import { Router } from 'express';
import { TicketRepository } from '../repositories/index.js';
import { CartRepository } from '../repositories/index.js';
import { ProductRepository } from '../repositories/index.js';
import { requireUser } from '../middlewares/auth.js';

const router = Router();
const ticketRepository = new TicketRepository();
const cartRepository = new CartRepository();
const productRepository = new ProductRepository();

// POST /api/tickets/purchase - para procesar la compra del carrito
router.post('/purchase', requireUser, async (req, res) => {
    try {
        const userId = req.user._id;
        const userCartId = req.user.cart;

        // Obtengo el carrito del usuario
        const cart = await CartService.getProductsFromCartByID(userCartId);
        
        if (!cart || cart.products.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'El carrito está vacío'
            });
        }

        // Verifico stock de todos los productos
        const stockValidation = await validateStock(cart.products);
        
        if (!stockValidation.isValid) {
            return res.status(400).json({
                status: 'error',
                message: 'Stock insuficiente para algunos productos',
                details: stockValidation.errors
            });
        }

        // Calculo el total de la compra
        const total = CartUtils.calculateTotal(cart.products);

        // Creo el ticket con estado 'completed'
        const ticket = new ticketModel({
            purchaser: req.user.email,
            amount: total,
            products: cart.products.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            })),
            status: 'completed'
        });

        await ticket.save();

        // Actualizo el stock de los productos
        await updateProductStock(cart.products);

        // Vacio el carrito despues de la compra exitosa
        await CartService.deleteAllProducts(userCartId);

        // Obtengo la informacion completa del ticket
        const populatedTicket = await ticketModel.findById(ticket._id)
            .populate({
                path: 'products.product',
                select: 'title price',
                model: 'products'
            })
            .exec();

        res.status(201).json({
            status: 'success',
            message: 'Compra procesada correctamente',
            payload: {
                ticket: {
                    code: populatedTicket.code,
                    purchase_datetime: populatedTicket.purchase_datetime,
                    amount: populatedTicket.amount,
                    purchaser: populatedTicket.purchaser,
                    products: populatedTicket.products,
                    status: populatedTicket.status
                },
                total: total,
                itemsPurchased: cart.products.length
            }
        });

    } catch (error) {
        console.error('Error procesando compra:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al procesar la compra'
        });
    }
});

// GET /api/tickets - Obtengo todos los tickets del usuario
router.get('/', requireUser, async (req, res) => {
    try {
        const tickets = await ticketModel.find({ purchaser: req.user.email })
            .populate({
                path: 'products.product',
                select: 'title price',
                model: 'products'
            })
            .sort({ purchase_datetime: -1 })
            .exec();

        const ticketsFormatted = tickets.map(ticket => ({
            code: ticket.code,
            purchase_datetime: ticket.purchase_datetime,
            amount: ticket.amount,
            products: ticket.products,
            status: ticket.status
        }));

        res.json({
            status: 'success',
            payload: ticketsFormatted
        });

    } catch (error) {
        console.error('Error obteniendo tickets:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al obtener tickets'
        });
    }
});

// GET /api/tickets/:ticketCode - Obtengo un ticket especifico
router.get('/:ticketCode', requireUser, async (req, res) => {
    try {
        const ticket = await ticketModel.findOne({ 
            code: req.params.ticketCode,
            purchaser: req.user.email 
        }).populate({
            path: 'products.product',
            select: 'title price',
            model: 'products'
        }).exec();

        if (!ticket) {
            return res.status(404).json({
                status: 'error',
                message: 'Ticket no encontrado'
            });
        }

        res.json({
            status: 'success',
            payload: {
                code: ticket.code,
                purchase_datetime: ticket.purchase_datetime,
                amount: ticket.amount,
                products: ticket.products,
                status: ticket.status
            }
        });

    } catch (error) {
        console.error('Error obteniendo ticket:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al obtener ticket'
        });
    }
});

// Funciones auxiliares

// Valido el stock de los productos
async function validateStock(products) {
    const errors = [];
    let isValid = true;

    for (const item of products) {
        try {
            const product = await ProductService.getProductByID(item.product._id);
            
            if (product.stock < item.quantity) {
                errors.push({
                    product: product.title,
                    requested: item.quantity,
                    available: product.stock
                });
                isValid = false;
            }
        } catch (error) {
            errors.push({
                product: 'Producto no encontrado',
                requested: item.quantity,
                available: 0
            });
            isValid = false;
        }
    }

    return { isValid, errors };
}

// Actualizo el stock de los productos
async function updateProductStock(products) {
    for (const item of products) {
        try {
            const product = await ProductService.getProductByID(item.product._id);
            const newStock = product.stock - item.quantity;
            
            await ProductService.updateProduct(item.product._id, { stock: newStock });
        } catch (error) {
            console.error(`Error actualizando stock del producto ${item.product._id}:`, error);
            throw new Error('Error actualizando stock de productos');
        }
    }
}

export default router;