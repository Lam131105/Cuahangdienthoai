const express = require("express");
const gioHang = require("../controllers/giohang.controller");

const router = express.Router();

router
  .route("/")
  .get(gioHang.findAll)
  .post(gioHang.create)
  .delete(gioHang.deleteAll);

// Route lấy/tạo tự động giỏ hàng theo Mã Khách Hàng
router.get("/khachhang/:makhachhang", gioHang.findByKhachHang);

router.route("/:id").get(gioHang.findOne).delete(gioHang.delete);

module.exports = router;
