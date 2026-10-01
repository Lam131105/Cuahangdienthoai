const prisma = require("../../prisma/prisma.js");

class PhieuGiamGiaService {
  // Trích xuất thuộc tính Phiếu giảm giá
  extractPhieuGiamGiaData(payload) {
    const phieuGiamGia = {
      id: payload.id,
      tenphieu: payload.tenphieu,
      giatrigiam:
        payload.giatrigiam !== undefined
          ? parseFloat(payload.giatrigiam)
          : undefined,
      dongiatoithieu:
        payload.dongiatoithieu !== undefined
          ? parseFloat(payload.dongiatoithieu)
          : undefined,
      giamtoida:
        payload.giamtoida !== undefined
          ? parseFloat(payload.giamtoida)
          : undefined,
      thoihan:
        payload.thoihan !== undefined ? parseInt(payload.thoihan) : undefined,
      loaigiamgia: payload.loaigiamgia,
      duongdananh: payload.duongdananh,
    };
    Object.keys(phieuGiamGia).forEach(
      (key) => phieuGiamGia[key] === undefined && delete phieuGiamGia[key],
    );
    return phieuGiamGia;
  }

  // 1. Tạo Phiếu Giảm Giá mới (Tự sinh mã PGG0001, PGG0002...)
  async create(payload, client = prisma) {
    if (!payload.id) {
      const lastPGG = await client.phieugiamgia.findFirst({
        orderBy: { id: "desc" },
      });
      const currentNumber = lastPGG
        ? parseInt(lastPGG.id.replace(/\D/g, ""), 10) || 0
        : 0;
      payload.id = `PGG${String(currentNumber + 1).padStart(4, "0")}`;
    }

    if (payload.loaigiamgia === "Tiền cố định") {
      payload.giamtoida = null;
    }
    const data = this.extractPhieuGiamGiaData(payload);
    return await client.phieugiamgia.create({ data });
  }

  // 2. Tìm danh sách Phiếu Giảm Giá theo bộ lọc
  async find(filterData) {
    const where = {};

    if (filterData.id) where.id = filterData.id;
    if (filterData.loaigiamgia) where.loaigiamgia = filterData.loaigiamgia;

    if (filterData.tenphieu) {
      where.tenphieu = {
        contains: filterData.tenphieu,
        mode: "insensitive",
      };
    }

    return await prisma.phieugiamgia.findMany({
      where: where,
      orderBy: { id: "desc" },
    });
  }

  // 4. Cập nhật Phiếu Giảm Giá
  async update(id, payload) {
    if (payload.loaigiamgia === "Tiền cố định") {
      payload.giamtoida = null;
    }
    const updateData = this.extractPhieuGiamGiaData(payload);
    delete updateData.id;

    try {
      return await prisma.phieugiamgia.update({
        where: { id: id },
        data: updateData,
      });
    } catch (error) {
      if (error.code === "P2025") return null;
      throw error;
    }
  }

  // 5. Xóa 1 Phiếu Giảm Giá
  async delete(id) {
    try {
      return await prisma.phieugiamgia.delete({
        where: { id: id },
      });
    } catch (error) {
      if (error.code === "P2025") return null;
      throw error;
    }
  }

  // 6. Xóa tất cả Phiếu Giảm Giá
  async deleteAll() {
    const result = await prisma.phieugiamgia.deleteMany({});
    return result.count;
  }

  // 7. Tìm chi tiết theo ID
  async findById(id) {
    return await prisma.phieugiamgia.findUnique({
      where: { id: id },
    });
  }
}

module.exports = PhieuGiamGiaService;
