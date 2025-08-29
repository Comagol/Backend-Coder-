import { Router } from "express";
import { uploader } from "../utils/multerUtil.js";
import { requireAdmin, requireUser } from "../middlewares/auth.js";
import { ProductRepository } from "../repositories/index.js";

const router = Router();
const productRepository = new ProductRepository();

// getl all products es una ruta publica
router.get("/", async (req, res) => {
  try {
    const result = await productRepository.getAllProducts(req.query);
    res.json({
      status: "success",
      payload: result
    });
  } catch (error) {
    console.error("Error obteniendo productos:", error);
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor al obtener productos",
    });
  }
});

// get product by id es una ruta publica
router.get("/:pid", async (req, res) => {
    try {
      const result = await productRepository.getProductById(req.params.pid);
      res.json({
        status: "success",
        payload: result,
      });
    } catch (error) {
      console.error("Error obteniendo producto:", error);
      res.status(404).json({
        status: "error",
        message: "Producto no encontrado",
      });
    }
  });

  router.post("/", uploader.array("thumbnails", 3), requireAdmin, async (req, res) => {
    try {
      if (req.files) {
        req.body.thumbnails = [];
        req.files.forEach((file) => {
          req.body.thumbnails.push(file.path);
        });
      }
  
      const result = await productRepository.createProduct(req.body);
      res.status(201).json({
        status: "success",
        message: "Producto creado correctamente",
        payload: result,
      });
    } catch (error) {
      console.error("Error creando producto:", error);
      res.status(400).json({
        status: "error",
        message: error.message || "Error interno del servidor al crear producto",
      });
    }
  });

// PUT /api/products/:pid - Actualizar producto (SOLO ADMIN)
router.put("/:pid", uploader.array("thumbnails", 3), requireAdmin, async (req, res) => {
  try {
    if (req.files) {
      req.body.thumbnails = [];
      req.files.forEach((file) => {
        req.body.thumbnails.push(file.filename);
      });
    }

    const result = await productRepository.updateProduct(req.params.pid, req.body);
    
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
    res.status(400).json({
      status: "error",
      message: error.message || "Error interno del servidor al actualizar producto",
    });
  }
});

// DELETE /api/products/:pid - Eliminar producto (SOLO ADMIN)
router.delete("/:pid", requireAdmin, async (req, res) => {
  try {
    const result = await productRepository.deleteProduct(req.params.pid);
    res.json({
      status: "success",
      message: "Producto eliminado correctamente",
      payload: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    console.error("Error eliminando producto:", error);
    res.status(404).json({
      status: "error",
      message: error.message || "Producto no encontrado",
    });
  }
});

export default router;
