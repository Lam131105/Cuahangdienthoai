const express = require("express");
const viVoucher = require("../controllers/vivoucher.controller");

const router = express.Router();

router
  .route("/")
  .get(viVoucher.findAll)
  .post(viVoucher.create)
  .delete(viVoucher.deleteAll);

// Route lấy danh sách Voucher của 1 Khách hàng cụ thể
router.get("/khachhang/:makhachhang", viVoucher.findByKhachHang);

//Tặng voucher tự động khi nhân viên duyệt đơn hàng

router.post(
  "/reward-on-purchase/:makhachhang/:tongchi/:sotientronghoadonnay",
  viVoucher.rewardOnPurchase,
);

// Route cập nhật trạng thái voucher sang "Đã dùng"
router.patch("/:id/use", viVoucher.useVoucher);

router
  .route("/:id")
  .get(viVoucher.findOne)
  .put(viVoucher.update)
  .delete(viVoucher.delete);

module.exports = router;
