const prisma = require("../../prisma/prisma.js");

class ThongSoKyThuatService {
  // Trích xuất dữ liệu chuẩn
  extractThongSoData(payload) {
    const thongSo = {
      id: payload.id,
      kichthuocmanhinh: payload.kichthuocmanhinh,
      congnghemanhinh: payload.congnghemanhinh,
      chipset: payload.chipset,
      camerasau: payload.camerasau,
      cameratruoc: payload.cameratruoc,
      dungluongpin: payload.dungluongpin,
      congnghesac: payload.congnghesac,
      masanpham: payload.masanpham,
    };
    Object.keys(thongSo).forEach(
      (key) => thongSo[key] === undefined && delete thongSo[key],
    );
    return thongSo;
  }

  // 1. Tạo Thông Số Kỹ Thuật mới (Tự sinh mã TSKT0001, TSKT0002...)
  async create(payload, client = prisma) {
    if (!payload.id) {
      const lastTSKT = await client.thongsokythuat.findFirst({
        orderBy: { id: "desc" },
      });
      const currentNumber = lastTSKT
        ? parseInt(lastTSKT.id.replace(/\D/g, ""), 10) || 0
        : 0;
      payload.id = `TSKT${String(currentNumber + 1).padStart(4, "0")}`;
    }

    const data = this.extractThongSoData(payload);

    try {
      return await client.thongsokythuat.create({
        data: data,
        include: {
          sanpham: true,
        },
      });
    } catch (error) {
      if (error.code === "P2003") {
        throw new Error("SAN_PHAM_KHONG_TON_TAI");
      }
      if (error.code === "P2002") {
        throw new Error("THONG_SO_DA_TON_TAI");
      }
      throw error;
    }
  }

  // 2. Tìm danh sách theo điều kiện
  async find(filterData) {
    const where = {};

    if (filterData.id) where.id = filterData.id;
    if (filterData.masanpham) where.masanpham = filterData.masanpham;

    if (filterData.chipset) {
      where.chipset = {
        contains: filterData.chipset,
        mode: "insensitive",
      };
    }
    if (filterData.kichthuocmanhinh) {
      where.kichthuocmanhinh = {
        contains: filterData.kichthuocmanhinh,
        mode: "insensitive",
      };
    }
    if (filterData.congnghemanhinh) {
      where.congnghemanhinh = {
        contains: filterData.congnghemanhinh,
        mode: "insensitive",
      };
    }
    if (filterData.camerasau) {
      where.camerasau = {
        contains: filterData.camerasau,
        mode: "insensitive",
      };
    }
    if (filterData.cameratruoc) {
      where.cameratruoc = {
        contains: filterData.cameratruoc,
        mode: "insensitive",
      };
    }
    if (filterData.dungluongpin) {
      where.dungluongpin = {
        contains: filterData.dungluongpin,
        mode: "insensitive",
      };
    }
    if (filterData.congnghesac) {
      where.congnghesac = {
        contains: filterData.congnghesac,
        mode: "insensitive",
      };
    }

    return await prisma.thongsokythuat.findMany({
      where: where,
      include: {
        sanpham: true,
      },
    });
  }

  // 3. Tìm theo Mã Sản Phẩm
  async findBySanPham(masanpham) {
    return await prisma.thongsokythuat.findUnique({
      where: { masanpham: masanpham },
      include: {
        sanpham: true,
      },
    });
  }

  // 4. Cập nhật theo ID
  async update(id, payload, client = prisma) {
    const updateData = this.extractThongSoData(payload);
    delete updateData.id;

    try {
      return await client.thongsokythuat.update({
        where: { id: id },
        data: updateData,
      });
    } catch (error) {
      if (error.code === "P2025") return null;
      throw error;
    }
  }

  // 6. Xóa 1 bản ghi
  async delete(id) {
    try {
      return await prisma.thongsokythuat.delete({
        where: { id: id },
      });
    } catch (error) {
      if (error.code === "P2025") return null;
      throw error;
    }
  }

  // 7. Xóa toàn bộ
  async deleteAll() {
    const result = await prisma.thongsokythuat.deleteMany({});
    return result.count;
  }

  // 8. Tìm theo ID
  async findById(id) {
    return await prisma.thongsokythuat.findUnique({
      where: { id: id },
      include: {
        sanpham: true,
      },
    });
  }
}

module.exports = ThongSoKyThuatService;
