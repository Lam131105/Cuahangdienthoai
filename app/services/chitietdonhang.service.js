const prisma = require("../../prisma/prisma.js");
const BienTheService = require("./bienthe.service"); // Import service Biến thể của bạn

class ChiTietDonHangService {
  constructor() {
    this.bienTheService = new BienTheService();
  }

  async createMany(payload, tx = prisma) {
    const { donhangid, items } = payload;
    // items có dạng: [{ bientheid: "BT0001", soluong: 2 }, { bientheid: "BT0002", soluong: 1 }]

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("DANH_SACH_SAN_PHAM_RONG");
    }

    // 1. Kiểm tra Đơn hàng có tồn tại không
    const donhang = await tx.donhang.findUnique({
      where: { id: donhangid },
    });
    if (!donhang) {
      throw new Error("DON_HANG_KHONG_TON_TAI");
    }

    // 2. Kiểm tra Giỏ hàng của khách
    const gioHang = await tx.giohang.findFirst({
      where: { khachhangid: donhang.khachhangid },
    });
    if (!gioHang) {
      throw new Error("GIO_HANG_KHONG_TON_TAI");
    }

    let tongTienBoSung = 0;
    const createdDetails = [];

    // Lấy ID chi tiết đơn hàng cuối cùng để tạo mã tự động tăng
    const lastCTDH = await tx.chitietdonhang.findFirst({
      orderBy: { id: "desc" },
    });
    let currentNumber = lastCTDH
      ? parseInt(lastCTDH.id.replace(/\D/g, ""), 10) || 0
      : 0;

    for (const item of items) {
      const { bientheid, soluong } = item;

      // Validation 1: Lấy thông tin biến thể
      const bienTheData = await this.bienTheService.findById(bientheid);
      if (!bienTheData) {
        throw new Error(`BIEN_THE_KHONG_TON_TAI_${bientheid}`);
      }

      // Validation 2: Kiểm tra tồn tại trong giỏ hàng
      const chiTietGioHang = await tx.chitietgiohang.findFirst({
        where: {
          giohangid: gioHang.id,
          bientheid: bientheid,
        },
      });
      if (!chiTietGioHang) {
        throw new Error(`SAN_PHAM_KHONG_CO_TRONG_GIO_HANG_${bientheid}`);
      }

      // Validation 3: Số lượng khớp giỏ hàng
      if (chiTietGioHang.soluong !== soluong) {
        throw new Error(`SO_LUONG_KHONG_KHOP_VOI_GIO_HANG_${bientheid}`);
      }

      // Validation 4: Kiểm tra tồn kho
      if (bienTheData.soluong < soluong) {
        throw new Error(`SO_LUONG_TON_KHO_KHONG_DU_${bientheid}`);
      }

      // --- TIẾN HÀNH THỰC THI THÊM/SỬA/XÓA ---
      currentNumber++;
      const newCTDHId = `CTDH${String(currentNumber).padStart(4, "0")}`;
      const giaLucMua = bienTheData.giasaugiam;
      const thanhTien = Number(giaLucMua) * soluong;
      tongTienBoSung += thanhTien;

      // 3.1 Tạo Chi tiết đơn hàng
      const newChiTiet = await tx.chitietdonhang.create({
        data: {
          id: newCTDHId,
          donhangid: donhangid,
          bientheid: bientheid,
          soluong: soluong,
          gialucmua: giaLucMua,
        },
      });

      // 3.2 Trừ kho
      await tx.bienthe.update({
        where: { id: bientheid },
        data: { soluong: { decrement: soluong } },
      });

      // 3.3 Xóa khỏi giỏ hàng
      await tx.chitietgiohang.delete({
        where: { id: chiTietGioHang.id },
      });

      createdDetails.push(newChiTiet);
    }

    // 3.4 Cập nhật tổng tiền duy nhất 1 lần cho Đơn hàng
    await tx.donhang.update({
      where: { id: donhangid },
      data: { tongtien: { increment: tongTienBoSung } },
    });

    return createdDetails;
  }

  // 1. Lấy tất cả chi tiết đơn hàng
  async findAll() {
    return await prisma.chitietdonhang.findMany({
      include: {
        donhang: true,
        bienthe: {
          include: {
            sanpham: true,
            ram: true,
            rom: true,
            mausac: true,
          },
        },
      },
    });
  }

  // 2. Lấy 1 chi tiết đơn hàng theo ID
  async findOne(id) {
    return await prisma.chitietdonhang.findUnique({
      where: { id: id },
      include: {
        donhang: true,
        bienthe: {
          include: {
            sanpham: true,
            ram: true,
            rom: true,
            mausac: true,
          },
        },
      },
    });
  }

  // 3. Lấy tất cả chi tiết đơn hàng thuộc về 1 Đơn hàng
  async findByDonHangId(donhangid) {
    return await prisma.chitietdonhang.findMany({
      where: { donhangid: donhangid },
      include: {
        bienthe: {
          include: {
            sanpham: true,
            ram: true,
            rom: true,
            mausac: true,
          },
        },
      },
    });
  }

  // 4. Xóa 1 chi tiết đơn hàng (Cộng lại tồn kho & trừ tổng tiền Đơn hàng)
  async delete(id) {
    const chiTiet = await prisma.chitietdonhang.findUnique({
      where: { id: id },
    });

    if (!chiTiet) {
      return null;
    }

    return await prisma.$transaction(async (tx) => {
      // 4.1 Hoàn lại số lượng tồn kho cho Biến thể
      await tx.bienthe.update({
        where: { id: chiTiet.bientheid },
        data: {
          soluong: { increment: chiTiet.soluong },
        },
      });

      // 4.2 Trừ tiền tổng của Đơn hàng tương ứng
      const thanhTienGiam = Number(chiTiet.gialucmua) * chiTiet.soluong;
      await tx.donhang.update({
        where: { id: chiTiet.donhangid },
        data: {
          tongtien: { decrement: thanhTienGiam },
        },
      });

      // 4.3 Xóa dòng Chi tiết đơn hàng
      return await tx.chitietdonhang.delete({
        where: { id: id },
      });
    });
  }
}

module.exports = ChiTietDonHangService;
