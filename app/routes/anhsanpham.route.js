const express = require("express");
const anhSanPham = require("../controllers/anhsanpham.controller");
const upload = require("../middlewares/sanphamupload");

const router = express.Router();

router
  .route("/")
  .get(anhSanPham.findAll)
  .post(upload.single("image"), anhSanPham.create)
  .delete(anhSanPham.deleteAll);
router.route("/Sanpham/:masanpham").get(anhSanPham.findBySanPham);
router
  .route("/:id")
  .get(anhSanPham.findOne)
  .put(upload.single("image"), anhSanPham.update)
  .delete(anhSanPham.delete);

module.exports = router;
