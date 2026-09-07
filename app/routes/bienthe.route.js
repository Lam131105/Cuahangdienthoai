const express = require("express");
const bienThe = require("../controllers/bienthe.controller");

const router = express.Router();

router
  .route("/")
  .get(bienThe.findAll)
  .post(bienThe.create)
  .delete(bienThe.deleteAll);

// Route lấy tất cả biến thể của 1 Sản phẩm
router.get("/sanpham/:masanpham", bienThe.findBySanPham);
// Lấy biến thể có GIÁ RẺ NHẤT (sau khuyến mãi) của 1 Sản Phẩm
router.get("/sanpham/:masanpham/cheapest", bienThe.findCheapestBySanPham);

router
  .route("/:id")
  .get(bienThe.findOne)
  .put(bienThe.update)
  .delete(bienThe.delete);

module.exports = router;
