const prisma = require("../../prisma/prisma.js");

class SanPhamService {
  // Trích xuất dữ liệu sản phẩm
  extractSanPhamData(payload) {
    const sanPham = {
      id: payload.id,
      tensanpham: payload.tensanpham,
      mota: payload.mota,
      trangthai:
        payload.trangthai !== undefined
          ? Boolean(payload.trangthai)
          : undefined,
      mathuonghieu: payload.mathuonghieu,
      matheloai: payload.matheloai,
    };
    Object.keys(sanPham).forEach(
      (key) => sanPham[key] === undefined && delete sanPham[key],
    );
    return sanPham;
  }

  // 1. Tạo Sản phẩm mới (Có hỗ trợ Transaction Client)
  async create(payload, client = prisma) {
    if (!payload.id) {
      const lastSP = await client.sanpham.findFirst({
        orderBy: { id: "desc" },
      });
      const currentNumber = lastSP
        ? parseInt(lastSP.id.replace(/\D/g, ""), 10) || 0
        : 0;
      payload.id = `SP${String(currentNumber + 1).padStart(4, "0")}`;
    }

    if (payload.trangthai === undefined) {
      payload.trangthai = true;
    }

    const data = this.extractSanPhamData(payload);

    try {
      return await client.sanpham.create({
        data: data,
        // include: {
        //   thuonghieu: true,
        //   theloai: true,
        // },
      });
    } catch (error) {
      if (error.code === "P2003") {
        if (error.meta?.field_name?.includes("mathuonghieu")) {
          throw new Error("THUONG_HIEU_KHONG_TON_TAI");
        }
        if (error.meta?.field_name?.includes("matheloai")) {
          throw new Error("THE_LOAI_KHONG_TON_TAI");
        }
      }
      throw error;
    }
  }

  // 2. Tìm danh sách Sản phẩm theo điều kiện
  async find(filterData) {
    const where = {};

    if (filterData.id) {
      where.id = filterData.id;
    }

    if (filterData.mathuonghieu) {
      where.mathuonghieu = filterData.mathuonghieu;
    }

    if (filterData.matheloai) {
      where.matheloai = filterData.matheloai;
    }

    if (filterData.trangthai !== undefined && filterData.trangthai !== "") {
      where.trangthai =
        filterData.trangthai === "true" || filterData.trangthai === true;
    }

    if (filterData.tensanpham) {
      where.tensanpham = {
        contains: filterData.tensanpham,
        mode: "insensitive",
      };
    }

    return await prisma.sanpham.findMany({
      where: where,
      //   include: {
      //     thuonghieu: true,
      //     theloai: true,
      //   },
    });
  }

  // 5. Cập nhật Sản phẩm
  async update(id, payload) {
    const updateData = this.extractSanPhamData(payload);
    delete updateData.id;

    try {
      return await prisma.sanpham.update({
        where: { id: id },
        data: updateData,
        // include: {
        // //   thuonghieu: true,
        // //   theloai: true,
        // },
      });
    } catch (error) {
      if (error.code === "P2025") {
        return null;
      }
      if (error.code === "P2003") {
        if (error.meta?.field_name?.includes("mathuonghieu")) {
          throw new Error("THUONG_HIEU_KHONG_TON_TAI");
        }
        if (error.meta?.field_name?.includes("matheloai")) {
          throw new Error("THE_LOAI_KHONG_TON_TAI");
        }
      }
      throw error;
    }
  }

  // 6. Xóa 1 Sản phẩm
  async delete(id) {
    try {
      return await prisma.sanpham.delete({
        where: { id: id },
      });
    } catch (error) {
      if (error.code === "P2025") {
        return null;
      }
      throw error;
    }
  }

  // 7. Xóa toàn bộ Sản phẩm
  async deleteAll() {
    const result = await prisma.sanpham.deleteMany({});
    return result.count;
  }

  // 8. Tìm chi tiết Sản phẩm theo ID
  async findById(id) {
    return await prisma.sanpham.findUnique({
      where: { id: id },
      //   include: {
      //     thuonghieu: true,
      //     theloai: true,
      //   },
    });
  }
}

module.exports = SanPhamService;
