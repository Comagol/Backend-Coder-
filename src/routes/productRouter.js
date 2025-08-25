import { Router } from "express";
import { productDBManager } from "../dao/productDBManager.js";
import { uploader } from "../utils/multerUtil.js";
import { ProductDTO } from "../dao/dto/productDTO.js";
import { ProductUtils } from "../utils/productUtils.js";
import { requireAdmin, requireUser } from "../middlewares/auth.js";

const router = Router();
const ProductService = new productDBManager();

// getl all products es una ruta publica
router.get("/", async (req, res) => {
  try {
    const result = await ProductService.getAllProducts(req.query);
    const productDTO = ProductDTO.fromProduct(result.docs);
    res.json({
      status: "success",
      payload: {
        docs: productDTO,
        totalDocs: result.totalDocs,
        limit: result.limit,
        totalPages: result.totalPages,
        page: result.page,
        pagingCounter: result.pagingCounter,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        prevLink: result.prevLink,
        nextLink: result.nextLink,
      },
    });
  } catch (error) {
    console.error("Error obteniendo productos:", error);
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor al obtener productos",
    });
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const result = await ProductService.getProductByID(req.params.pid);
    const productDTO = ProductDTO.fromProduct(result);
    res.json({
      status: "success",
      payload: productDTO,
    });
  } catch (error) {
    console.error("Error obteniendo producto:", error);
    res.status(404).json({
      status: "error",
      message: "Producto no encontrado",
    });
  }
});

router.post(
  "/",
  uploader.array("thumbnails", 3),
  requireAdmin,
  async (req, res) => {
    try {
      if (req.files) {
        req.body.thumbnails = [];
        req.files.forEach((file) => {
          req.body.thumbnails.push(file.path);
        });
      }

      // Validar datos con ProductUtils
      try {
        ProductUtils.validateProductData(req.body);
      } catch (validationError) {
        return res.status(400).json({
          status: "error",
          message: validationError.message,
        });
      }

      const result = await ProductService.createProduct(req.body);
      // Uso ProductDTO para la respuesta
      const productDTO = ProductDTO.fromProduct(result);

      res.status(201).json({
        status: "success",
        message: "Producto creado correctamente",
        payload: productDTO,
      });
    } catch (error) {
      console.error("Error creando producto:", error);
      res.status(500).json({
        status: "error",
        message: "Error interno del servidor al crear producto",
      });
    }
  }
);

// PUT /api/products/:pid - Actualizar producto (SOLO ADMIN)
router.put(
  "/:pid",
  requireAdmin,
  uploader.array("thumbnails", 3),
  async (req, res) => {
    try {
      // Procesar archivos subidos
      if (req.files) {
        req.body.thumbnails = [];
        req.files.forEach((file) => {
          req.body.thumbnails.push(file.filename);
        });
      }

      // Validar datos si se proporcionan
      if (Object.keys(req.body).length > 0) {
        try {
          ProductUtils.validateProductData(req.body);
        } catch (validationError) {
          return res.status(400).json({
            status: "error",
            message: validationError.message,
          });
        }
      }

      const result = await ProductService.updateProduct(
        req.params.pid,
        req.body
      );

      if (result.modifiedCount === 0) {
        return res.status(404).json({
          status: "error",
          message: "Producto no encontrado",
        });
      }

      res.json({
        status: "success",
        message: "Producto actualizado correctamente",
        payload: { modifiedCount: result.modifiedCount },
      });
    } catch (error) {
      console.error("Error actualizando producto:", error);
      res.status(500).json({
        status: "error",
        message: "Error interno del servidor al actualizar producto",
      });
    }
  }
);

router.delete("/:pid", requireAdmin, async (req, res) => {
  try {
    const result = await ProductService.deleteProduct(req.params.pid);
    res.json({
      status: "success",
      message: "Producto eliminado correctamente",
      payload: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    console.error("Error eliminando producto:", error);
    res.status(404).json({
      status: "error",
      message: "Producto no encontrado",
    });
  }
});

export default router;
