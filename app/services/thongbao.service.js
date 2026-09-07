const prisma = require("../../prisma/prisma.js");

class ThongBaoService {
  // Trích xuất dữ liệu Thông báo
  extractThongBaoData(payload) {
    const thongBao = {
      id: payload.id,
      tieude: payload.tieude,
      noidung: payload.noidung,
      loaithongbao: payload.loaithongbao,
      duongdan: payload.duongdan,
      ngay: payload.ngay ? new Date(payload.ngay) : undefined,
      makhachhang: payload.makhachhang,
    };
    Object.keys(thongBao).forEach(
      (key) => thongBao[key] === undefined && delete thongBao[key],
    );
    return thongBao;
  }

  // 1. Tạo Thông Báo mới (Tự sinh mã TB0001, TB0002...)
  async create(payload, client = prisma) {
    if (!payload.id) {
      const lastTB = await client.thongbao.findFirst({
        orderBy: { id: "desc" },
      });
      const currentNumber = lastTB
        ? parseInt(lastTB.id.replace(/\D/g, ""), 10) || 0
        : 0;
      payload.id = `TB${String(currentNumber + 1).padStart(4, "0")}`;
    }

    // Nếu không truyền ngày, dùng thời điểm hiện tại
    if (!payload.ngay) {
      payload.ngay = new Date();
    }

    const data = this.extractThongBaoData(payload);

    try {
      return await client.thongbao.create({
        data: data,
        include: {
          khachhang: {
            select: {
              id: true,
              hoten: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      if (error.code === "P2003") {
        throw new Error("KHACH_HANG_KHONG_TON_TAI");
      }
      throw error;
    }
  }

  // 2. Tìm danh sách Thông báo theo bộ lọc
  async find(filterData) {
    const where = {};

    if (filterData.id) where.id = filterData.id;
    if (filterData.makhachhang) where.makhachhang = filterData.makhachhang;
    if (filterData.loaithongbao) where.loaithongbao = filterData.loaithongbao;

    if (filterData.tieude) {
      where.tieude = {
        contains: filterData.tieude,
        mode: "insensitive",
      };
    }

    return await prisma.thongbao.findMany({
      where: where,
      orderBy: { ngay: "desc" }, // Mới nhất xếp lên đầu
      include: {
        khachhang: {
          select: {
            id: true,
            hoten: true,
            email: true,
          },
        },
      },
    });
  }

  // 3. Lấy tất cả thông báo thuộc một Khách hàng
  async findByKhachHang(makhachhang) {
    return await prisma.thongbao.findMany({
      where: { makhachhang: makhachhang },
      orderBy: { ngay: "desc" },
    });
  }

  // 4. Cập nhật Thông báo
  async update(id, payload) {
    const updateData = this.extractThongBaoData(payload);
    delete updateData.id;

    try {
      return await prisma.thongbao.update({
        where: { id: id },
        data: updateData,
      });
    } catch (error) {
      if (error.code === "P2025") return null;
      if (error.code === "P2003") throw new Error("KHACH_HANG_KHONG_TON_TAI");
      throw error;
    }
  }

  // 5. Xóa 1 Thông báo
  async delete(id) {
    try {
      return await prisma.thongbao.delete({
        where: { id: id },
      });
    } catch (error) {
      if (error.code === "P2025") return null;
      throw error;
    }
  }

  // 6. Xóa tất cả Thông báo
  async deleteAll() {
    const result = await prisma.thongbao.deleteMany({});
    return result.count;
  }

  // 7. Tìm chi tiết 1 Thông báo theo ID
  async findById(id) {
    return await prisma.thongbao.findUnique({
      where: { id: id },
      include: {
        khachhang: {
          select: {
            id: true,
            hoten: true,
            email: true,
          },
        },
      },
    });
  }
}

module.exports = ThongBaoService;
