import { Router } from 'express';
import { productDBManager } from '../dao/managers/productDBManager.js';
import { cartDBManager } from '../dao/managers/cartDBManager.js';
import { ticketModel } from '../dao/models/ticketModel.js';
import { CartUtils } from '../utils/cartUtils.js';
import { requireUser } from '../middlewares/auth.js';

const router = Router();
const ProductService = new productDBManager();
const CartService = new cartDBManager(ProductService);

// post /api/tickets/purchase (procesa compra del carrito)
router.post('/purchase', requireUser, async (req , res) => {
  try {
    const userId = req.user._id;
    const userCartId = req.user.cart;

    //obtengo el carrito del usuario
    const cart = await CartService.getProductsFromCartById(userCartId);

    //verifico si el carrito esta vacio
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'El carrito esta vacio'
      });
    }

    //verifico el stock de los productos
    const stockValidation = await validateStock(cart.products);
    if (!stockValidation.success) {
      return res.status(400).json({
        status: 'error',
        message: 'No hay stock suficiente de algunos productos',
        detail: stockValidation.message
      });
    }
    //calculo el total de la compra
    const total = CartUtils.calculateTotal(cart.products);

    //Creo el ticket
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
    //guardo el ticket
    await ticket.save();

    //actualizo el carrito
    await updateProductsStock(cart.products);

    //limpia el carrito
    await CartService.deleteAllProducts(userCartId);

     // Obtener información completa del ticket
     const populatedTicket = await ticketModel.findById(ticket._id)
     .populate('products.product', 'title price');

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

// get /api/tickets - para obtener todos los tickets del usuario
router.get('/', requireUser, async(req,res) => {
  try {
    const tickets = await ticketModel.find({ purchaser: req.user.email})
    .populate('products.product', 'title price')
    .sort({ purchaser_datetime: -1 });

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
      status:'error',
      message: 'Error interno del servidor al obtener los tickets'
    });
  }
});