const prisma = require("../../prisma/prisma.js");

class ThongBaoService {
  // Trích xuất dữ liệu Thông báo
  extractThongBaoData(payload) {
    const thongBao = {
      id: payload.id,
      nhomid: payload.nhomid,
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

  async generateNextId(client = prisma) {
    const lastTB = await client.thongbao.findFirst({
      orderBy: { id: "desc" },
    });
    const currentNumber = lastTB
      ? parseInt(lastTB.id.replace(/\D/g, ""), 10) || 0
      : 0;
    return `TB${String(currentNumber + 1).padStart(4, "0")}`;
  }

  // Hàm phụ: Tự sinh mã NHOMID (NTB0001, NTB0002...)
  async generateNextNhomId(client = prisma) {
    const lastNhom = await client.thongbao.findFirst({
      where: { nhomid: { not: null } },
      orderBy: { nhomid: "desc" },
    });
    const currentNumber = lastNhom?.nhomid
      ? parseInt(lastNhom.nhomid.replace(/\D/g, ""), 10) || 0
      : 0;
    return `NTB${String(currentNumber + 1).padStart(4, "0")}`;
  }

  // 1. Tạo 1 Thông Báo mới
  async create(payload, client = prisma) {
    // Tự sinh ID nếu chưa có
    if (!payload.id) {
      payload.id = await this.generateNextId(client);
    }

    // Tự sinh NHOMID nếu chưa có
    if (!payload.nhomid) {
      payload.nhomid = await this.generateNextNhomId(client);
    }

    // Nếu không truyền ngày, dùng thời điểm hiện tại
    if (!payload.ngay) {
      payload.ngay = new Date();
    }

    const data = { ...this.extractThongBaoData(payload), daxem: false };

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

  // 2. Tạo Thông Báo gửi tới TẤT CẢ Khách hàng
  async createAll(payload, client = prisma) {
    // Lấy danh sách tất cả ID khách hàng
    const allKhachHang = await client.khachhang.findMany({
      select: { id: true },
    });

    if (!allKhachHang || allKhachHang.length === 0) {
      return { count: 0, message: "KHONG_CO_KHACH_HANG" };
    }

    // Chạy trong Transaction để đảm bảo tính đồng bộ
    return await client.$transaction(async (tx) => {
      // Tự sinh 1 mã nhomid dùng chung cho đợt thông báo này
      const nhomid = payload.nhomid || (await this.generateNextNhomId(tx));

      // Lấy số ID bắt đầu
      const lastTB = await tx.thongbao.findFirst({
        orderBy: { id: "desc" },
      });
      let currentNumber = lastTB
        ? parseInt(lastTB.id.replace(/\D/g, ""), 10) || 0
        : 0;

      const now = payload.ngay ? new Date(payload.ngay) : new Date();

      // Chuẩn bị mảng record thông báo cho từng khách hàng
      const listData = allKhachHang.map((kh) => {
        currentNumber += 1;
        return {
          id: `TB${String(currentNumber).padStart(4, "0")}`,
          nhomid: nhomid,
          tieude: payload.tieude,
          noidung: payload.noidung,
          loaithongbao: payload.loaithongbao,
          duongdan: payload.duongdan,
          ngay: now,
          makhachhang: kh.id,
          daxem: false,
        };
      });

      // Tạo hàng loạt vào DB
      const result = await tx.thongbao.createMany({
        data: listData,
      });

      return {
        count: result.count,
        nhomid: nhomid,
      };
    });
  }

  // 2. Tìm danh sách Thông báo theo bộ lọc
  // async find(filterData) {
  //   const where = {};

  //   if (filterData.id) where.id = filterData.id;
  //   if (filterData.makhachhang) where.makhachhang = filterData.makhachhang;
  //   if (filterData.loaithongbao) where.loaithongbao = filterData.loaithongbao;

  //   if (filterData.tieude) {
  //     where.tieude = {
  //       contains: filterData.tieude,
  //       mode: "insensitive",
  //     };
  //   }

  //   return await prisma.thongbao.findMany({
  //     where: where,
  //     orderBy: { ngay: "desc" }, // Mới nhất xếp lên đầu
  //     include: {
  //       khachhang: {
  //         select: {
  //           id: true,
  //           hoten: true,
  //           email: true,
  //         },
  //       },
  //     },
  //   });
  // }

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

    // 1. Lấy toàn bộ danh sách thông báo thỏa điều kiện
    const list = await prisma.thongbao.findMany({
      where: where,
      orderBy: { ngay: "desc" },
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

    // 2. Gom nhóm theo nhomid
    const groupedMap = new Map();

    for (const item of list) {
      // Nếu có nhomid thì dùng nhomid làm key, nếu không có thì dùng id của chính bản ghi đó
      const groupKey = item.nhomid || item.id;

      if (!groupedMap.has(groupKey)) {
        groupedMap.set(groupKey, {
          ...item,
          // Lưu lại danh sách tất cả khách hàng nhận được thông báo này (dùng nếu cần)
          // danhSachKhachHang: item.makhachhang || [],
          danhSachKhachHang: item.makhachhang ? [item.khachhang.id] : [],
          soLuongNguoiNhan: 1,
        });
      } else {
        const existing = groupedMap.get(groupKey);
        existing.soLuongNguoiNhan += 1;
        if (item.makhachhang) {
          existing.danhSachKhachHang.push(item.khachhang.id);
        }

        // Nếu có từ 2 khách hàng trở lên trùng nhomid -> Đổi makhachhang thành "ALL"
        existing.makhachhang = "ALL";
        existing.khachhang = null; // Bỏ thông tin 1 khách hàng đơn lẻ
      }
    }

    return Array.from(groupedMap.values());
  }

  // 3. Lấy tất cả thông báo thuộc một Khách hàng
  async findByKhachHang(makhachhang) {
    return await prisma.thongbao.findMany({
      where: { makhachhang: makhachhang },
      orderBy: { id: "desc" },
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
    // 1. Tìm thông báo gốc theo ID
    const thongbao = await prisma.thongbao.findUnique({
      where: { id: id },
    });

    if (!thongbao) {
      return null; // Hoặc throw new Error("THONG_BAO_KHONG_TON_TAI");
    }

    // 2. Lấy danh sách các bản ghi cùng nhomid (chỉ SELECT trường cần thiết của khách hàng để tối ưu DB)
    const listInGroup = await prisma.thongbao.findMany({
      where: {
        nhomid: thongbao.nhomid || thongbao.id,
      },
      select: {
        id: true, // ID bản ghi thông báo lẻ
        daxem: true, // Trạng thái đã xem của từng người
        makhachhang: true,
        khachhang: {
          select: {
            id: true,
            hoten: true,
            email: true,
          },
        },
      },
    });

    // 3. Chuẩn hóa dữ liệu trả về: Thông tin chung ở ngoài, danh sách khách hàng ở trong
    return {
      nhomid: thongbao.nhomid,
      tieude: thongbao.tieude,
      noidung: thongbao.noidung,
      loaithongbao: thongbao.loaithongbao,
      duongdan: thongbao.duongdan,
      ngay: thongbao.ngay,
      tongso: listInGroup.length,
      dskhachhang: listInGroup.map((item) => ({
        thongbaoid: item.id,
        daxem: item.daxem,
        ...item.khachhang,
      })),
    };
  }

  // 4. Cập nhật Thông báo
  async updateSeen(id) {
    try {
      return await prisma.thongbao.update({
        where: { id: id },
        data: {
          daxem: true, // 🟢 Bắt buộc phải nằm trong object 'data'
        },
      });
    } catch (error) {
      if (error.code === "P2025") return null; // Mã lỗi P2025: Record cần update không tồn tại
      throw error;
    }
  }

  // Helper: Tự động sinh tiêu đề & nội dung theo trạng thái đơn hàng
  getOrderNotificationContent(trangthai, madonhang) {
    const maDHText = madonhang ? ` #${madonhang}` : "";

    switch (trangthai) {
      case "Chờ thanh toán":
        return {
          tieude: "Đặt hàng thành công",
          noidung: `Quý khách vui lòng thánh toán trực tuyến đơn hàng${maDHText} trong thời hạn cho phép.`,
        };
      case "Chờ duyệt":
        return {
          tieude: "Đặt hàng thành công",
          noidung: `Đơn hàng${maDHText} của bạn đã được khởi tạo và đang chờ xác nhận.`,
        };
      case "Chờ vận chuyển":
        return {
          tieude: "Đơn hàng đã được xác nhận",
          noidung: `Đơn hàng${maDHText} đã được shop xác nhận và đang chuẩn bị hàng.`,
        };
      case "Đang vận chuyển":
        return {
          tieude: "Đơn hàng đang được giao",
          noidung: `Đơn hàng${maDHText} đang trên đường giao đến bạn. Vui lòng chú ý điện thoại!`,
        };
      case "Đã hoàn thành":
        return {
          tieude: "Giao hàng thành công",
          noidung: `Đơn hàng${maDHText} đã giao thành công. Cảm ơn bạn đã mua hàng!`,
        };
      case "Đã hủy":
        return {
          tieude: "Đơn hàng đã bị hủy",
          noidung: `Đơn hàng${maDHText} của bạn đã bị hủy. Vui lòng liên hệ hỗ trợ nếu có thắc mắc.`,
        };
      default:
        return {
          tieude: "Cập nhật đơn hàng",
          noidung: `Đơn hàng${maDHText} của bạn vừa được cập nhật trạng thái: ${trangthai}.`,
        };
    }
  }

  // 2. Tạo Thông Báo Đơn Hàng Tự Động
  async createOrderNotification(
    { makhachhang, madonhang, trangthai, duongdan },
    client = prisma,
  ) {
    if (!makhachhang || !trangthai) {
      throw new Error("THIEU_THONG_TIN_BAT_BUOC");
    }

    // Lấy tiêu đề và nội dung tự động dựa theo trạng thái
    const { tieude, noidung } = this.getOrderNotificationContent(
      trangthai,
      madonhang,
    );

    // Đường dẫn mặc định trỏ về chi tiết đơn hàng nếu không truyền vào
    const defaultUrl = `/donhang/${madonhang}`;

    const payload = {
      makhachhang: makhachhang,
      loaithongbao: "Đơn hàng",
      tieude: tieude,
      noidung: noidung,
      duongdan: defaultUrl,
    };

    // Tận dụng lại hàm create() sẵn có để kế thừa logic sinh mã TBxxxx và validate
    return await this.create(payload, client);
  }

  // 2. Tạo Thông Báo Đơn Hàng Tự Động
  async createVoucherNotification(
    { makhachhang, tenphieu, soluong, mocchi },
    client = prisma,
  ) {
    if (!makhachhang || !tenphieu || !soluong || !mocchi) {
      throw new Error("THIEU_THONG_TIN_BAT_BUOC");
    }
    const formattedMocChi = mocchi
      ? new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
          maximumFractionDigits: 0,
        }).format(mocchi)
      : null;

    const payload = {
      makhachhang: makhachhang,
      loaithongbao: "Ưu đãi",
      tieude: `🎉 Bạn nhận được ${soluong} Voucher mới!`,
      noidung: `Chúc mừng bạn đã nhận được ${soluong} phiếu giảm giá '${tenphieu}' nhờ đạt mốc chi tiêu ${formattedMocChi}. Kiểm tra ngay Ví Voucher để sử dụng!`,
      duongdan: "/thongtintaikhoan?tab=ProfileVouchers",
    };

    // Tận dụng lại hàm create() sẵn có để kế thừa logic sinh mã TBxxxx và validate
    return await this.create(payload, client);
  }
}
module.exports = ThongBaoService;
