const prisma = require("../../prisma/prisma.js");

class PhieuNhapService {
  extractData(payload) {
    const data = {
      id: payload.id,
      ngaynhap: payload.ngaynhap ? new Date(payload.ngaynhap) : undefined,
      tongtien:
        payload.tongtien !== undefined
          ? parseFloat(payload.tongtien)
          : undefined,
      manhacungcap: payload.manhacungcap,
      manhanvien: payload.manhanvien,
    };
    Object.keys(data).forEach(
      (key) => data[key] === undefined && delete data[key],
    );
    return data;
  }

  // 1. Tạo mới Phiếu Nhập (Tự động sinh mã PN0001, PN0002...)
  async create(payload, client = prisma) {
    if (!payload.id) {
      const last = await client.phieunhap.findFirst({
        orderBy: { id: "desc" },
      });
      const currentNumber = last
        ? parseInt(last.id.replace(/\D/g, ""), 10) || 0
        : 0;
      payload.id = `PN${String(currentNumber + 1).padStart(4, "0")}`;
    }

    // Đảm bảo mặc định ngày nhập = hiện tại & tongtien = 0 nếu không truyền
    payload.ngaynhap = payload.ngaynhap || new Date();
    payload.tongtien = payload.tongtien !== undefined ? payload.tongtien : 0;

    const data = this.extractData(payload);

    try {
      return await client.phieunhap.create({
        data: data,
        include: {
          nhacungcap: true,
          nhanvien: {
            select: {
              id: true,
              hoten: true,
              email: true,
              sodienthoai: true,
            },
          },
        },
      });
    } catch (error) {
      if (error.code === "P2003") {
        if (error.meta?.field_name?.includes("manhacungcap")) {
          throw new Error("NHA_CUNG_CAP_KHONG_TON_TAI");
        }
        throw new Error("NHAN_VIEN_KHONG_TON_TAI");
      }
      throw error;
    }
  }

  // 2. Tìm danh sách theo bộ lọc
  async find(filterData) {
    const where = {};

    if (filterData.id) where.id = filterData.id;
    if (filterData.manhacungcap) where.manhacungcap = filterData.manhacungcap;
    if (filterData.manhanvien) where.manhanvien = filterData.manhanvien;

    if (filterData.from || filterData.to) {
      where.ngaynhap = {};
      if (filterData.from) where.ngaynhap.gte = new Date(filterData.from);
      if (filterData.to) where.ngaynhap.lte = new Date(filterData.to);
    }

    return await prisma.phieunhap.findMany({
      where: where,
      include: {
        nhacungcap: true,
        nhanvien: {
          select: { id: true, hoten: true, email: true },
        },
      },
      orderBy: { ngaynhap: "desc" },
    });
  }

  // 3. Tìm theo Mã Nhà Cung Cấp
  async findByNhaCungCap(manhacungcap) {
    return await prisma.phieunhap.findMany({
      where: { manhacungcap: manhacungcap },
      include: {
        nhanvien: { select: { id: true, hoten: true } },
      },
      orderBy: { ngaynhap: "desc" },
    });
  }

  // 4. Tìm theo Mã Nhân Viên
  async findByNhanVien(manhanvien) {
    return await prisma.phieunhap.findMany({
      where: { manhanvien: manhanvien },
      include: {
        nhacungcap: true,
      },
      orderBy: { ngaynhap: "desc" },
    });
  }

  // 5. Cập nhật Phiếu Nhập
  async update(id, payload) {
    const updateData = this.extractData(payload);
    delete updateData.id;
    delete updateData.tongtien;

    try {
      return await prisma.phieunhap.update({
        where: { id: id },
        data: updateData,
        include: {
          nhacungcap: true,
          nhanvien: { select: { id: true, hoten: true } },
        },
      });
    } catch (error) {
      if (error.code === "P2025") return null;
      throw error;
    }
  }

  // 6. Xóa 1 Phiếu Nhập
  async delete(id) {
    try {
      return await prisma.phieunhap.delete({
        where: { id: id },
      });
    } catch (error) {
      if (error.code === "P2025") return null;
      throw error;
    }
  }

  // 7. Xóa tất cả
  async deleteAll() {
    const result = await prisma.phieunhap.deleteMany({});
    return result.count;
  }

  // 8. Tìm chi tiết theo ID
  async findById(id) {
    return await prisma.phieunhap.findUnique({
      where: { id: id },
      include: {
        nhacungcap: true,
        nhanvien: {
          select: { id: true, hoten: true, email: true, sodienthoai: true },
        },
      },
    });
  }
}

module.exports = PhieuNhapService;
