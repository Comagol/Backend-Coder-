import { Router } from 'express';
import { TicketRepository } from '../repositories/index.js';
import { CartRepository } from '../repositories/index.js';
import { ProductRepository } from '../repositories/index.js';
import { requireUser } from '../middlewares/auth.js';

const router = Router();
const ticketRepository = new TicketRepository();
const cartRepository = new CartRepository();
const productRepository = new ProductRepository();

// POST /api/tickets/purchase - Procesar compra del carrito
router.post('/purchase', requireUser, async (req, res) => {
    try {
        const userId = req.user._id;
        const userCartId = req.user.cart;

        // Obtener el carrito del usuario usando repository
        const cart = await cartRepository.getCartById(userCartId);
        
        if (!cart || cart.products.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'El carrito está vacío'
            });
        }

        // Verificar stock de todos los productos
        const stockValidation = await validateStock(cart.products);
        
        if (!stockValidation.isValid) {
            return res.status(400).json({
                status: 'error',
                message: 'Stock insuficiente para algunos productos',
                details: stockValidation.errors
            });
        }

        // Calcular total de la compra
        const cartSummary = await cartRepository.getCartSummary(userCartId);
        const total = cartSummary.total;

        // Crear el ticket con estado 'completed'
        const ticketData = {
            purchaser: req.user.email,
            amount: total,
            products: cart.products.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            })),
            status: 'completed'
        };

        const ticket = await ticketRepository.createTicket(ticketData);

        // Actualizar stock de productos
        await updateProductStock(cart.products);

        // Vaciar el carrito después de la compra exitosa
        await cartRepository.clearCart(userCartId);

        res.status(201).json({
            status: 'success',
            message: 'Compra procesada correctamente',
            payload: {
                ticket: {
                    code: ticket.code,
                    purchase_datetime: ticket.purchase_datetime,
                    amount: ticket.amount,
                    purchaser: ticket.purchaser,
                    products: ticket.products,
                    status: ticket.status
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

// GET /api/tickets - Obtener tickets del usuario
router.get('/', requireUser, async (req, res) => {
    try {
        const tickets = await ticketRepository.getTicketsByUser(req.user.email);

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

// GET /api/tickets/:ticketCode - Obtener ticket específico
router.get('/:ticketCode', requireUser, async (req, res) => {
    try {
        const ticket = await ticketRepository.getTicketByCode(req.params.ticketCode);

        if (!ticket) {
            return res.status(404).json({
                status: 'error',
                message: 'Ticket no encontrado'
            });
        }

        // Verificar que el ticket pertenezca al usuario
        if (ticket.purchaser !== req.user.email) {
            return res.status(403).json({
                status: 'error',
                message: 'No tienes permisos para ver este ticket'
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

// Validar stock de productos
async function validateStock(products) {
    const errors = [];
    let isValid = true;

    for (const item of products) {
        try {
            const product = await productRepository.getProductById(item.product._id);
            
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

// Actualizar stock de productos
async function updateProductStock(products) {
    for (const item of products) {
        try {
            const product = await productRepository.getProductById(item.product._id);
            const newStock = product.stock - item.quantity;
            
            await productRepository.updateProduct(item.product._id, { stock: newStock });
        } catch (error) {
            console.error(`Error actualizando stock del producto ${item.product._id}:`, error);
            throw new Error('Error actualizando stock de productos');
        }
    }
}

export default router;