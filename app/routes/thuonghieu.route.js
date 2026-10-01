const express = require("express");
const thuongHieu = require("../controllers/thuonghieu.controller");
const upload = require("../middlewares/thuonghieuupload");

const router = express.Router();

router
  .route("/")
  .get(thuongHieu.findAll)
  .post(upload.single("image"), thuongHieu.create)
  .delete(thuongHieu.deleteAll);

router
  .route("/:id")
  .get(thuongHieu.findOne)
  .put(upload.single("image"), thuongHieu.update)
  .delete(thuongHieu.delete);

module.exports = router;
