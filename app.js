const express = require("express");
const cors = require("cors");

// Import các route API (Tách riêng ở thư mục routes)
const theLoaiRouter = require("./app/routes/theloai.route");
const thuongHieuRouter = require("./app/routes/thuonghieu.route");
const sanPhamRouter = require("./app/routes/sanpham.route");
const anhSanPhamRouter = require("./app/routes/anhsanpham.route");
const thongSoKyThuatRouter = require("./app/routes/thongsokythuat.route");
const mauSacRouter = require("./app/routes/mausac.route");
const ramRouter = require("./app/routes/ram.route");
const romRouter = require("./app/routes/rom.route");
const bienTheRouter = require("./app/routes/bienthe.route");
const nhaCungCapRouter = require("./app/routes/nhacungcap.route");
const vaiTroRouter = require("./app/routes/vaitro.route");
const diaChiRouter = require("./app/routes/diachi.route");
const khachHangRouter = require("./app/routes/khachhang.route");
const nhanVienRouter = require("./app/routes/nhanvien.route");
const thongBaoRouter = require("./app/routes/thongbao.route");
const dotKhuyenMaiRouter = require("./app/routes/dotkhuyenmai.route");
const chiTietDotKhuyenMaiRouter = require("./app/routes/chitietdotkhuyenmai.route");
const danhGiaRouter = require("./app/routes/danhgia.route");
const yeuThichRouter = require("./app/routes/yeuthich.route");
const phieuGiamGiaRouter = require("./app/routes/phieugiamgia.route");
const dieuKienNhanVoucherRouter = require("./app/routes/dieukiennhanvoucher.route");
const viVoucherRouter = require("./app/routes/vivoucher.route");
const phieuNhapRouter = require("./app/routes/phieunhap.route");
const chiTietNhapRouter = require("./app/routes/chitietnhap.route");
const gioHangRouter = require("./app/routes/giohang.route");
const chiTietGioHangRouter = require("./app/routes/chitietgiohang.route");
const donHangRouter = require("./app/routes/donhang.route");
const chiTietDonHangRouter = require("./app/routes/chitietdonhang.route");

const app = express();

app.use(cors());
app.use(express.json());

// Route kiểm tra server
app.get("/", (req, res) => {
  res.json({ message: "Welcome to SmartPhone Store API!" });
});

// Đăng ký danh sách các API Route riêng
app.use("/api/theloai", theLoaiRouter);
app.use("/api/thuonghieu", thuongHieuRouter);
app.use("/api/sanpham", sanPhamRouter);
app.use("/api/mausac", mauSacRouter);
app.use("/api/ram", ramRouter);
app.use("/api/rom", romRouter);
app.use("/api/bienthe", bienTheRouter);
app.use("/api/anhsanpham", anhSanPhamRouter);
app.use("/api/thongsokithuat", thongSoKyThuatRouter);
app.use("/api/nhacungcap", nhaCungCapRouter);
app.use("/api/vaitro", vaiTroRouter);
app.use("/api/diachi", diaChiRouter);
app.use("/api/khachhang", khachHangRouter);
app.use("/api/nhanvien", nhanVienRouter);
app.use("/api/thongbao", thongBaoRouter);
app.use("/api/dotkhuyenmai", dotKhuyenMaiRouter);
app.use("/api/chitietdotkhuyenmai", chiTietDotKhuyenMaiRouter);
app.use("/api/danhgia", danhGiaRouter);
app.use("/api/yeuthich", yeuThichRouter);
app.use("/api/phieugiamgia", phieuGiamGiaRouter);
app.use("/api/dieukiennhanvoucher", dieuKienNhanVoucherRouter);
app.use("/api/vivoucher", viVoucherRouter);
app.use("/api/phieunhap", phieuNhapRouter);
app.use("/api/chitietnhap", chiTietNhapRouter);
app.use("/api/giohang", gioHangRouter);
app.use("/api/chitietgiohang", chiTietGioHangRouter);
app.use("/api/donhang", donHangRouter);
app.use("/api/chitietdonhang", chiTietDonHangRouter);
app.use("/uploads", express.static("public/uploads"));

// Middleware xử lý lỗi 404 (Không tìm thấy route)
// Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});
module.exports = app;
