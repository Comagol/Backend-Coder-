
export class CartDTO {
  constructor(cart) {
    this.id = cart._id;
    this.products = cart.products || [];
  }

  static fromCart(cart) {
    return new CartDTO(cart);
  }

  static fromCarts(carts) {
    return carts.map(cart => CartDTO.fromCart(cart));
  }
}