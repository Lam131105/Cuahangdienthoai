const express = require("express");
const yeuThich = require("../controllers/yeuthich.controller");

const router = express.Router();

router
  .route("/")
  .get(yeuThich.findAll)
  .post(yeuThich.create)
  .delete(yeuThich.deleteAll);

// Lấy danh sách đánh giá của 1 sản phẩm cụ thể
router.get("/sanpham/:masanpham", yeuThich.findBySanPham);

router.route("/:id").get(yeuThich.findOne).delete(yeuThich.delete);

module.exports = router;
