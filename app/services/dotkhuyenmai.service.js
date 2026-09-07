const prisma = require("../../prisma/prisma.js");

class DotKhuyenMaiService {
  // Trích xuất thuộc tính Đợt khuyến mãi
  extractDotKhuyenMaiData(payload) {
    const dotKhuyenMai = {
      id: payload.id,
      tendot: payload.tendot,
      ngaybatdau: payload.ngaybatdau ? new Date(payload.ngaybatdau) : undefined,
      ngayketthuc: payload.ngayketthuc
        ? new Date(payload.ngayketthuc)
        : undefined,
      loaigiamgia: payload.loaigiamgia,
      giatrigiam:
        payload.giatrigiam !== undefined
          ? parseFloat(payload.giatrigiam)
          : undefined,
    };
    Object.keys(dotKhuyenMai).forEach(
      (key) => dotKhuyenMai[key] === undefined && delete dotKhuyenMai[key],
    );
    return dotKhuyenMai;
  }

  // 1. Tạo Đợt Khuyến Mãi mới (Tự sinh mã DKM0001, DKM0002...)
  async create(payload, client = prisma) {
    if (!payload.id) {
      const lastDKM = await client.dotkhuyenmai.findFirst({
        orderBy: { id: "desc" },
      });
      const currentNumber = lastDKM
        ? parseInt(lastDKM.id.replace(/\D/g, ""), 10) || 0
        : 0;
      payload.id = `DKM${String(currentNumber + 1).padStart(4, "0")}`;
    }

    const data = this.extractDotKhuyenMaiData(payload);
    return await client.dotkhuyenmai.create({ data });
  }

  // 2. Tìm danh sách Đợt Khuyến Mãi theo bộ lọc
  async find(filterData) {
    const where = {};

    if (filterData.id) where.id = filterData.id;
    if (filterData.loaigiamgia) where.loaigiamgia = filterData.loaigiamgia;

    if (filterData.tendot) {
      where.tendot = {
        contains: filterData.tendot,
        mode: "insensitive",
      };
    }

    return await prisma.dotkhuyenmai.findMany({
      where: where,
      orderBy: { ngaybatdau: "desc" },
    });
  }

  // 3. Lấy các đợt khuyến mãi đang diễn ra (Active)
  async findActive() {
    const now = new Date();
    return await prisma.dotkhuyenmai.findMany({
      where: {
        ngaybatdau: { lte: now },
        ngayketthuc: { gte: now },
      },
      orderBy: { ngayketthuc: "asc" },
    });
  }

  // 4. Cập nhật Đợt Khuyến Mãi
  async update(id, payload) {
    const updateData = this.extractDotKhuyenMaiData(payload);
    delete updateData.id;

    try {
      return await prisma.dotkhuyenmai.update({
        where: { id: id },
        data: updateData,
      });
    } catch (error) {
      if (error.code === "P2025") return null;
      throw error;
    }
  }

  // 5. Xóa 1 Đợt Khuyến Mãi
  async delete(id) {
    try {
      return await prisma.dotkhuyenmai.delete({
        where: { id: id },
      });
    } catch (error) {
      if (error.code === "P2025") return null;
      throw error;
    }
  }

  // 6. Xóa tất cả Đợt Khuyến Mãi
  async deleteAll() {
    const result = await prisma.dotkhuyenmai.deleteMany({});
    return result.count;
  }

  // 7. Tìm chi tiết theo ID
  async findById(id) {
    return await prisma.dotkhuyenmai.findUnique({
      where: { id: id },
    });
  }
}

module.exports = DotKhuyenMaiService;
