const prisma = require("../../prisma/prisma.js");

class NhaCungCapService {
  // Lọc lấy các trường thuộc tính hợp lệ theo schema Nhacungcap
  extractNhaCungCapData(payload) {
    const nhaCungCap = {
      id: payload.id,
      tenncc: payload.tenncc,
      sodienthoai: payload.sodienthoai,
      diachi: payload.diachi,
    };
    Object.keys(nhaCungCap).forEach(
      (key) => nhaCungCap[key] === undefined && delete nhaCungCap[key],
    );
    return nhaCungCap;
  }

  // 1. Tạo nhà cung cấp mới (Tự sinh mã NCC0001, NCC0002 an toàn không lỗi String)
  async create(payload) {
    if (!payload.id) {
      // Tìm 1 nhà cung cấp có ID lớn nhất hiện tại
      const lastNCC = await prisma.nhacungcap.findFirst({
        orderBy: {
          id: "desc",
        },
      });

      if (!lastNCC) {
        // Nếu database chưa có nhà cung cấp nào
        payload.id = "NCC0001";
      } else {
        // Lấy phần số ra khỏi chuỗi (VD: "NCC0005" -> lấy số 5)
        const currentNumber = parseInt(lastNCC.id.replace(/\D/g, ""), 10) || 0;
        // Cộng thêm 1 và bù 4 chữ số 0 (Chạy an toàn đến NCC9999)
        payload.id = `NCC${String(currentNumber + 1).padStart(4, "0")}`;
      }
    }

    const data = this.extractNhaCungCapData(payload);
    try {
      return await prisma.nhacungcap.create({
        data: data,
      });
    } catch (error) {
      // Mã P2002 đại diện cho lỗi unique (Trùng tenncc)
      if (error.code === "P2002") {
        throw new Error("TEN_NCC_DA_TON_TAI");
      }
      throw error;
    }
  }

  // 2. Tìm kiếm nhà cung cấp theo mã (id) hoặc tên (tenncc)
  async find(filterData) {
    const where = {};

    if (filterData.id) {
      where.id = filterData.id;
    }

    if (filterData.tenncc) {
      where.tenncc = {
        contains: filterData.tenncc,
        mode: "insensitive", // Tìm kiếm gần đúng, không phân biệt hoa thường
      };
    }

    return await prisma.nhacungcap.findMany({
      where: where,
    });
  }

  // ==================== Cập nhật thông tin một Nhà Cung Cấp dựa trên id ======================
  async update(id, payload) {
    const updateData = this.extractNhaCungCapData(payload);
    delete updateData.id; // Không cho phép cập nhật khóa chính (id)

    try {
      const result = await prisma.nhacungcap.update({
        where: { id: id },
        data: updateData,
      });
      return result;
    } catch (error) {
      if (error.code === "P2025") {
        return null; // Không tìm thấy bản ghi cần update
      }
      if (error.code === "P2002") {
        throw new Error("TEN_NCC_DA_TON_TAI");
      }
      throw error;
    }
  }

  // ======================== Xóa Nhà Cung Cấp dựa trên id ==============================
  async delete(id) {
    try {
      const result = await prisma.nhacungcap.delete({
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

  // ====================== Xóa tất cả các Nhà Cung Cấp ========================
  async deleteAll() {
    const result = await prisma.nhacungcap.deleteMany({});
    return result.count;
  }

  // ==================== Tìm một Nhà Cung Cấp dựa trên id ======================
  async findById(id) {
    return await prisma.nhacungcap.findUnique({
      where: { id: id },
    });
  }
}

module.exports = NhaCungCapService;
