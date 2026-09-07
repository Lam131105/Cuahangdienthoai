const prisma = require("../../prisma/prisma.js");

class DiaChiService {
  extractDiaChiData(payload) {
    const diaChi = {
      id: payload.id,
      tennguoinhan: payload.tennguoinhan,
      sdtnguoinhan: payload.sdtnguoinhan,
      diachichitiet: payload.diachichitiet,
      lamacdinh:
        payload.lamacdinh !== undefined
          ? Boolean(payload.lamacdinh)
          : undefined,
      makhachhang: payload.makhachhang,
    };
    Object.keys(diaChi).forEach(
      (key) => diaChi[key] === undefined && delete diaChi[key],
    );
    return diaChi;
  }

  // 1. Tạo địa chỉ mới
  async create(payload, client = prisma) {
    if (!payload.id) {
      // Dùng client để đảm bảo cùng ngữ cảnh Transaction
      const lastDiaChi = await client.diachi.findFirst({
        orderBy: {
          id: "desc",
        },
      });

      if (!lastDiaChi) {
        payload.id = "DC0001";
      } else {
        const currentNumber =
          parseInt(lastDiaChi.id.replace(/\D/g, ""), 10) || 0;
        payload.id = `DC${String(currentNumber + 1).padStart(4, "0")}`;
      }
    }

    if (payload.lamacdinh === undefined) {
      payload.lamacdinh = false;
    }

    const data = this.extractDiaChiData(payload);

    try {
      return await client.diachi.create({
        data: data,
      });
    } catch (error) {
      // Mã P2003: Lỗi vi phạm ràng buộc khóa ngoại (Mã khách hàng không tồn tại)
      if (error.code === "P2003") {
        throw new Error("KHACH_HANG_KHONG_TON_TAI");
      }
      throw error;
    }
  }

  // 2. Tìm kiếm linh hoạt theo bộ lọc
  async find(filterData) {
    const where = {};

    if (filterData.id) {
      where.id = filterData.id;
    }

    if (filterData.makhachhang) {
      where.makhachhang = filterData.makhachhang;
    }

    if (filterData.tennguoinhan) {
      where.tennguoinhan = {
        contains: filterData.tennguoinhan,
        mode: "insensitive",
      };
    }

    if (filterData.sdtnguoinhan) {
      where.sdtnguoinhan = {
        contains: filterData.sdtnguoinhan,
      };
    }

    return await prisma.diachi.findMany({
      where: where,
      // include: {
      //   khachhang: true, // Bao gồm luôn thông tin khách hàng trong kết quả trả về
      // },
    });
  }

  // 4. Cập nhật Địa Chỉ
  async update(id, payload) {
    const updateData = this.extractDiaChiData(payload);
    delete updateData.id;
    delete updateData.makhachhang; // Không cho phép đổi địa chỉ sang khách hàng khác

    try {
      return await prisma.diachi.update({
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

  // 5. Xóa Địa Chỉ
  async delete(id) {
    try {
      return await prisma.diachi.delete({
        where: { id: id },
      });
    } catch (error) {
      if (error.code === "P2025") {
        return null;
      }
      throw error;
    }
  }

  // 6. Xóa tất cả Địa Chỉ
  async deleteAll() {
    const result = await prisma.diachi.deleteMany({});
    return result.count;
  }

  // 7. Tìm một Địa Chỉ theo ID
  async findById(id) {
    return await prisma.diachi.findUnique({
      where: { id: id },
      include: {
        khachhang: true,
      },
    });
  }
}

module.exports = DiaChiService;
