const express = require("express");
const phieuNhap = require("../controllers/phieunhap.controller");

const router = express.Router();

router
  .route("/")
  .get(phieuNhap.findAll)
  .post(phieuNhap.create)
  .delete(phieuNhap.deleteAll);

// Route lấy danh sách phiếu nhập theo Mã Nhà Cung Cấp
router.get("/nhacungcap/:manhacungcap", phieuNhap.findByNhaCungCap);

// Route lấy danh sách phiếu nhập do 1 Nhân Viên tạo
router.get("/nhanvien/:manhanvien", phieuNhap.findByNhanVien);

router
  .route("/:id")
  .get(phieuNhap.findOne)
  .put(phieuNhap.update)
  .delete(phieuNhap.delete);

module.exports = router;
