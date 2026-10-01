const express = require("express");
const phieuGiamGia = require("../controllers/phieugiamgia.controller");
const upload = require("../middlewares/phieugiamgiaupload");

const router = express.Router();

router
  .route("/")
  .get(phieuGiamGia.findAll)
  .post(upload.single("image"), phieuGiamGia.create)
  .delete(phieuGiamGia.deleteAll);

router
  .route("/:id")
  .get(phieuGiamGia.findOne)
  .put(upload.single("image"), phieuGiamGia.update)
  .delete(phieuGiamGia.delete);

module.exports = router;
