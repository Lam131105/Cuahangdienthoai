const express = require("express");
const chiTietGioHang = require("../controllers/chitietgiohang.controller");

const router = express.Router();

router
  .route("/")
  .get(chiTietGioHang.findAll)
  .post(chiTietGioHang.create)
  .delete(chiTietGioHang.deleteAll);

// Route lấy toàn bộ sản phẩm theo mã giỏ hàng
router.get("/khachhang/:khachhangid", chiTietGioHang.findByKhachHang);

router
  .route("/:id")
  .get(chiTietGioHang.findOne)
  .put(chiTietGioHang.update)
  .delete(chiTietGioHang.delete);

module.exports = router;
