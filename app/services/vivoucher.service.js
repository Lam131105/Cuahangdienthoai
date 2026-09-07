const prisma = require("../../prisma/prisma.js");

class ViVoucherService {
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
    if (!payload.id) {
      const last = await client.vivoucher.findFirst({
        orderBy: { id: "desc" },
      });
      const currentNumber = last
        ? parseInt(last.id.replace(/\D/g, ""), 10) || 0
        : 0;
      payload.id = `VVC${String(currentNumber + 1).padStart(4, "0")}`;
    }

    const data = this.extractData(payload);

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
    // 1. Truy vấn toàn bộ voucher trong ví của khách hàng
    const userVouchers = await prisma.vivoucher.findMany({
      where: { makhachhang: makhachhang, trangthai: "Chưa dùng" },
      include: {
        phieugiamgia: true,
      },
    });

    // 2. Tiến hành gom nhóm theo maphieugiamgia
    const groupedMap = new Map();

    for (const item of userVouchers) {
      const key = item.maphieugiamgia;

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          maphieugiamgia: item.maphieugiamgia,
          phieugiamgia: item.phieugiamgia,
          tongSoluong: 0,
          //   soluongChuaDung: 0,
          //   soluongDaDung: 0,
          // Danh sách các ID ví cá thể (hỗ trợ khi cần gọi API sử dụng/hoàn trả từng cái)
          danhSachViVoucher: [],
        });
      }

      const group = groupedMap.get(key);
      group.tongSoluong += 1;

      //   if (item.trangthai === "Chưa dùng") {
      //     group.soluongChuaDung += 1;
      //   } else if (item.trangthai === "Đã dùng") {
      //     group.soluongDaDung += 1;
      //   }

      group.danhSachViVoucher.push({
        id: item.id,
        trangthai: item.trangthai,
      });
    }

    // 3. Chuyển Map thành Array để trả về cho Frontend
    return Array.from(groupedMap.values());
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

  // Tặng voucher dựa trên mốc chi tiêu đạt được từ đơn hàng vừa duyệt
  async rewardOnPurchase(makhachhang, tongchi, sotientronghoadonnay) {
    const currentTotal = parseFloat(tongchi);
    const invoiceAmount = parseFloat(sotientronghoadonnay);
    const previousTotal = currentTotal - invoiceAmount;

    // 1. Tìm tất cả các mốc điều kiện mà đơn hàng này giúp khách hàng cán mốc
    // Điều kiện: (tongchi - sotientronghoadonnay) < mocchitoithieu <= tongchi
    const eligibleConditions = await prisma.dieukiennhanvoucher.findMany({
      where: {
        mocchitoithieu: {
          gt: previousTotal, // > tongChiCu
          lte: currentTotal, // <= tongchi
        },
      },
      include: {
        phieugiamgia: true,
      },
    });

    // Nếu không vượt qua mốc mới nào -> Trả về danh sách rỗng
    if (eligibleConditions.length === 0) {
      return {
        soVoucherDaTang: 0,
        danhsachVoucherDaTang: [],
      };
    }

    // 2. Lấy mã VVC lớn nhất hiện tại để đánh số nối tiếp (VVC0001, VVC0002...)
    const lastVoucher = await prisma.vivoucher.findFirst({
      orderBy: { id: "desc" },
    });
    let currentNumber = lastVoucher
      ? parseInt(lastVoucher.id.replace(/\D/g, ""), 10) || 0
      : 0;

    // 3. Chuẩn bị danh sách bản ghi Ví Voucher cần tạo
    const vouchersToInsert = [];
    const rewardedDetails = [];

    for (const condition of eligibleConditions) {
      const quantity = condition.soluongnhan;

      for (let i = 0; i < quantity; i++) {
        currentNumber++;
        vouchersToInsert.push({
          id: `VVC${String(currentNumber).padStart(4, "0")}`,
          makhachhang: makhachhang,
          maphieugiamgia: condition.maphieugiamgia,
          trangthai: "Chưa dùng",
        });
      }

      rewardedDetails.push({
        madieukien: condition.id,
        mocchitoithieu: Number(condition.mocchitoithieu),
        tenphieu: condition.phieugiamgia.tenphieu,
        soluong: quantity,
      });
    }

    // 4. Lưu hàng loạt vào CSDL
    await prisma.vivoucher.createMany({
      data: vouchersToInsert,
    });

    return {
      soVoucherDaTang: vouchersToInsert.length,
      chitietThuong: rewardedDetails,
    };
  }
}

module.exports = ViVoucherService;
