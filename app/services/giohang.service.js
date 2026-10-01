const prisma = require("../../prisma/prisma.js");

class GioHangService {
  // 1. Tạo Giỏ Hàng Mới (Mã tự tăng GH0001, GH0002...)
  async create(payload, client = prisma) {
    // 1. Lấy mã khách hàng từ payload (hỗ trợ cả khachhangid lẫn khachhangid)
    const khachhangId = payload.khachhangid;

    if (!khachhangId) {
      throw new Error("KHACH_HANG_ID_INVALID");
    }

    // 2. Kiểm tra xem khách hàng này đã có giỏ hàng chưa
    const existingCart = await client.giohang.findUnique({
      where: { khachhangid: khachhangId },
    });
    if (existingCart) throw new Error("GIO_HANG_DA_TON_TAI");

    // 3. Tự động sinh mã giỏ hàng GH0001, GH0002... nếu chưa có id / id
    let cartId = payload.id || payload.id;
    if (!cartId) {
      const last = await client.giohang.findFirst({
        orderBy: { id: "desc" },
      });
      let currentNumber = 0;
      if (last && last.id) {
        const match = last.id.match(/\d+/);
        if (match) currentNumber = parseInt(match[0], 10);
      }
      cartId = `GH${String(currentNumber + 1).padStart(4, "0")}`;
    }

    // 4. Tạo bản ghi giỏ hàng
    return await client.giohang.create({
      data: {
        id: cartId,
        khachhangid: khachhangId,
      },
    });
  }
  // 2. Lấy hoặc Tự Động Tạo Mới Giỏ Hàng Khi Khách Vào Trang Web
  async getOrCreateByKhachHang(khachhangid) {
    const khachHang = await prisma.khachhang.findUnique({
      where: { id: khachhangid },
    });
    if (!khachHang) throw new Error("KHACH_HANG_KHONG_TON_TAI");

    let gioHang = await prisma.giohang.findUnique({
      where: { khachhangid: khachhangid },
      include: { khachhang: true },
    });

    // Nếu chưa có thì khởi tạo tự động
    if (!gioHang) {
      gioHang = await this.create({ khachhangid: khachhangid });
    }

    return gioHang;
  }

  // 3. Tìm Danh Sách Giỏ Hàng
  async find(filterData = {}) {
    const where = {};
    if (filterData.id) where.id = filterData.id;
    if (filterData.khachhangid) where.khachhangid = filterData.khachhangid;

    return await prisma.giohang.findMany({
      where: where,
      include: { khachhang: true },
    });
  }

  // 4. Tìm Chi Tiết Theo id
  async findById(id) {
    return await prisma.giohang.findUnique({
      where: { id: id },
      include: { khachhang: true },
    });
  }

  // 5. Xóa 1 Giỏ Hàng
  async delete(id) {
    try {
      return await prisma.giohang.delete({
        where: { id: id },
      });
    } catch (error) {
      if (error.code === "P2025") return null;
      throw error;
    }
  }

  // 6. Xóa Toàn Bộ Giỏ Hàng
  async deleteAll() {
    const result = await prisma.giohang.deleteMany({});
    return result.count;
  }
}

module.exports = GioHangService;
