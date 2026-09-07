const prisma = require("../../prisma/prisma.js");

class VaiTroService {
  // Lọc lấy các trường thuộc tính hợp lệ theo schema Vaitro
  extractVaiTroData(payload) {
    const vaiTro = {
      id: payload.id,
      tenvaitro: payload.tenvaitro,
    };
    Object.keys(vaiTro).forEach(
      (key) => vaiTro[key] === undefined && delete vaiTro[key]
    );
    return vaiTro;
  }

  // 1. Tạo vai trò mới (Tự sinh mã VT0001, VT0002 an toàn)
  async create(payload) {
    if (!payload.id) {
      // Tìm 1 vai trò có ID lớn nhất hiện tại
      const lastVaiTro = await prisma.vaitro.findFirst({
        orderBy: {
          id: "desc",
        },
      });

      if (!lastVaiTro) {
        // Nếu database chưa có vai trò nào
        payload.id = "VT0001";
      } else {
        // Lấy phần số ra khỏi chuỗi (VD: "VT0005" -> lấy số 5)
        const currentNumber =
          parseInt(lastVaiTro.id.replace(/\D/g, ""), 10) || 0;
        // Cộng thêm 1 và bù 4 chữ số 0
        payload.id = `VT${String(currentNumber + 1).padStart(4, "0")}`;
      }
    }

    const data = this.extractVaiTroData(payload);
    try {
      return await prisma.vaitro.create({
        data: data,
      });
    } catch (error) {
      // Mã P2002 đại diện cho lỗi unique (Trùng tenvaitro)
      if (error.code === "P2002") {
        throw new Error("TEN_VAI_TRO_DA_TON_TAI");
      }
      throw error;
    }
  }

  // 2. Tìm kiếm vai trò theo mã (id) hoặc tên (tenvaitro)
  async find(filterData) {
    const where = {};

    if (filterData.id) {
      where.id = filterData.id;
    }

    if (filterData.tenvaitro) {
      where.tenvaitro = {
        contains: filterData.tenvaitro,
        mode: "insensitive", // Tìm kiếm gần đúng, không phân biệt hoa thường
      };
    }

    return await prisma.vaitro.findMany({
      where: where,
    });
  }

  // ==================== Cập nhật thông tin một Vai Trò dựa trên id ======================
  async update(id, payload) {
    const updateData = this.extractVaiTroData(payload);
    delete updateData.id; // Không cho phép cập nhật khóa chính (id)

    try {
      const result = await prisma.vaitro.update({
        where: { id: id },
        data: updateData,
      });
      return result;
    } catch (error) {
      if (error.code === "P2025") {
        return null; // Không tìm thấy bản ghi cần update
      }
      if (error.code === "P2002") {
        throw new Error("TEN_VAI_TRO_DA_TON_TAI");
      }
      throw error;
    }
  }

  // ======================== Xóa Vai Trò dựa trên id ==============================
  async delete(id) {
    try {
      const result = await prisma.vaitro.delete({
        where: { id: id },
      });
      return result;
    } catch (error) {
      if (error.code === "P2025") {
        return null;
      }
      throw error;
    }
  }

  // ====================== Xóa tất cả các Vai Trò ========================
  async deleteAll() {
    const result = await prisma.vaitro.deleteMany({});
    return result.count;
  }

  // ==================== Tìm một Vai Trò dựa trên id ======================
  async findById(id) {
    return await prisma.vaitro.findUnique({
      where: { id: id },
    });
  }
}

module.exports = VaiTroService;