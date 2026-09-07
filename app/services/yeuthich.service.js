const prisma = require("../../prisma/prisma.js");

class YeuThichService {
  // Trích xuất thuộc tính yêu thích
  extractYeuThichData(payload) {
    const yeuThich = {
      id: payload.id,
      masanpham: payload.masanpham,
      makhachhang: payload.makhachhang,
    };
    Object.keys(yeuThich).forEach(
      (key) => yeuThich[key] === undefined && delete yeuThich[key],
    );
    return yeuThich;
  }

  // 1. Tạo yêu thích mới (Tự sinh mã DG0001, DG0002...)
  async create(payload, client = prisma) {
    if (!payload.id) {
      const lastDG = await client.yeuthich.findFirst({
        orderBy: { id: "desc" },
      });
      const currentNumber = lastDG
        ? parseInt(lastDG.id.replace(/\D/g, ""), 10) || 0
        : 0;
      payload.id = `YT${String(currentNumber + 1).padStart(4, "0")}`;
    }

    const data = this.extractYeuThichData(payload);

    try {
      return await client.yeuthich.create({
        data: data,
        include: {
          sanpham: { select: { id: true, tensanpham: true } },
          khachhang: { select: { id: true, hoten: true, email: true } },
        },
      });
    } catch (error) {
      if (error.code === "P2003") {
        if (error.meta?.field_name?.includes("masanpham")) {
          throw new Error("SAN_PHAM_KHONG_TON_TAI");
        }
        throw new Error("KHACH_HANG_KHONG_TON_TAI");
      }
      if (error.code === "P2002") {
        throw new Error("KHACH_HANG_DA_YEU_THICH");
      }
      throw error;
    }
  }

  // 2. Tìm danh sách yêu thích theo bộ lọc
  async find(filterData) {
    const where = {};

    if (filterData.id) where.id = filterData.id;
    if (filterData.masanpham) where.masanpham = filterData.masanpham;

    return await prisma.yeuthich.findMany({
      where: where,
      include: {
        sanpham: { select: { id: true, tensanpham: true } },
        khachhang: { select: { id: true, hoten: true, email: true } },
      },
    });
  }

  // 3. Lấy yêu thích theo Sản Phẩm (Tính trung bình sao)
  async findBySanPham(masanpham) {
    const list = await prisma.yeuthich.findMany({
      where: { masanpham: masanpham },
      include: {
        khachhang: { select: { id: true, hoten: true } },
      },
    });

    const aggregate = await prisma.yeuthich.aggregate({
      where: { masanpham: masanpham },
      _count: { id: true },
    });

    return {
      tongYeuThich: aggregate._count.id,
      danhsach: list,
    };
  }
  // 6. Xóa 1 yêu thích
  async delete(id) {
    try {
      return await prisma.yeuthich.delete({
        where: { id: id },
      });
    } catch (error) {
      if (error.code === "P2025") return null;
      throw error;
    }
  }

  // 7. Xóa toàn bộ yêu thích
  async deleteAll() {
    const result = await prisma.yeuthich.deleteMany({});
    return result.count;
  }

  // 8. Tìm chi tiết yêu thích theo ID
  async findById(id) {
    return await prisma.yeuthich.findUnique({
      where: { id: id },
      include: {
        sanpham: { select: { id: true, tensanpham: true } },
        khachhang: { select: { id: true, hoten: true, email: true } },
      },
    });
  }
}

module.exports = YeuThichService;
