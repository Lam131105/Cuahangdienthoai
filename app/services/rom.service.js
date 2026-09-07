const prisma = require("../../prisma/prisma.js");

class RomService {
  // Trích xuất dữ liệu ROM hợp lệ
  extractRomData(payload) {
    const rom = {
      id: payload.id,
      dungluongrom: payload.dungluongrom,
    };
    Object.keys(rom).forEach(
      (key) => rom[key] === undefined && delete rom[key],
    );
    return rom;
  }

  // 1. Tạo ROM mới (Tự sinh mã ROM0001, ROM0002...)
  async create(payload, client = prisma) {
    if (!payload.id) {
      const lastRom = await client.rom.findFirst({
        orderBy: { id: "desc" },
      });
      const currentNumber = lastRom
        ? parseInt(lastRom.id.replace(/\D/g, ""), 10) || 0
        : 0;
      payload.id = `ROM${String(currentNumber + 1).padStart(4, "0")}`;
    }

    const data = this.extractRomData(payload);
    return await client.rom.create({
      data: data,
    });
  }

  // 2. Tìm danh sách ROM theo bộ lọc
  async find(filterData) {
    const where = {};

    if (filterData.id) {
      where.id = filterData.id;
    }

    if (filterData.dungluongrom) {
      where.dungluongrom = {
        contains: filterData.dungluongrom,
        mode: "insensitive",
      };
    }

    return await prisma.rom.findMany({
      where: where,
      orderBy: { id: "asc" },
    });
  }

  // 3. Cập nhật thông tin ROM
  async update(id, payload) {
    const updateData = this.extractRomData(payload);
    delete updateData.id;

    try {
      return await prisma.rom.update({
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

  // 4. Xóa 1 bản ghi ROM
  async delete(id) {
    try {
      return await prisma.rom.delete({
        where: { id: id },
      });
    } catch (error) {
      if (error.code === "P2025") {
        return null;
      }
      throw error;
    }
  }

  // 5. Xóa tất cả bản ghi ROM
  async deleteAll() {
    const result = await prisma.rom.deleteMany({});
    return result.count;
  }

  // 6. Tìm chi tiết ROM theo ID
  async findById(id) {
    return await prisma.rom.findUnique({
      where: { id: id },
    });
  }
}

module.exports = RomService;
