const prisma = require("../../prisma/prisma.js");

class ChiTietDotKhuyenMaiService {
  extractData(payload) {
    const chiTiet = {
      id: payload.id,
      madotkhuyenmai: payload.madotkhuyenmai,
      mabienthe: payload.mabienthe,
    };
    Object.keys(chiTiet).forEach(
      (key) => chiTiet[key] === undefined && delete chiTiet[key],
    );
    return chiTiet;
  }

  // 1. Thêm biến thể vào Đợt khuyến mãi (Tự sinh mã CTKM0001, CTKM0002...)
  async create(payload, client = prisma) {
    if (!payload.id) {
      const lastCT = await client.chitietdotkhuyenmai.findFirst({
        orderBy: { id: "desc" },
      });
      const currentNumber = lastCT
        ? parseInt(lastCT.id.replace(/\D/g, ""), 10) || 0
        : 0;
      payload.id = `CTKM${String(currentNumber + 1).padStart(4, "0")}`;
    }

    const data = this.extractData(payload);

    try {
      return await client.chitietdotkhuyenmai.create({
        data: data,
        include: {
          dotkhuyenmai: true,
          bienthe: true,
        },
      });
    } catch (error) {
      if (error.code === "P2003") {
        if (error.meta?.field_name?.includes("madotkhuyenmai")) {
          throw new Error("DOT_KHUYES_MAI_KHONG_TON_TAI");
        }
        throw new Error("BIEN_THE_KHONG_TON_TAI");
      }
      if (error.code === "P2002") {
        throw new Error("BIEN_THE_DA_CO_TRONG_DOT");
      }
      throw error;
    }
  }

  // 2. Tìm danh sách Chi tiết đợt khuyến mãi theo bộ lọc
  async find(filterData) {
    const where = {};

    if (filterData.id) where.id = filterData.id;
    if (filterData.madotkhuyenmai)
      where.madotkhuyenmai = filterData.madotkhuyenmai;
    if (filterData.mabienthe) where.mabienthe = filterData.mabienthe;

    return await prisma.chitietdotkhuyenmai.findMany({
      where: where,
      include: {
        dotkhuyenmai: true,
        bienthe: true,
      },
    });
  }

  // 5. Xóa 1 bản ghi
  async delete(id) {
    try {
      return await prisma.chitietdotkhuyenmai.delete({
        where: { id: id },
      });
    } catch (error) {
      if (error.code === "P2025") return null;
      throw error;
    }
  }

  // 6. Xóa toàn bộ
  async deleteAll() {
    const result = await prisma.chitietdotkhuyenmai.deleteMany({});
    return result.count;
  }

  // 7. Tìm chi tiết theo ID
  async findById(id) {
    return await prisma.chitietdotkhuyenmai.findUnique({
      where: { id: id },
      include: {
        dotkhuyenmai: true,
        bienthe: true,
      },
    });
  }
}

module.exports = ChiTietDotKhuyenMaiService;
