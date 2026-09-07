const prisma = require("../../prisma/prisma.js");

class DieuKienNhanVoucherService {
  extractData(payload) {
    const data = {
      id: payload.id,
      mocchitoithieu:
        payload.mocchitoithieu !== undefined
          ? parseFloat(payload.mocchitoithieu)
          : undefined,
      soluongnhan:
        payload.soluongnhan !== undefined
          ? parseInt(payload.soluongnhan, 10)
          : undefined,
      maphieugiamgia: payload.maphieugiamgia,
    };
    Object.keys(data).forEach(
      (key) => data[key] === undefined && delete data[key],
    );
    return data;
  }

  // 1. Tạo điều kiện mới (Tự sinh mã DKV0001, DKV0002...)
  async create(payload, client = prisma) {
    if (!payload.id) {
      const last = await client.dieukiennhanvoucher.findFirst({
        orderBy: { id: "desc" },
      });
      const currentNumber = last
        ? parseInt(last.id.replace(/\D/g, ""), 10) || 0
        : 0;
      payload.id = `DKV${String(currentNumber + 1).padStart(4, "0")}`;
    }

    const data = this.extractData(payload);

    try {
      return await client.dieukiennhanvoucher.create({
        data: data,
        include: {
          phieugiamgia: true,
        },
      });
    } catch (error) {
      if (error.code === "P2003") {
        throw new Error("PHIEU_GIAM_GIA_KHONG_TON_TAI");
      }
      throw error;
    }
  }

  // 3. Tìm theo bộ lọc
  async find(filterData) {
    const where = {};

    if (filterData.id) where.id = filterData.id;
    if (filterData.maphieugiamgia)
      where.maphieugiamgia = filterData.maphieugiamgia;

    return await prisma.dieukiennhanvoucher.findMany({
      where: where,
      include: {
        phieugiamgia: true,
      },
      orderBy: { mocchitoithieu: "asc" },
    });
  }

  // 5. Cập nhật
  async update(id, payload) {
    const updateData = this.extractData(payload);
    delete updateData.id;

    try {
      return await prisma.dieukiennhanvoucher.update({
        where: { id: id },
        data: updateData,
        include: { phieugiamgia: true },
      });
    } catch (error) {
      if (error.code === "P2025") return null;
      throw error;
    }
  }

  // 6. Xóa 1 điều kiện
  async delete(id) {
    try {
      return await prisma.dieukiennhanvoucher.delete({
        where: { id: id },
      });
    } catch (error) {
      if (error.code === "P2025") return null;
      throw error;
    }
  }

  // 7. Xóa tất cả
  async deleteAll() {
    const result = await prisma.dieukiennhanvoucher.deleteMany({});
    return result.count;
  }

  // 8. Tìm chi tiết theo ID
  async findById(id) {
    return await prisma.dieukiennhanvoucher.findUnique({
      where: { id: id },
      include: {
        phieugiamgia: true,
      },
    });
  }
}

module.exports = DieuKienNhanVoucherService;
