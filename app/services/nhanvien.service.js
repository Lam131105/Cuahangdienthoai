const prisma = require("../../prisma/prisma.js");
const bcrypt = require("bcryptjs");

class NhanVienService {
  // Trích xuất các thuộc tính hợp lệ của Nhân viên
  extractNhanVienData(payload) {
    const nhanVien = {
      id: payload.id,
      hoten: payload.hoten,
      matkhau: payload.matkhau,
      email: payload.email,
      sodienthoai: payload.sodienthoai,
      ngaysinh: payload.ngaysinh ? new Date(payload.ngaysinh) : undefined,
      trangthai: payload.trangthai,
      vaitroid: payload.vaitroid,
    };
    Object.keys(nhanVien).forEach(
      (key) => nhanVien[key] === undefined && delete nhanVien[key],
    );
    return nhanVien;
  }

  // 1. Tạo Nhân viên mới (Hỗ trợ truyền Transaction client)
  async create(payload, client = prisma) {
    if (payload.matkhau) {
      const salt = await bcrypt.genSalt(10);
      payload.matkhau = await bcrypt.hash(payload.matkhau, salt);
    }
    if (!payload.id) {
      const lastNV = await client.nhanvien.findFirst({
        orderBy: { id: "desc" },
      });
      const currentNumber = lastNV
        ? parseInt(lastNV.id.replace(/\D/g, ""), 10) || 0
        : 0;
      payload.id = `NV${String(currentNumber + 1).padStart(4, "0")}`;
    }
    if (!payload.trangthai) {
      payload.trangthai = "Hoạt động";
    }
    const data = this.extractNhanVienData(payload);

    try {
      return await client.nhanvien.create({
        data: data,
      });
    } catch (error) {
      if (error.code === "P2002") {
        throw new Error("EMAIL_DA_TON_TAI");
      }
      if (error.code === "P2003") {
        throw new Error("VAI_TRO_KHONG_TON_TAI");
      }
      throw error;
    }
  }

  // 2. Tìm kiếm danh sách Nhân viên theo bộ lọc
  async find(filterData) {
    const where = {};

    if (filterData.id) {
      where.id = filterData.id;
    }

    if (filterData.vaitroid) {
      where.vaitroid = filterData.vaitroid;
    }

    if (filterData.hoten) {
      where.hoten = {
        contains: filterData.hoten,
        mode: "insensitive",
      };
    }

    if (filterData.email) {
      where.email = {
        contains: filterData.email,
        mode: "insensitive",
      };
    }

    if (filterData.sodienthoai) {
      where.sodienthoai = {
        contains: filterData.sodienthoai,
      };
    }

    return await prisma.nhanvien.findMany({
      where: where,
      select: {
        id: true,
        hoten: true,
        email: true,
        sodienthoai: true,
        ngaysinh: true,
        vaitroid: true,
        trangthai: true,
        //        vaitro: true, // Lấy kèm thông tin vai trò
        // Không select trường matkhau
      },
    });
  }

  // 4. Cập nhật thông tin Nhân viên
  async update(id, payload) {
    const updateData = this.extractNhanVienData(payload);
    delete updateData.id;

    try {
      return await prisma.nhanvien.update({
        where: { id: id },
        data: updateData,
        select: {
          id: true,
          hoten: true,
          email: true,
          sodienthoai: true,
          ngaysinh: true,
          trangthai: true,
          vaitroid: true,
        },
      });
    } catch (error) {
      if (error.code === "P2025") {
        return null;
      }
      if (error.code === "P2002") {
        throw new Error("EMAIL_DA_TON_TAI");
      }
      if (error.code === "P2003") {
        throw new Error("VAI_TRO_KHONG_TON_TAI");
      }
      throw error;
    }
  }

  // 5. Xóa một Nhân viên
  async delete(id) {
    try {
      return await prisma.nhanvien.delete({
        where: { id: id },
      });
    } catch (error) {
      if (error.code === "P2025") {
        return null;
      }
      throw error;
    }
  }

  // 6. Xóa tất cả Nhân viên
  async deleteAll() {
    const result = await prisma.nhanvien.deleteMany({});
    return result.count;
  }

  // 7. Tìm chi tiết một Nhân viên theo ID
  async findById(id) {
    return await prisma.nhanvien.findUnique({
      where: { id: id },
      select: {
        id: true,
        hoten: true,
        email: true,
        sodienthoai: true,
        ngaysinh: true,
        trangthai: true,
        vaitroid: true,

        //       vaitro: true,
      },
    });
  }

  // Ví dụ hàm xử lý Đăng nhập
  async login(email, matkhauNhapVao) {
    // 1. Tìm người dùng theo email
    const user = await prisma.nhanvien.findUnique({
      where: { email: email },
    });

    if (!user) {
      throw new Error("TAI_KHOAN_KHONG_TON_TAI");
    }
    // 2. So sánh mật khẩu người dùng nhập với mật khẩu đã băm trong database
    const isMatch = await bcrypt.compare(matkhauNhapVao, user.matkhau);

    if (!isMatch) {
      throw new Error("MAT_KHAU_KHONG_CHINH_XAC");
    }
    if (user.trangthai === "Khóa") {
      throw new Error("TAI_KHOAN_BI_KHOA");
    }

    // 3. Đúng mật khẩu -> Trả về thông tin đăng nhập thành công (loại bỏ trường matkhau)
    const { matkhau, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = NhanVienService;
