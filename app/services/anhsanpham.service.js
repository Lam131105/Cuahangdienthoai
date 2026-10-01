const prisma = require("../../prisma/prisma.js");

class AnhSanPhamService {
  // Trích xuất thuộc tính của Ảnh Sản Phẩm
  extractAnhSanPhamData(payload) {
    const anhSanPham = {
      id: payload.id,
      duongdananh: payload.duongdananh,
      laanhchinh:
        payload.laanhchinh !== undefined
          ? Boolean(payload.laanhchinh)
          : undefined,
      masanpham: payload.masanpham,
    };
    Object.keys(anhSanPham).forEach(
      (key) => anhSanPham[key] === undefined && delete anhSanPham[key],
    );
    return anhSanPham;
  }

  // 1. Tạo Ảnh Sản Phẩm mới (Hỗ trợ truyền Transaction client)
  async create(payload, client = prisma) {
    if (!payload.id) {
      const lastASP = await client.anhsanpham.findFirst({
        orderBy: { id: "desc" },
      });
      const currentNumber = lastASP
        ? parseInt(lastASP.id.replace(/\D/g, ""), 10) || 0
        : 0;
      payload.id = `ASP${String(currentNumber + 1).padStart(4, "0")}`;
    }

    if (payload.laanhchinh === undefined) {
      payload.laanhchinh = false;
    }

    const data = this.extractAnhSanPhamData(payload);

    try {
      const existingCount = await client.anhsanpham.count({
        where: { masanpham: data.masanpham },
      });

      if (existingCount === 0) {
        // Nếu chưa có địa chỉ nào -> BẮT BUỘC là địa chỉ mặc định
        data.laanhchinh = true;
      }
      // Nếu ảnh mới là ảnh chính -> Hủy trạng thái ảnh chính của các ảnh cũ thuộc sản phẩm này
      if (data.laanhchinh) {
        await client.anhsanpham.updateMany({
          where: { masanpham: data.masanpham },
          data: { laanhchinh: false },
        });
      }

      return await client.anhsanpham.create({
        data: data,
      });
    } catch (error) {
      if (error.code === "P2003") {
        throw new Error("SAN_PHAM_KHONG_TON_TAI");
      }
      throw error;
    }
  }

  // 2. Tìm danh sách Ảnh Sản Phẩm theo bộ lọc
  async find(filterData) {
    const where = {};

    if (filterData.id) {
      where.id = filterData.id;
    }

    if (filterData.masanpham) {
      where.masanpham = filterData.masanpham;
    }

    if (filterData.laanhchinh !== undefined && filterData.laanhchinh !== "") {
      where.laanhchinh =
        filterData.laanhchinh === "true" || filterData.laanhchinh === true;
    }

    return await prisma.anhsanpham.findMany({
      where: where,
      orderBy: { id: "desc" },
      include: {
        sanpham: true,
      },
    });
  }

  // 4. Cập nhật Ảnh Sản Phẩm
  async update(id, payload) {
    const updateData = this.extractAnhSanPhamData(payload);
    delete updateData.id;

    try {
      // Nếu cập nhật thành ảnh chính -> Hủy các ảnh chính khác của sản phẩm đó
      if (updateData.laanhchinh && updateData.masanpham) {
        await prisma.anhsanpham.updateMany({
          where: { masanpham: updateData.masanpham },
          data: { laanhchinh: false },
        });
      }

      return await prisma.anhsanpham.update({
        where: { id: id },
        data: updateData,
      });
    } catch (error) {
      if (error.code === "P2025") {
        return null;
      }
      if (error.code === "P2003") {
        throw new Error("SAN_PHAM_KHONG_TON_TAI");
      }
      throw error;
    }
  }

  // 5. Xóa 1 Ảnh Sản Phẩm
  async delete(id) {
    try {
      return await prisma.anhsanpham.delete({
        where: { id: id },
      });
    } catch (error) {
      if (error.code === "P2025") {
        return null;
      }
      throw error;
    }
  }

  // 6. Xóa tất cả Ảnh Sản Phẩm
  async deleteAll() {
    const result = await prisma.anhsanpham.deleteMany({});
    return result.count;
  }

  // 7. Tìm chi tiết 1 Ảnh Sản Phẩm theo ID
  async findById(id) {
    return await prisma.anhsanpham.findUnique({
      where: { id: id },
      include: {
        sanpham: true,
      },
    });
  }

  async findBySanPham(masanpham) {
    return await prisma.anhsanpham.findMany({
      where: { masanpham: masanpham },
      orderBy: { id: "desc" },
      include: {
        sanpham: true,
      },
    });
  }
}

module.exports = AnhSanPhamService;
