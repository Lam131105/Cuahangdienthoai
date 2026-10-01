const prisma = require("../../prisma/prisma.js");

class DiaChiService {
  extractDiaChiData(payload) {
    const diaChi = {
      id: payload.id,
      tennguoinhan: payload.tennguoinhan,
      sdtnguoinhan: payload.sdtnguoinhan,
      diachichitiet: payload.diachichitiet,
      tinhthanhid: payload.tinhthanhid,
      tentinhthanh: payload.tentinhthanh,
      quanhuyenid: payload.quanhuyenid,
      tenquanhuyen: payload.tenquanhuyen,
      phuongxaid: payload.phuongxaid,
      tenphuongxa: payload.tenphuongxa,
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
      const lastDiaChi = await client.diachi.findFirst({
        orderBy: { id: "desc" },
      });

      if (!lastDiaChi) {
        payload.id = "DC0001";
      } else {
        const currentNumber =
          parseInt(lastDiaChi.id.replace(/\D/g, ""), 10) || 0;
        payload.id = `DC${String(currentNumber + 1).padStart(4, "0")}`;
      }
    }

    // 🟢 SỬA LẠI LOGIC MẶC ĐỊNH Ở ĐÂY:
    // Kiểm tra xem khách hàng này đã có địa chỉ nào chưa
    const existingCount = await client.diachi.count({
      where: { makhachhang: payload.makhachhang },
    });

    if (existingCount === 0) {
      // Nếu chưa có địa chỉ nào -> BẮT BUỘC là địa chỉ mặc định
      payload.lamacdinh = true;
    } else {
      // Nếu đã có địa chỉ rồi -> Lấy đúng giá trị từ Frontend gửi lên (true hoặc false)
      payload.lamacdinh = Boolean(payload.lamacdinh);
    }

    const data = this.extractDiaChiData(payload);

    try {
      // 🟢 Nếu tạo địa chỉ mới là MẶC ĐỊNH -> Bọc trong Transaction
      return await client.$transaction(async (tx) => {
        if (data.lamacdinh === true && data.makhachhang) {
          // Bước 1: Reset tất cả địa chỉ khác của khách hàng này về lamacdinh = false
          await tx.diachi.updateMany({
            where: {
              makhachhang: data.makhachhang,
            },
            data: {
              lamacdinh: false,
            },
          });
        }

        // Bước 2: Tạo địa chỉ mới
        return await tx.diachi.create({
          data: data,
        });
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
  async update(id, payload, client = prisma) {
    const updateData = this.extractDiaChiData(payload);
    delete updateData.id;
    delete updateData.makhachhang; // Không cho phép đổi địa chỉ sang khách hàng khác

    try {
      return await client.$transaction(async (tx) => {
        if (updateData.lamacdinh === true) {
          const diachi = await tx.diachi.findUnique({ where: { id: id } });
          // Bước 1: Reset tất cả địa chỉ khác của khách hàng này về lamacdinh = false
          await tx.diachi.updateMany({
            where: {
              makhachhang: diachi.makhachhang,
            },
            data: {
              lamacdinh: false,
            },
          });
        }
        return await tx.diachi.update({
          where: { id: id },
          data: updateData,
        });
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
