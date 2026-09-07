const prisma = require("../../prisma/prisma.js");

class MauSacService {
  // Trích xuất dữ liệu màu sắc hợp lệ
  extractMauSacData(payload) {
    const mauSac = {
      id: payload.id,
      tenmau: payload.tenmau,
    };
    Object.keys(mauSac).forEach(
      (key) => mauSac[key] === undefined && delete mauSac[key],
    );
    return mauSac;
  }

  // 1. Tạo Màu Sắc mới (Tự sinh mã MS0001, MS0002...)
  async create(payload, client = prisma) {
    if (!payload.id) {
      const lastMS = await client.mausac.findFirst({
        orderBy: { id: "desc" },
      });
      const currentNumber = lastMS
        ? parseInt(lastMS.id.replace(/\D/g, ""), 10) || 0
        : 0;
      payload.id = `MS${String(currentNumber + 1).padStart(4, "0")}`;
    }

    const data = this.extractMauSacData(payload);
    return await client.mausac.create({
      data: data,
    });
  }

  // 2. Tìm danh sách Màu Sắc theo bộ lọc
  async find(filterData) {
    const where = {};

    if (filterData.id) {
      where.id = filterData.id;
    }

    if (filterData.tenmau) {
      where.tenmau = {
        contains: filterData.tenmau,
        mode: "insensitive",
      };
    }

    return await prisma.mausac.findMany({
      where: where,
      orderBy: { id: "asc" },
    });
  }

  // 3. Cập nhật thông tin Màu Sắc
  async update(id, payload) {
    const updateData = this.extractMauSacData(payload);
    delete updateData.id;

    try {
      return await prisma.mausac.update({
        where: { id: id },
        data: updateData,
      });
    } catch (error) {
      if (error.code === "P2025") {
        return null;
      }
      throw error;
    }
  }

  // 4. Xóa 1 bản ghi Màu Sắc
  async delete(id) {
    try {
      return await prisma.mausac.delete({
        where: { id: id },
      });
    } catch (error) {
      if (error.code === "P2025") {
        return null;
      }
      throw error;
    }
  }

  // 5. Xóa tất cả bản ghi Màu Sắc
  async deleteAll() {
    const result = await prisma.mausac.deleteMany({});
    return result.count;
  }

  // 6. Tìm chi tiết Màu Sắc theo ID
  async findById(id) {
    return await prisma.mausac.findUnique({
      where: { id: id },
    });
  }
}

module.exports = MauSacService;
