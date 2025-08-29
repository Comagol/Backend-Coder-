import { BaseRepository } from './baseRepository.js';
import { cartDBManager } from '../dao/cartDBManager.js';
import { productDBManager } from '../dao/productDBManager.js';
import { CartDTO } from '../dto/cartDTO.js';
import { CartUtils } from '../utils/cartUtils.js';

// extiendo la clase base para crear el repositorio de carriytos
export class CartRepository extends BaseRepository {
  constructor() {
    const productService = new productDBManager();
    super(new cartDBManager(productService));
}

// Metodo para obtener un carrito por su id
async getCartById(id) {
    const cart = await this.dao.getProductsFromCartByID(id);
    return CartDTO.fromCart(cart);
}

// Metodo para crear un carrito
async createCart() {
    const cart = await this.dao.createCart();
    return CartDTO.fromCart(cart);
}

// Metodo para agregar un producto a un carrito
async addProductToCart(cartId, productId) {
    const result = await this.dao.addProductByID(cartId, productId);
    return CartDTO.fromCart(result);
}

// Metodo para eliminar un producto de un carrito
async removeProductFromCart(cartId, productId) {
    const result = await this.dao.deleteProductByID(cartId, productId);
    return result;
}

// Metodo para actualizar los productos de un carrito
async updateCartProducts(cartId, products) {
    // Valido datos del carrito
    CartUtils.validateCartData({ products });
    
    const result = await this.dao.updateAllProducts(cartId, products);
    return result;
}

// Metodo para actualizar la cantidad de un producto en un carrito
async updateProductQuantity(cartId, productId, quantity) {
    if (!quantity || quantity < 1) {
        throw new Error('La cantidad debe ser mayor a 0');
    }
    
    const result = await this.dao.updateProductByID(cartId, productId, quantity);
    return result;
}

// Metodo para vaciar un carrito
async clearCart(cartId) {
    const result = await this.dao.deleteAllProducts(cartId);
    return result;
}

// Metodo para obtener el resumen de un carrito
async getCartSummary(cartId) {
    const cart = await this.dao.getProductsFromCartByID(cartId);
    return CartUtils.getCartSummary(cart);
}
}