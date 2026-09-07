const express = require("express");
const thongBao = require("../controllers/thongbao.controller");

const router = express.Router();

router
  .route("/")
  .get(thongBao.findAll)
  .post(thongBao.create)
  .delete(thongBao.deleteAll);

// Route lấy tất cả thông báo của 1 khách hàng cụ thể
router.get("/khachhang/:makhachhang", thongBao.findByKhachHang);

router
  .route("/:id")
  .get(thongBao.findOne)
  .put(thongBao.update)
  .delete(thongBao.delete);

module.exports = router;
