const express = require("express");
const thongSoKyThuat = require("../controllers/thongsokythuat.controller");

const router = express.Router();

router
  .route("/")
  .get(thongSoKyThuat.findAll)
  .post(thongSoKyThuat.create)
  .delete(thongSoKyThuat.deleteAll);

// Route lấy/cập nhật thông số kỹ thuật theo Mã Sản Phẩm
router
  .route("/sanpham/:masanpham")
  .get(thongSoKyThuat.findBySanPham)
  .put(thongSoKyThuat.updateBySanPham);

router
  .route("/:id")
  .get(thongSoKyThuat.findOne)
  .put(thongSoKyThuat.update)
  .delete(thongSoKyThuat.delete);

module.exports = router;
