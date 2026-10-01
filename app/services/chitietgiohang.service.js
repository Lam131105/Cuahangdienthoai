const prisma = require("../../prisma/prisma.js");
const BienTheService = require("./bienthe.service");

class ChiTietGioHangService {
  constructor() {
    this.bienTheService = new BienTheService();
  }
  // 1. Thêm vào giỏ hàng (Tự dồn số lượng nếu đã tồn tại)
  async create(payload) {
    const { giohangid, bientheid, soluong } = payload;
    const addQuantity = soluong || 1;

    // A. Kiểm tra tồn tại Giỏ hàng & Biến thể
    const gioHang = await prisma.giohang.findUnique({
      where: { id: giohangid },
    });
    if (!gioHang) throw new Error("GIO_HANG_KHONG_TON_TAI");

    const bienThe = await prisma.bienthe.findUnique({
      where: { id: bientheid },
    });
    if (!bienThe) throw new Error("BIEN_THE_KHONG_TON_TAI");

    // B. Kiểm tra cặp (giohangid + bientheid) đã tồn tại trong DB chưa
    const existingDetail = await prisma.chitietgiohang.findFirst({
      where: {
        giohangid: giohangid,
        bientheid: bientheid,
      },
    });

    // C1. Nếu ĐÃ TỒN TẠI -> Cộng dồn số lượng

    if (existingDetail) {
      let realQuantity = existingDetail.soluong + addQuantity;
      if (realQuantity > bienThe.soluong) {
        realQuantity = bienThe.soluong;
      }
      return await prisma.chitietgiohang.update({
        where: { id: existingDetail.id },
        data: {
          soluong: realQuantity,
        },
        include: {
          bienthe: {
            include: {
              sanpham: true, // Kèm theo thông tin sản phẩm để hiển thị ở FE
            },
          },
        },
      });
    }

    // C2. Nếu CHƯA TỒN TẠI -> Tự động sinh mã CTGH0001, CTGH0002... và tạo mới
    let detailId = payload.id;
    if (!detailId) {
      const last = await prisma.chitietgiohang.findFirst({
        orderBy: { id: "desc" },
      });
      let currentNumber = 0;
      if (last && last.id) {
        const match = last.id.match(/\d+/);
        if (match) currentNumber = parseInt(match[0], 10);
      }
      detailId = `CTGH${String(currentNumber + 1).padStart(4, "0")}`;
    }

    return await prisma.chitietgiohang.create({
      data: {
        id: detailId,
        giohangid: giohangid,
        bientheid: bientheid,
        soluong: addQuantity,
      },
      include: {
        bienthe: {
          include: {
            sanpham: true,
          },
        },
      },
    });
  }

  // 2. Lấy danh sách sản phẩm trong giỏ hàng
  // 2. Lấy danh sách sản phẩm trong giỏ hàng (kèm thông tin giá sau giảm từ BienTheService)
  async findByKhachHang(khachhangid) {
    // 2.1 Lấy toàn bộ bản ghi chi tiết giỏ hàng theo giohangid
    const GioHang = await prisma.giohang.findUnique({
      where: { khachhangid: khachhangid },
    });
    const chiTietGioHangs = await prisma.chitietgiohang.findMany({
      where: { giohangid: GioHang.id },
    });

    if (!chiTietGioHangs || chiTietGioHangs.length === 0) {
      return [];
    }

    // 2.2 Lặp qua từng phần tử và gọi bienTheService.findById để lấy đầy đủ giá sau giảm & thuộc tính
    const result = await Promise.all(
      chiTietGioHangs.map(async (item) => {
        const bienTheDetail = await this.bienTheService.findById(
          item.bientheid,
        );

        return {
          id: item.id,
          giohangid: item.giohangid,
          bientheid: item.bientheid,
          soluong: item.soluong,
          // Đè toàn bộ object bienthe đã được tính toán khuyến mãi vào đây
          bienthe: bienTheDetail,
        };
      }),
    );

    return result;
  }

  // 3. Cập nhật số lượng trực tiếp
  async update(id, soluong) {
    return await prisma.chitietgiohang.update({
      where: { id: id },
      data: { soluong: parseInt(soluong, 10) },
      include: {
        bienthe: {
          include: {
            sanpham: true,
          },
        },
      },
    });
  }

  // 4. Lấy tất cả
  async findAll() {
    return await prisma.chitietgiohang.findMany({
      include: {
        bienthe: true,
        giohang: true,
      },
    });
  }

  // 5. Tìm 1 theo id
  async findById(id) {
    return await prisma.chitietgiohang.findUnique({
      where: { id: id },
      include: {
        bienthe: {
          include: {
            sanpham: true,
          },
        },
      },
    });
  }

  // 6. Xóa 1 bản ghi
  async delete(id) {
    try {
      return await prisma.chitietgiohang.delete({
        where: { id: id },
      });
    } catch (error) {
      if (error.code === "P2025") return null;
      throw error;
    }
  }

  // 7. Xóa tất cả
  async deleteAll() {
    const result = await prisma.chitietgiohang.deleteMany({});
    return result.count;
  }
}

module.exports = ChiTietGioHangService;
