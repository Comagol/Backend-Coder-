import { BaseRepository } from './baseRepository.js';
import { productDBManager } from '../dao/productDBManager.js';
import { ProductDTO } from '../dto/productDTO.js';
import { ProductUtils } from '../utils/productUtils.js';

// Extiendo la clase base para crear el repositorio de productos
export class ProductRepository extends BaseRepository {
  constructor() {
    super(new productDBManager());
}

// Metodo para obtener todos los productos
async getAllProducts(params) {
    const result = await this.dao.getAllProducts(params);
    return {
        ...result,
        docs: ProductDTO.fromProducts(result.docs)
    };
}

// Metodo para obtener un producto por su id
async getProductById(id) {
    const product = await this.dao.getProductByID(id);
    return ProductDTO.fromProduct(product);
}

// Metodo para crear un producto
async createProduct(productData) {
    // Valido datos antes de crear
    ProductUtils.validateProductData(productData);
    
    const product = await this.dao.createProduct(productData);
    return ProductDTO.fromProduct(product);
}

// Metodo para actualizar un producto
async updateProduct(id, productData) {
    // Valido datos si se proporcionan
    if (Object.keys(productData).length > 0) {
        ProductUtils.validateProductData(productData);
    }
    
    const result = await this.dao.updateProduct(id, productData);
    return result;
}

// Metodo para eliminar un producto
async deleteProduct(id) {
    const result = await this.dao.deleteProduct(id);
    return result;
}
}