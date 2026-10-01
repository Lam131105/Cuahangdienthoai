const express = require("express");
const donHang = require("../controllers/donhang.controller");

const router = express.Router();

router.route("/").get(donHang.findAll).post(donHang.create);

router.route("/tongchi").post(donHang.getTongChiKhachHang);
router
  .route("/:id")
  .get(donHang.findOne)
  .put(donHang.update)
  .delete(donHang.delete);
router.route("/:id/recalculate-total").patch(donHang.recalculateTotalAmount);

router.route("/checkout").post(donHang.placeOrder);

router.route("/preview-checkout").post(donHang.previewCheckout);

module.exports = router;
