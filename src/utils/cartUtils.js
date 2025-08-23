//utilidades para el manejo de carritos
export class CartUtils {
  //calculo el total del carrito
  static calculateTotal(cart) {
    if (!products || products.length === 0) return 0;

    return products.reduce((total, item) => {
      const productPrice = item.product?.price || 0;
      return total + (productPrice * item.quantity);
    }, 0);
  }

  // caclcular total de items en el carrito
  static calculateTotalItems(products) {
    if (!products || products.length === 0) return 0;

    return products.reduce((total, item) => {
      return total + item.quantity;
    }, 0);
  }

  //obtener resumen del carrito
  static getSummary(cart) {
    return {
      id: cart._id,
      products: cart.products || [],
      total: CartUtils.calculateTotal(cart.products),
      totalItems: CartUtils.calculateTotalItems(cart.products)
    };
  }

  // validar datos del carrito
  static validateCartData(cartData) {
    if (cartData.products && !Array.isArray(cartData.products)) {
      throw new Error('El campo products debe ser un array');
    }
    if (cart.Data.products) {
      cartData.products.forEach((item, index) => {
        if (!item.product) {
          throw new Error(`El producto en la posicion ${index} es invalido`);
        }
        if (item.quantity && item.quantity < 1) {
          throw new Error(`La cantidad en la posicion ${index} debe ser mayor a 1`);
        }
      });
    }
    return true;
  }
}