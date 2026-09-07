const prisma = require("../../prisma/prisma.js");

class RamService {
  // Trích xuất dữ liệu RAM hợp lệ
  extractRamData(payload) {
    const ram = {
      id: payload.id,
      dungluongram: payload.dungluongram,
    };
    Object.keys(ram).forEach(
      (key) => ram[key] === undefined && delete ram[key],
    );
    return ram;
  }

  // 1. Tạo RAM mới (Tự sinh mã RAM0001, RAM0002...)
  async create(payload, client = prisma) {
    if (!payload.id) {
      const lastRam = await client.ram.findFirst({
        orderBy: { id: "desc" },
      });
      const currentNumber = lastRam
        ? parseInt(lastRam.id.replace(/\D/g, ""), 10) || 0
        : 0;
      payload.id = `RAM${String(currentNumber + 1).padStart(4, "0")}`;
    }

    const data = this.extractRamData(payload);
    return await client.ram.create({
      data: data,
    });
  }

  // 2. Tìm danh sách RAM theo bộ lọc
  async find(filterData) {
    const where = {};

    if (filterData.id) {
      where.id = filterData.id;
    }

    if (filterData.dungluongram) {
      where.dungluongram = {
        contains: filterData.dungluongram,
        mode: "insensitive",
      };
    }

    return await prisma.ram.findMany({
      where: where,
      orderBy: { id: "asc" },
    });
  }

  // 3. Cập nhật thông tin RAM
  async update(id, payload) {
    const updateData = this.extractRamData(payload);
    delete updateData.id;

    try {
      return await prisma.ram.update({
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

  // 4. Xóa 1 bản ghi RAM
  async delete(id) {
    try {
      return await prisma.ram.delete({
        where: { id: id },
      });
    } catch (error) {
      if (error.code === "P2025") {
        return null;
      }
      throw error;
    }
  }

  // 5. Xóa tất cả bản ghi RAM
  async deleteAll() {
    const result = await prisma.ram.deleteMany({});
    return result.count;
  }

  // 6. Tìm chi tiết RAM theo ID
  async findById(id) {
    return await prisma.ram.findUnique({
      where: { id: id },
    });
  }
}

module.exports = RamService;
