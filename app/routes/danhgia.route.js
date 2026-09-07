const express = require("express");
const danhGia = require("../controllers/danhgia.controller");

const router = express.Router();

router
  .route("/")
  .get(danhGia.findAll)
  .post(danhGia.create)
  .delete(danhGia.deleteAll);

// Lấy danh sách đánh giá của 1 sản phẩm cụ thể
router.get("/sanpham/:masanpham", danhGia.findBySanPham);

router
  .route("/:id")
  .get(danhGia.findOne)
  .put(danhGia.update)
  .delete(danhGia.delete);

module.exports = router;
