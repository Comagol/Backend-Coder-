//utilidades para el manejo de products
export class ProductUtils {
  //valido datos de producto
  static validateProductData(productData) {
    const required = ['title', 'description', 'price', 'stock', 'category'];
    const missing = required.filter(field => !productData[field]);

    if (missing.length > 0) {
      throw new Error(`Faltan los siguientes campos requeridos: ${missing.join(', ')}`);
    }

    if (productData.price <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }

    if (productData.stock < 0) {
      throw new Error('El stock no puede ser negativo');
    }

    return true;
  }

  //obtener informacion basica de un producto
  static gatBasicInfo(product) {
    return {
      id: product._id,
      title: product.title,
      code: product.code,
      price: product.price,
      stock: product.stock,
      category: product.category,
      thumbnail: product.thumbnail || []
    };
  }
}