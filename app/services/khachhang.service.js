const prisma = require("../../prisma/prisma.js");
const DiaChiService = require("./diachi.service");
const bcrypt = require("bcryptjs");

class KhachHangService {
  constructor() {
    this.diaChiService = new DiaChiService();
  }
  // Lọc lấy các trường thuộc tính hợp lệ theo schema Khachhang
  extractKhachHangData(payload) {
    const khachHang = {
      id: payload.id,
      hoten: payload.hoten,
      email: payload.email,
      matkhau: payload.matkhau,
      sodienthoai: payload.sodienthoai,
      ngaysinh: payload.ngaysinh ? new Date(payload.ngaysinh) : undefined,
      trangthai: payload.trangthai,
    };
    Object.keys(khachHang).forEach(
      (key) => khachHang[key] === undefined && delete khachHang[key],
    );
    return khachHang;
  }

  // 1. Tạo Khách hàng mới (Sử dụng Transaction để tự động tạo Địa chỉ mặc định nếu người dùng có gửi diachi lên)
  async create(payload) {
    try {
      return await prisma.$transaction(async (tx) => {
        if (payload.matkhau) {
          const salt = await bcrypt.genSalt(10);
          payload.matkhau = await bcrypt.hash(payload.matkhau, salt);
        }

        // Sinh mã ID khách hàng tự động (KH0001, KH0002...)
        if (!payload.id) {
          const lastKH = await tx.khachhang.findFirst({
            orderBy: { id: "desc" },
          });
          const currentNumber = lastKH
            ? parseInt(lastKH.id.replace(/\D/g, ""), 10) || 0
            : 0;
          payload.id = `KH${String(currentNumber + 1).padStart(4, "0")}`;
        }

        // Mặc định trạng thái tài khoản là "Hoạt động" nếu không chỉ định
        if (!payload.trangthai) {
          payload.trangthai = "Hoạt động";
        }

        const data = this.extractKhachHangData(payload);

        // Tạo bản ghi Khách hàng
        const newKhachHang = await tx.khachhang.create({
          data: data,
        });

        // Nếu client có truyền trường `diachi` trong body -> Tự động khởi tạo 1 Địa chỉ mặc định
        if (payload.diachi) {
          await this.diaChiService.create(
            {
              tennguoinhan: payload.hoten,
              sdtnguoinhan: payload.sodienthoai || "",
              diachichitiet: payload.diachi,
              lamacdinh: true,
              makhachhang: newKhachHang.id,
            },
            tx, // Truyền transaction vào đây để đảm bảo tính toàn vẹn dữ liệu
          );
        }

        return newKhachHang;
      });
    } catch (error) {
      if (error.code === "P2002") {
        throw new Error("EMAIL_DA_TON_TAI");
      }
      throw error;
    }
  }

  // 2. Tìm kiếm danh sách khách hàng
  async find(filterData) {
    const where = {};

    if (filterData.id) {
      where.id = filterData.id;
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

    return await prisma.khachhang.findMany({
      where: where,
      select: {
        id: true,
        hoten: true,
        email: true,
        sodienthoai: true,
        ngaysinh: true,
        trangthai: true,
        // Bảo mật: Không Select trường matkhau trả về API
        //  danhsach_diachi: true,
      },
    });
  }

  // 3. Cập nhật thông tin khách hàng
  async update(id, payload) {
    const updateData = this.extractKhachHangData(payload);
    delete updateData.id;

    try {
      return await prisma.khachhang.update({
        where: { id: id },
        data: updateData,
        select: {
          id: true,
          hoten: true,
          email: true,
          sodienthoai: true,
          ngaysinh: true,
          trangthai: true,
        },
      });
    } catch (error) {
      if (error.code === "P2025") {
        return null;
      }
      if (error.code === "P2002") {
        throw new Error("EMAIL_DA_TON_TAI");
      }
      throw error;
    }
  }

  // 4. Xóa một Khách hàng
  async delete(id) {
    try {
      return await prisma.khachhang.delete({
        where: { id: id },
      });
    } catch (error) {
      if (error.code === "P2025") {
        return null;
      }
      throw error;
    }
  }

  // 5. Xóa tất cả Khách hàng
  async deleteAll() {
    const result = await prisma.khachhang.deleteMany({});
    return result.count;
  }

  // 6. Tìm chi tiết một Khách hàng theo ID (Có kèm danh sách địa chỉ)
  async findById(id) {
    return await prisma.khachhang.findUnique({
      where: { id: id },
      select: {
        id: true,
        hoten: true,
        email: true,
        sodienthoai: true,
        ngaysinh: true,
        trangthai: true,
        //danhsach_diachi: true, // Trả kèm danh sách địa chỉ của khách hàng này
      },
    });
  }

  // Ví dụ hàm xử lý Đăng nhập
  async login(email, matkhauNhapVao) {
    // 1. Tìm người dùng theo email
    const user = await prisma.khachhang.findUnique({
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

module.exports = KhachHangService;
