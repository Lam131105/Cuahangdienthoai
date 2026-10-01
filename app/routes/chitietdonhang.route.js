const express = require("express");
const chiTietDonHang = require("../controllers/chitietdonhang.controller");

const router = express.Router();

router.route("/").get(chiTietDonHang.findAll).post(chiTietDonHang.createMany);

// Lấy danh sách các chi tiết đơn hàng thuộc 1 đơn hàng
router.route("/donhang/:donhangid").get(chiTietDonHang.findByDonHangId);

// Lấy chi tiết / Xóa chi tiết đơn hàng theo ID
router.route("/:id").get(chiTietDonHang.findOne).delete(chiTietDonHang.delete);

module.exports = router;
