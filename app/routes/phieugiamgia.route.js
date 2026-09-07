const express = require("express");
const phieuGiamGia = require("../controllers/phieugiamgia.controller");

const router = express.Router();

router
  .route("/")
  .get(phieuGiamGia.findAll)
  .post(phieuGiamGia.create)
  .delete(phieuGiamGia.deleteAll);

// Route lấy danh sách phiếu giảm giá đang có hiệu lực (Active)
router.get("/active", phieuGiamGia.findActive);

router
  .route("/:id")
  .get(phieuGiamGia.findOne)
  .put(phieuGiamGia.update)
  .delete(phieuGiamGia.delete);

module.exports = router;
