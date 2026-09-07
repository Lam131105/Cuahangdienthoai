const prisma = require("../../prisma/prisma.js");

class DanhGiaService {
  // Trích xuất thuộc tính Đánh giá
  extractDanhGiaData(payload) {
    const danhGia = {
      id: payload.id,
      sosao:
        payload.sosao !== undefined ? parseInt(payload.sosao, 10) : undefined,
      noidung: payload.noidung,
      ngaydanhgia: payload.ngaydanhgia
        ? new Date(payload.ngaydanhgia)
        : undefined,
      masanpham: payload.masanpham,
      makhachhang: payload.makhachhang,
    };
    Object.keys(danhGia).forEach(
      (key) => danhGia[key] === undefined && delete danhGia[key],
    );
    return danhGia;
  }

  // 1. Tạo Đánh Giá mới (Tự sinh mã DG0001, DG0002...)
  async create(payload, client = prisma) {
    if (!payload.id) {
      const lastDG = await client.danhgia.findFirst({
        orderBy: { id: "desc" },
      });
      const currentNumber = lastDG
        ? parseInt(lastDG.id.replace(/\D/g, ""), 10) || 0
        : 0;
      payload.id = `DG${String(currentNumber + 1).padStart(4, "0")}`;
    }

    if (!payload.ngaydanhgia) {
      payload.ngaydanhgia = new Date();
    }

    const data = this.extractDanhGiaData(payload);

    try {
      return await client.danhgia.create({
        data: data,
        include: {
          sanpham: { select: { id: true, tensanpham: true } },
          khachhang: { select: { id: true, hoten: true, email: true } },
        },
      });
    } catch (error) {
      if (error.code === "P2003") {
        if (error.meta?.field_name?.includes("masanpham")) {
          throw new Error("SAN_PHAM_KHONG_TON_TAI");
        }
        throw new Error("KHACH_HANG_KHONG_TON_TAI");
      }
      if (error.code === "P2002") {
        throw new Error("KHACH_HANG_DA_DANH_GIA");
      }
      throw error;
    }
  }

  // 2. Tìm danh sách Đánh giá theo bộ lọc
  async find(filterData) {
    const where = {};

    if (filterData.id) where.id = filterData.id;
    if (filterData.masanpham) where.masanpham = filterData.masanpham;
    if (filterData.makhachhang) where.makhachhang = filterData.makhachhang;
    if (filterData.sosao) where.sosao = parseInt(filterData.sosao, 10);

    return await prisma.danhgia.findMany({
      where: where,
      orderBy: { ngaydanhgia: "desc" },
      include: {
        sanpham: { select: { id: true, tensanpham: true } },
        khachhang: { select: { id: true, hoten: true, email: true } },
      },
    });
  }

  // 3. Lấy đánh giá theo Sản Phẩm (Tính trung bình sao)
  async findBySanPham(masanpham) {
    const list = await prisma.danhgia.findMany({
      where: { masanpham: masanpham },
      orderBy: { ngaydanhgia: "desc" },
      include: {
        khachhang: { select: { id: true, hoten: true } },
      },
    });

    const aggregate = await prisma.danhgia.aggregate({
      where: { masanpham: masanpham },
      _avg: { sosao: true },
      _count: { id: true },
    });

    return {
      trungBinhSao: aggregate._avg.sosao
        ? parseFloat(aggregate._avg.sosao.toFixed(1))
        : 0,
      tongDanhGia: aggregate._count.id,
      danhsach: list,
    };
  }

  // 5. Cập nhật Đánh giá
  async update(id, payload) {
    if (!payload.ngaydanhgia) {
      payload.ngaydanhgia = new Date();
    }
    const updateData = this.extractDanhGiaData(payload);
    delete updateData.id;
    delete updateData.masanpham;
    delete updateData.makhachhang;

    try {
      return await prisma.danhgia.update({
        where: { id: id },
        data: updateData,
      });
    } catch (error) {
      if (error.code === "P2025") return null;
      throw error;
    }
  }

  // 6. Xóa 1 Đánh giá
  async delete(id) {
    try {
      return await prisma.danhgia.delete({
        where: { id: id },
      });
    } catch (error) {
      if (error.code === "P2025") return null;
      throw error;
    }
  }

  // 7. Xóa toàn bộ Đánh giá
  async deleteAll() {
    const result = await prisma.danhgia.deleteMany({});
    return result.count;
  }

  // 8. Tìm chi tiết Đánh giá theo ID
  async findById(id) {
    return await prisma.danhgia.findUnique({
      where: { id: id },
      include: {
        sanpham: { select: { id: true, tensanpham: true } },
        khachhang: { select: { id: true, hoten: true, email: true } },
      },
    });
  }
}

module.exports = DanhGiaService;
