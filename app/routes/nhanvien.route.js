const express = require("express");
const nhanVien = require("../controllers/nhanvien.controller");

const router = express.Router();

router
  .route("/")
  .get(nhanVien.findAll)
  .post(nhanVien.create)
  .delete(nhanVien.deleteAll);

router.post("/login", nhanVien.login);
router
  .route("/:id")
  .get(nhanVien.findOne)
  .put(nhanVien.update)
  .delete(nhanVien.delete);

module.exports = router;
