const express = require("express");
const khachHang = require("../controllers/khachhang.controller");

const router = express.Router();

router
  .route("/")
  .get(khachHang.findAll)
  .post(khachHang.create)
  .delete(khachHang.deleteAll);

router.post("/login", khachHang.login);
// router.post("/logout", khachHang.logout);

router
  .route("/:id")
  .get(khachHang.findOne)
  .put(khachHang.update)
  .delete(khachHang.delete);

module.exports = router;
