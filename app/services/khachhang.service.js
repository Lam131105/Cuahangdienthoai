const prisma = require("../../prisma/prisma.js");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(
  "123250462571-d7bggil4n0be4kpp5pkgcor11mssntgc.apps.googleusercontent.com",
);
const DiaChiService = require("./diachi.service");
const GioHangService = require("./giohang.service");
const bcrypt = require("bcryptjs");

class KhachHangService {
  constructor() {
    this.diaChiService = new DiaChiService();
    this.gioHangService = new GioHangService();
  }
  // Lọc lấy các trường thuộc tính hợp lệ theo schema Khachhang
  extractKhachHangData(payload) {
    const khachHang = {
      id: payload.id,
      hoten: payload.hoten,
      email: payload.email,
      matkhau: payload.matkhau,
      sodienthoai: payload.sodienthoai,
      duongdananh: payload.duongdananh,
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

        // 1. Tạo bản ghi Khách hàng
        const newKhachHang = await tx.khachhang.create({
          data: data,
        });

        // 2. TỰ ĐỘNG KHỞI TẠO GIỎ HÀNG CHO KHÁCH HÀNG MỚI
        const newGioHang = await this.gioHangService.create(
          { khachhangid: newKhachHang.id },
          tx, // Truyền 'tx' để đảm bảo giỏ hàng được tạo chung 1 transaction
        );

        // 3. Nếu client có truyền trường `diachi` trong body -> Tự động khởi tạo 1 Địa chỉ mặc định
        if (payload.diachi) {
          await this.diaChiService.create(
            {
              tennguoinhan: payload.hoten,
              sdtnguoinhan: payload.sodienthoai || "",
              diachichitiet: payload.diachi,
              lamacdinh: true,
              makhachhang: newKhachHang.id,
            },
            tx,
          );
        }

        // Trả về dữ liệu Khách hàng kèm theo Giỏ hàng vừa tạo
        return {
          ...newKhachHang,
          giohang: newGioHang,
        };
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
        duongdananh: true,
        ngaysinh: true,
        trangthai: true,
        providerid: true,
        provider: true,
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
          duongdananh: true,
          ngaysinh: true,
          trangthai: true,
          providerid: true,
          provider: true,
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
        duongdananh: true,
        ngaysinh: true,
        trangthai: true,
        providerid: true,
        provider: true,
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

  async loginWithGoogle(googleToken) {
    // 1. Xác thực ID Token với Google
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience:
        "123250462571-d7bggil4n0be4kpp5pkgcor11mssntgc.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();
    const {
      sub: providerid,
      email,
      name: hoten,
      picture: googleImageUrl,
    } = payload;

    // 2. Tìm khách hàng trong DB
    let user = await prisma.khachhang.findFirst({
      where: {
        OR: [{ providerid: providerid }, { email: email }],
      },
    });

    // 3. Nếu chưa tồn tại -> Tạo tài khoản mới & Lưu ảnh về Server
    if (!user) {
      const lastUser = await prisma.khachhang.findFirst({
        orderBy: { id: "desc" },
      });
      const nextNum = lastUser
        ? (parseInt(lastUser.id.replace(/\D/g, ""), 10) || 0) + 1
        : 1;
      const newId = `KH${String(nextNum).padStart(4, "0")}`;

      // 🟢 Tải và lưu ảnh về public/uploads/khachhang
      let localAvatarPath = null;
      if (googleImageUrl) {
        const fileName = `khachhang-${Date.now()}-${newId}.jpg`;
        localAvatarPath = await this.saveSocialAvatar(googleImageUrl, fileName);
      }

      user = await prisma.khachhang.create({
        data: {
          id: newId,
          hoten: hoten,
          email: email,
          duongdananh: localAvatarPath, // 🟢 Đường dẫn nội bộ: /uploads/khachhang/khachhang-1725800000-KH0001.jpg
          provider: "google",
          providerid: providerid,
          trangthai: "Hoạt động",
        },
      });
    } else if (!user.providerid) {
      // Nếu user cũ chưa có avatar, tiến hành tải ảnh về lưu
      let localAvatarPath = user.duongdananh;
      if (!localAvatarPath && googleImageUrl) {
        const fileName = `khachhang-${Date.now()}-${user.id}.jpg`;
        localAvatarPath = await this.saveSocialAvatar(googleImageUrl, fileName);
      }

      user = await prisma.khachhang.update({
        where: { id: user.id },
        data: {
          provider: "google",
          providerid: providerid,
          duongdananh: localAvatarPath,
        },
      });
    }

    if (user.trangthai === "Khóa") {
      throw new Error("TAI_KHOAN_BI_KHOA");
    }

    const { matkhau, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async loginWithFacebook(facebookToken) {
    // 1. Gọi Graph API của Facebook để lấy thông tin người dùng
    let fbRes;
    try {
      fbRes = await axios.get("https://graph.facebook.com/v19.0/me", {
        params: {
          fields: "id,name,email,picture.type(large)",
          access_token: facebookToken,
        },
      });
    } catch (err) {
      throw new Error("XAC_THUC_FACEBOOK_THAT_BAI");
    }

    const { id: providerid, name: hoten, picture } = fbRes.data;
    const fbImageUrl = picture?.data?.url || null;

    // Xử lý trường hợp Facebook không trả về email (đăng ký FB bằng SĐT)
    const email = fbRes.data.email || `${providerid}@facebook.com`;

    // 2. Tìm khách hàng trong DB
    let user = await prisma.khachhang.findFirst({
      where: {
        OR: [{ providerid: providerid }, { email: email }],
      },
    });

    // 3. Nếu chưa tồn tại -> Tạo tài khoản mới & Lưu ảnh về Server
    if (!user) {
      const lastUser = await prisma.khachhang.findFirst({
        orderBy: { id: "desc" },
      });
      const nextNum = lastUser
        ? (parseInt(lastUser.id.replace(/\D/g, ""), 10) || 0) + 1
        : 1;
      const newId = `KH${String(nextNum).padStart(4, "0")}`;

      // 🟢 Tải và lưu ảnh Facebook về public/uploads/khachhang
      let localAvatarPath = null;
      if (fbImageUrl) {
        const fileName = `khachhang-fb-${Date.now()}-${newId}.jpg`;
        localAvatarPath = await this.saveSocialAvatar(fbImageUrl, fileName);
      }

      user = await prisma.khachhang.create({
        data: {
          id: newId,
          hoten: hoten,
          email: email,
          duongdananh: localAvatarPath, // 🟢 Đường dẫn nội bộ
          provider: "facebook",
          providerid: providerid,
          trangthai: "Hoạt động",
        },
      });
    } else if (!user.providerid) {
      // Nếu user cũ chưa có avatar, tiến hành tải ảnh về lưu
      let localAvatarPath = user.duongdananh;
      if (!localAvatarPath && fbImageUrl) {
        const fileName = `khachhang-fb-${Date.now()}-${user.id}.jpg`;
        localAvatarPath = await this.saveSocialAvatar(fbImageUrl, fileName);
      }

      user = await prisma.khachhang.update({
        where: { id: user.id },
        data: {
          provider: "facebook",
          providerid: providerid,
          duongdananh: localAvatarPath,
        },
      });
    }

    if (user.trangthai === "Khóa") {
      throw new Error("TAI_KHOAN_BI_KHOA");
    }

    const { matkhau, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async saveSocialAvatar(imageUrl, filename) {
    try {
      // 🟢 process.cwd() sẽ lấy đường dẫn gốc của Server (nơi chứa file package.json)
      const uploadDir = path.join(process.cwd(), "public/uploads/khachhang");

      // Tự động tạo thư mục nếu chưa có
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);

      // Tải ảnh từ Google
      const response = await axios({
        url: imageUrl,
        method: "GET",
        responseType: "stream",
      });

      return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on("finish", () => {
          resolve(`/uploads/khachhang/${filename}`);
        });

        writer.on("error", (err) => {
          console.error("❌ Lỗi khi ghi file ảnh:", err);
          reject(err);
        });
      });
    } catch (error) {
      console.error("❌ Lỗi khi tải ảnh Google Avatar:", error.message);
      return null;
    }
  }
}

module.exports = KhachHangService;
