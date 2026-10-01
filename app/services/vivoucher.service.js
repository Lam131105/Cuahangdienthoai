const prisma = require("../../prisma/prisma.js");
const ThongBaoService = require("./thongbao.service");

class ViVoucherService {
  constructor() {
    this.thongBaoService = new ThongBaoService();
  }
  extractData(payload) {
    const data = {
      id: payload.id,
      trangthai: payload.trangthai || "Chưa dùng",
      makhachhang: payload.makhachhang,
      maphieugiamgia: payload.maphieugiamgia,
    };
    Object.keys(data).forEach(
      (key) => data[key] === undefined && delete data[key],
    );
    return data;
  }

  // 1. Thêm 1 Voucher vào ví (Tự sinh mã VVC0001, VVC0002...)
  async create(payload, client = prisma) {
    // 1. Kiểm tra mã phiếu giảm giá bắt buộc
    if (!payload.maphieugiamgia) {
      throw new Error("PHIEU_GIAM_GIA_KHONG_TON_TAI");
    }

    // 2. Lấy thông tin phiếu giảm giá để lấy thuộc tính `thoihan` (tính bằng số ngày)
    const phieuGiamGia = await client.phieugiamgia.findUnique({
      where: { id: payload.maphieugiamgia },
    });

    if (!phieuGiamGia) {
      throw new Error("PHIEU_GIAM_GIA_KHONG_TON_TAI");
    }

    // 3. Tự sinh mã VVC nếu chưa có
    if (!payload.id) {
      const last = await client.vivoucher.findFirst({
        orderBy: { id: "desc" },
      });
      const currentNumber = last
        ? parseInt(last.id.replace(/\D/g, ""), 10) || 0
        : 0;
      payload.id = `VVC${String(currentNumber + 1).padStart(4, "0")}`;
    }

    // 4. Tính toán ngày bắt đầu và ngày kết thúc
    const ngaybatdau = new Date(); // Ngày hiện tại
    const ngayketthuc = new Date(ngaybatdau);

    // Lấy số ngày từ `thoihan` (mặc định 0 nếu không tìm thấy)
    const soNgayThoiHan = parseInt(phieuGiamGia.thoihan, 10) || 0;
    ngayketthuc.setDate(ngayketthuc.getDate() + soNgayThoiHan);

    // 5. Chuẩn bị dữ liệu lưu vào DB
    const data = {
      ...this.extractData(payload),
      ngaybatdau: ngaybatdau,
      ngayketthuc: ngayketthuc,
    };

    try {
      return await client.vivoucher.create({
        data: data,
        include: {
          phieugiamgia: true,
          khachhang: true,
        },
      });
    } catch (error) {
      if (error.code === "P2003") {
        if (error.meta?.field_name?.includes("makhachhang")) {
          throw new Error("KHACH_HANG_KHONG_TON_TAI");
        }
        throw new Error("PHIEU_GIAM_GIA_KHONG_TON_TAI");
      }
      throw error;
    }
  }

  // 3. Tìm kiếm theo bộ lọc
  async find(filterData) {
    const where = {};

    if (filterData.id) where.id = filterData.id;
    if (filterData.makhachhang) where.makhachhang = filterData.makhachhang;
    if (filterData.trangthai) where.trangthai = filterData.trangthai;

    return await prisma.vivoucher.findMany({
      where: where,
      //   include: {
      //     phieugiamgia: true,
      //     khachhang: true,
      //   },
    });
  }

  // 4. Lấy danh sách ví voucher theo Mã Khách Hàng
  // Lấy danh sách phiếu giảm giá của Khách hàng (Đã gom nhóm & Đếm số lượng)

  async findByKhachHang(makhachhang) {
    const now = new Date();
    // 1. Truy vấn toàn bộ voucher trong ví của khách hàng
    const userVouchers = await prisma.vivoucher.findMany({
      where: {
        makhachhang: makhachhang,
        trangthai: "Chưa dùng",
        ngaybatdau: { lte: now },
        ngayketthuc: { gte: now },
      },
      include: {
        phieugiamgia: true,
      },
    });

    // 3. Chuyển Map thành Array để trả về cho Frontend
    return userVouchers;
  }

  // 5. Đổi trạng thái Voucher (Dùng / Hoàn trả khi hủy đơn)
  async useVoucher(id) {
    // 1. Kiểm tra sự tồn tại của Voucher
    const voucher = await prisma.vivoucher.findUnique({
      where: { id: id },
    });

    if (!voucher) return null;

    // 2. Tự động xác định trạng thái mới (Toggle)
    // Nếu "Chưa dùng" -> đổi thành "Đã dùng" (Áp dụng giảm giá)
    // Ngược lại -> đổi về "Chưa dùng" (Khách hàng hủy đơn / Hoàn phiếu)
    const newStatus =
      voucher.trangthai === "Chưa dùng" ? "Đã dùng" : "Chưa dùng";

    return await prisma.vivoucher.update({
      where: { id: id },
      data: { trangthai: newStatus },
      include: { phieugiamgia: true },
    });
  }

  // 6. Cập nhật
  async update(id, payload) {
    const updateData = this.extractData(payload);
    delete updateData.id;

    try {
      return await prisma.vivoucher.update({
        where: { id: id },
        data: updateData,
        include: { phieugiamgia: true },
      });
    } catch (error) {
      if (error.code === "P2025") return null;
      throw error;
    }
  }

  // 7. Xóa 1 voucher
  async delete(id) {
    try {
      return await prisma.vivoucher.delete({
        where: { id: id },
      });
    } catch (error) {
      if (error.code === "P2025") return null;
      throw error;
    }
  }

  // 8. Xóa toàn bộ
  async deleteAll() {
    const result = await prisma.vivoucher.deleteMany({});
    return result.count;
  }

  // 9. Tìm chi tiết theo ID
  async findById(id) {
    return await prisma.vivoucher.findUnique({
      where: { id: id },
      include: {
        phieugiamgia: true,
        khachhang: true,
      },
    });
  }

  async rewardOnPurchase(makhachhang, tongchi, sotientronghoadonnay) {
    const currentTotal = parseFloat(tongchi);
    const invoiceAmount = parseFloat(sotientronghoadonnay);
    const previousTotal = currentTotal - invoiceAmount;

    // 1. Tìm các mốc điều kiện khách hàng vừa vượt qua
    const eligibleConditions = await prisma.dieukiennhanvoucher.findMany({
      where: {
        mocchitoithieu: {
          gt: previousTotal, // > chi tiêu cũ
          lte: currentTotal, // <= chi tiêu mới
        },
      },
      include: {
        phieugiamgia: true, // 🟢 Đã include phieugiamgia tại đây
      },
    });

    if (eligibleConditions.length === 0) {
      return {
        soVoucherDaTang: 0,
        danhsachVoucherDaTang: [],
      };
    }

    const createdVouchers = [];
    const rewardedDetails = [];

    // 2. Chạy Transaction để cấp phát Ví Voucher
    await prisma.$transaction(async (tx) => {
      for (const condition of eligibleConditions) {
        const quantity = condition.soluongnhan;

        for (let i = 0; i < quantity; i++) {
          const newVoucher = await this.create(
            {
              makhachhang: makhachhang,
              maphieugiamgia: condition.maphieugiamgia,
              trangthai: "Chưa dùng",
            },
            tx,
          );

          createdVouchers.push(newVoucher);
        }

        rewardedDetails.push({
          madieukien: condition.id,
          mocchitoithieu: Number(condition.mocchitoithieu),
          tenphieu: condition.phieugiamgia?.tenphieu,
          soluong: quantity,
        });
      }
    });

    // 🟢 3. GỬI THÔNG BÁO SAU KHI TRANSACTION ĐÃ HOÀN TẤT THÀNH CÔNG
    for (const condition of eligibleConditions) {
      try {
        await this.thongBaoService.createVoucherNotification({
          makhachhang: makhachhang,
          maphieu: condition.maphieugiamgia,
          tenphieu: condition.phieugiamgia?.tenphieu,
          soluong: condition.soluongnhan,
          mocchi: condition.mocchitoithieu,
        });
      } catch (notifyError) {
        console.error("Lỗi khi tự động gửi thông báo voucher:", notifyError);
      }
    }

    return {
      soVoucherDaTang: createdVouchers.length,
      chitietThuong: rewardedDetails,
      danhsachVoucher: createdVouchers,
    };
  }
}

module.exports = ViVoucherService;
