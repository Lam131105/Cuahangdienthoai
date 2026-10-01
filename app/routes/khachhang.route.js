const express = require("express");
const khachHang = require("../controllers/khachhang.controller");
const upload = require("../middlewares/khachhangupload");

const router = express.Router();

router
  .route("/")
  .get(khachHang.findAll)
  .post(khachHang.create)
  .delete(khachHang.deleteAll);

router.post("/login", khachHang.login);

router.post("/google-login", khachHang.googleLogin);
router.post("/facebook-login", khachHang.loginWithFacebook);

router
  .route("/:id")
  .get(khachHang.findOne)
  .put(upload.single("image"), khachHang.update)
  .delete(khachHang.delete);

module.exports = router;
