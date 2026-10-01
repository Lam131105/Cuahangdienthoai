const express = require("express");
const chiTietNhap = require("../controllers/chitietnhap.controller");

const router = express.Router();

router.route("/").get(chiTietNhap.findAll).post(chiTietNhap.create);

// Route lấy toàn bộ chi tiết nhập của 1 Phiếu Nhập
router.get("/phieunhap/:maphieunhap", chiTietNhap.findByPhieuNhap);

router
  .route("/:id")
  .get(chiTietNhap.findOne)
  .put(chiTietNhap.update)
  .delete(chiTietNhap.delete);

module.exports = router;
