const express = require("express");
const sanPham = require("../controllers/sanpham.controller");

const router = express.Router();

router.route("/forkhachhang").get(sanPham.findForKhachHang);
router
  .route("/")
  .get(sanPham.findAll)
  .post(sanPham.create)
  .delete(sanPham.deleteAll);

router
  .route("/:id")
  .get(sanPham.findOne)
  .put(sanPham.update)
  .delete(sanPham.delete);

module.exports = router;
