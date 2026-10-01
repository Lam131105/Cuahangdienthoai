import { createWebHistory, createRouter } from "vue-router";
import PhoneList from "@/views/PhoneList.vue";
import GioHang from "@/views/GioHang.vue";
import CheckOut from "@/views/CheckOut.vue";
import ThuongHieuAdmin from "@/views/ThuongHieuAdmin.vue";
import ThuongHieuAdd from "@/views/ThuongHieuAdd.vue";
import ThuongHieuEdit from "@/views/ThuongHieuEdit.vue";
import TheLoaiAdmin from "@/views/TheLoaiAdmin.vue";
import TheLoaiAdd from "@/views/TheLoaiAdd.vue";
import TheLoaiEdit from "@/views/TheLoaiEdit.vue";
import NhaCungCapAdmin from "@/views/NhaCungCapAdmin.vue";
import NhaCungCapEdit from "@/views/NhaCungCapEdit.vue";
import NhaCungCapAdd from "@/views/NhaCungCapAdd.vue";
import RamAdmin from "@/views/RamAdmin.vue";
import RamAdd from "@/views/RamAdd.vue";
import RamEdit from "@/views/RamEdit.vue";
import RomAdmin from "@/views/RomAdmin.vue";
import RomAdd from "@/views/RomAdd.vue";
import RomEdit from "@/views/RomEdit.vue";
import MauSacAdmin from "@/views/MauSacAdmin.vue";
import MauSacAdd from "@/views/MauSacAdd.vue";
import MauSacEdit from "@/views/MauSacEdit.vue";
import NhanVienAdmin from "@/views/NhanVienAdmin.vue";
import NhanVienAdd from "@/views/NhanVienAdd.vue";
import NhanVienEdit from "@/views/NhanVienEdit.vue";
import KhachHangAdmin from "@/views/KhachHangAdmin.vue";
import PhieuGiamGia from "@/views/Voucher.vue";
import PhieuGiamGiaAdmin from "@/views/PhieuGiamGiaAdmin.vue";
import PhieuGiamGiaAdd from "@/views/PhieuGiamGiaAdd.vue";
import PhieuGiamGiaEdit from "@/views/PhieuGiamGiaEdit.vue";
import DieuKienNhanVoucherAdmin from "@/views/DieuKienNhanVoucherAdmin.vue";
import DieuKienNhanVoucherAdd from "@/views/DieuKienNhanVoucherAdd.vue";
import DieuKienNhanVoucherEdit from "@/views/DieuKienNhanVoucherEdit.vue";
import DiaChiAdd from "@/views/DiaChiAdd.vue";
import DiaChi from "@/views/DiaChi.vue";

import DangKi from "@/views/DangKi.vue";
import DangNhap from "@/views/DangNhap.vue";
import ThongTinTaiKhoan from "@/views/ThongTinTaiKhoan.vue";

import DotKhuyenMaiAdmin from "@/views/DotKhuyenMaiAdmin.vue";
import DotKhuyenMaiAdd from "@/views/DotKhuyenMaiAdd.vue";
import DotKhuyenMaiEdit from "@/views/DotKhuyenMaiEdit.vue";

const routes = [
  {
    path: "/",
    name: "phone.list",
    component: PhoneList,
  },

  {
    path: "/giohang",
    name: "giohang",
    component: GioHang,
  },

  {
    path: "/checkout",
    name: "checkout",
    component: CheckOut,
  },

  {
    path: "/sanpham/:id",
    name: "ChiTietSanPham",
    component: () => import("@/views/ChiTietSanPham.vue"),
  },

  {
    path: "/dangki",
    name: "dangki",
    component: DangKi,
  },

  {
    path: "/dangnhap",
    name: "dangnhap", //
    component: DangNhap,
  },

  {
    path: "/thongtintaikhoan",
    name: "thongtintaikhoan",
    component: ThongTinTaiKhoan,
  },

  {
    path: "/admin/thuonghieu",
    name: "admin.thuonghieu",
    component: ThuongHieuAdmin,
  },

  {
    path: "/admin/thuonghieu/add",
    name: "admin.thuonghieu.add",
    component: ThuongHieuAdd,
  },
  {
    path: "/admin/thuonghieu/edit/:id",
    name: "admin.thuonghieu.edit",
    component: ThuongHieuEdit,
    props: true, // Cho phép truyền tham số :id thành props
  },

  {
    path: "/admin/theloai",
    name: "admin.theloai",
    component: TheLoaiAdmin,
  },

  {
    path: "/admin/theloai/add",
    name: "admin.theloai.add",
    component: TheLoaiAdd,
  },
  {
    path: "/admin/theloai/edit/:id",
    name: "admin.theloai.edit",
    component: TheLoaiEdit,
    props: true, // Cho phép truyền tham số :id thành props
  },

  {
    path: "/admin/nhacungcap",
    name: "admin.nhacungcap",
    component: NhaCungCapAdmin,
  },

  {
    path: "/admin/nhacungcap/add",
    name: "admin.nhacungcap.add",
    component: NhaCungCapAdd,
  },
  {
    path: "/admin/nhacungcap/edit/:id",
    name: "admin.nhacungcap.edit",
    component: NhaCungCapEdit,
    props: true, // Cho phép truyền tham số :id thành props
  },
  {
    path: "/admin/ram",
    name: "admin.ram",
    component: RamAdmin,
  },

  {
    path: "/admin/ram/add",
    name: "admin.ram.add",
    component: RamAdd,
  },
  {
    path: "/admin/ram/edit/:id",
    name: "admin.ram.edit",
    component: RamEdit,
    props: true, // Cho phép truyền tham số :id thành props
  },

  {
    path: "/admin/rom",
    name: "admin.rom",
    component: RomAdmin,
  },

  {
    path: "/admin/rom/add",
    name: "admin.rom.add",
    component: RomAdd,
  },
  {
    path: "/admin/rom/edit/:id",
    name: "admin.rom.edit",
    component: RomEdit,
    props: true, // Cho phép truyền tham số :id thành props
  },

  {
    path: "/admin/mausac",
    name: "admin.mausac",
    component: MauSacAdmin,
  },

  {
    path: "/admin/mausac/add",
    name: "admin.mausac.add",
    component: MauSacAdd,
  },
  {
    path: "/admin/mausac/edit/:id",
    name: "admin.mausac.edit",
    component: MauSacEdit,
    props: true, // Cho phép truyền tham số :id thành props
  },

  {
    path: "/admin/nhanvien",
    name: "admin.nhanvien",
    component: NhanVienAdmin,
  },

  {
    path: "/admin/nhanvien/add",
    name: "admin.nhanvien.add",
    component: NhanVienAdd,
  },
  {
    path: "/admin/nhanvien/edit/:id",
    name: "admin.nhanvien.edit",
    component: NhanVienEdit,
    props: true, // Cho phép truyền tham số :id thành props
  },

  {
    path: "/admin/khachhang",
    name: "admin.khachhang",
    component: KhachHangAdmin,
  },

  {
    path: "/phieugiamgia/:id",
    name: "phieugiamgia",
    component: PhieuGiamGia,
    props: true, // Cho phép truyền tham số :id thành props
  },

  {
    path: "/admin/phieugiamgia",
    name: "admin.phieugiamgia",
    component: PhieuGiamGiaAdmin,
  },

  {
    path: "/admin/phieugiamgia/add",
    name: "admin.phieugiamgia.add",
    component: PhieuGiamGiaAdd,
  },
  {
    path: "/admin/phieugiamgia/edit/:id",
    name: "admin.phieugiamgia.edit",
    component: PhieuGiamGiaEdit,
    props: true, // Cho phép truyền tham số :id thành props
  },

  {
    path: "/admin/dieukiennhanvoucher",
    name: "admin.dieukiennhanvoucher",
    component: DieuKienNhanVoucherAdmin,
  },

  {
    path: "/admin/dieukiennhanvoucher/add",
    name: "admin.dieukiennhanvoucher.add",
    component: DieuKienNhanVoucherAdd,
  },
  {
    path: "/admin/dieukiennhanvoucher/edit/:id",
    name: "admin.dieukiennhanvoucher.edit",
    component: DieuKienNhanVoucherEdit,
    props: true, // Cho phép truyền tham số :id thành props
  },

  {
    path: "/diachi/add",
    name: "diachi.add",
    component: DiaChiAdd,
  },
  {
    path: "/diachi",
    name: "diachi",
    component: DiaChi,
  },

  {
    path: "/admin/sanpham",
    name: "sanpham",
    component: () => import("@/views/SanPhamAdmin.vue"),
  },
  {
    path: "/admin/sanpham/add",
    name: "sanpham.add",
    component: () => import("@/views/SanPhamAdd.vue"),
  },
  {
    path: "/admin/sanpham/edit/:id",
    name: "sanpham.edit",
    component: () => import("@/views/SanPhamEdit.vue"),
    props: true,
  },

  {
    path: "/admin/sanpham/:id",
    name: "SanPhamDetail",
    component: () => import("@/views/SanPhamAdminDetail.vue"),
  },

  {
    path: "/admin/phieunhap",
    name: "phieunhap",
    component: () => import("@/views/PhieuNhapAdmin.vue"),
  },
  {
    path: "/admin/phieunhap/add",
    name: "phieunhap.add",
    component: () => import("@/views/PhieuNhapAdd.vue"),
  },
  {
    path: "/admin/phieunhap/edit/:id",
    name: "phieunhap.edit",
    component: () => import("@/views/PhieuNhapEdit.vue"),
    props: true,
  },
  {
    path: "/admin/phieunhap/:maphieunhap/chitiet",
    name: "chitietnhap",
    component: () => import("@/views/PhieuNhapAdminDetail.vue"),
    props: true,
  },

  {
    path: "/admin/dotkhuyen-mai",
    name: "dotkhuyenmai",
    component: DotKhuyenMaiAdmin,
  },
  {
    path: "/admin/dotkhuyenmai/add",
    name: "dotkhuyenmai.add",
    component: DotKhuyenMaiAdd,
  },
  {
    path: "/admin/dotkhuyenmai/edit/:id",
    name: "dotkhuyenmai.edit",
    component: DotKhuyenMaiEdit,
    props: true,
  },

  {
    path: "/admin/dotkhuyenmai/:id/chitiet",
    name: "chitietdotkhuyenmai",
    component: () => import("@/views/DotKhuyenMaiAdminDetail.vue"),
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
