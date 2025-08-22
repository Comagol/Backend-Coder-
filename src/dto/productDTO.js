
export class ProductDTO {
  constructor(product) {
    this.id = product._id;
    this.title = product.title;
    this.description = product.description;
    this.code = product.code;
    this.price = product.price;
    this.stock = product.stock;
    this.category = product.category;
    this.thumbnail = product.thumbnail || [];
  }

  // metodo estatico para crear DTO dede un documento mongoDb
  static fromProduct(product) {
    return new ProductDTO(product);
  }

  // metodo para obtener info basica de un producto
  static fromProducts(products) {
    return products.map(product => ProductDTO.fromProduct(product));
  }
}