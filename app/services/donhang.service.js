const prisma = require("../../prisma/prisma.js");
const ChiTietDonHangService = require("./chitietdonhang.service");
const BienTheService = require("./bienthe.service");
const ViVoucherService = require("./vivoucher.service");
const ThongBaoService = require("./thongbao.service");

class DonHangService {
  constructor() {
    this.chiTietDonHangService = new ChiTietDonHangService();
    this.bienTheService = new BienTheService();
    this.viVoucherService = new ViVoucherService();
    this.thongBaoService = new ThongBaoService();
  }

  // Lọc lấy các thuộc tính chuẩn của Đơn hàng
  extractDonHangUpdateData(payload) {
    const data = {
      diachi: payload.diachi,
      phuongthucthanhtoan: payload.phuongthucthanhtoan,
      trangthaidonhang: payload.trangthaidonhang,
      trangthaithanhtoan: payload.trangthaithanhtoan,
      tongtien: payload.tongtien !== undefined ? payload.tongtien : undefined,
      ngaygiao: payload.ngaygiao ? new Date(payload.ngaygiao) : undefined,
      nhanvienid: payload.nhanvienid,
      vivoucherid: payload.vivoucherid,
    };
    // Loại bỏ các trường undefined
    Object.keys(data).forEach(
      (key) => data[key] === undefined && delete data[key],
    );
    return data;
  }

  // Hàm tạo mới Đơn Hàng
  async create(payload, tx = prisma) {
    let newId = payload.id;
    if (!newId) {
      // 🟢 Prisma sinh API từ model 'DonHang' sẽ là 'donhang'
      const lastDH = await tx.donhang.findFirst({
        orderBy: { id: "desc" },
      });
      const currentNumber = lastDH
        ? parseInt(lastDH.id.replace(/\D/g, ""), 10) || 0
        : 0;
      newId = `DH${String(currentNumber + 1).padStart(4, "0")}`;
    }

    const isCOD = payload.phuongthucthanhtoan === "COD";
    const trangthaidonhang = isCOD ? "Chờ duyệt" : "Chờ thanh toán";

    const donhangData = {
      id: newId,
      khachhangid: payload.khachhangid,
      diachi: payload.diachi,
      phuongthucthanhtoan: payload.phuongthucthanhtoan,
      tongtien: 0,
      ngaygiao: null,
      nhanvienid: null,
      vivoucherid: null,
      ngaydat: new Date(),
      trangthaithanhtoan: "Chưa thanh toán",
      trangthaidonhang: trangthaidonhang,
    };

    // 🟢 Gọi tx.donhang.create
    const createdOrder = await tx.donhang.create({
      data: donhangData,
    });

    try {
      await this.thongBaoService.createOrderNotification({
        makhachhang: createdOrder.khachhangid,
        madonhang: createdOrder.id,
        trangthai: createdOrder.trangthaidonhang,
        // Đường dẫn để khách hàng bấm vào thông báo là nhảy tới chi tiết đơn
        duongdan: `/donhang/${createdOrder.id}`,
      });
    } catch (notifyError) {
      // Bọc try-catch riêng để nếu thông báo có lỗi thì không làm sập luồng update đơn hàng
      console.error("Lỗi khi tự động gửi thông báo đơn hàng:", notifyError);
    }
    return createdOrder;
  }

  async update(id, payload) {
    // 1. Kiểm tra đơn hàng có tồn tại không
    const existingOrder = await prisma.donhang.findUnique({
      where: { id: id },
    });

    if (!existingOrder) {
      return null;
    }

    // Tự động chuyển trạng thái đơn hàng dựa trên trạng thái thanh toán
    if (payload.trangthaithanhtoan === "Đã thanh toán") {
      if (existingOrder.trangthaidonhang === "Chờ thanh toán") {
        payload.trangthaidonhang = "Chờ vận chuyển";
      }
      if (existingOrder.trangthaidonhang === "Đang vận chuyển") {
        payload.trangthaidonhang = "Đã hoàn thành";
        payload.ngaygiao = new Date();
      }
    }

    if (payload.trangthaithanhtoan === "Thanh toán thất bại") {
      payload.trangthaidonhang = "Đã hủy";
    }

    // 2. Tự động gán ngaygiao nếu chuyển sang "Đã hoàn thành"
    if (
      (payload.trangthaidonhang === "Đã hoàn thành" ||
        payload.trangthaidonhang === "Đã Hoàn thành") &&
      !payload.ngaygiao &&
      !existingOrder.ngaygiao
    ) {
      payload.ngaygiao = new Date();
    }

    const data = this.extractDonHangUpdateData(payload);

    // 4. Tiến hành cập nhật Đơn hàng vào Database
    const updatedOrder = await prisma.donhang.update({
      where: { id: id },
      data: data,
      include: {
        khachhang: true,
        nhanvien: true,
        vivoucher: true,
      },
    });

    const isOrderStatusChanged =
      payload.trangthaidonhang &&
      payload.trangthaidonhang !== existingOrder.trangthaidonhang;

    if (isOrderStatusChanged) {
      try {
        await this.thongBaoService.createOrderNotification({
          makhachhang: updatedOrder.khachhangid,
          madonhang: updatedOrder.id,
          trangthai: updatedOrder.trangthaidonhang,
          // Đường dẫn để khách hàng bấm vào thông báo là nhảy tới chi tiết đơn
          duongdan: `/donhang/${updatedOrder.id}`,
        });
      } catch (notifyError) {
        // Bọc try-catch riêng để nếu thông báo có lỗi thì không làm sập luồng update đơn hàng
        console.error("Lỗi khi tự động gửi thông báo đơn hàng:", notifyError);
      }
    }

    // 5. 🟢 TÍNH TỔNG CHI & TẶNG QUÀ VOUCHER
    // Chỉ kích hoạt khi đơn hàng chính thức chuyển sang "Đã hoàn thành"
    const isCompletedNow = updatedOrder.trangthaidonhang === "Đã hoàn thành";
    const isCancelNow = updatedOrder.trangthaidonhang === "Đã hủy";

    if (isCancelNow) {
      try {
        await this.restoreStockByDonHangId(id);
      } catch (rewardError) {
        // Log lỗi tặng quà để tránh làm sập luồng update chính của đơn hàng
        console.error("Lỗi khi hủy đơn hàng", rewardError);
      }
    }

    if (isCompletedNow) {
      try {
        // Tính tổng chi mới nhất sau khi đơn này thành công
        const { tongchi } = await this.getTongChiByKhachHangId(
          updatedOrder.khachhangid,
        );

        // Gọi service tặng voucher dựa trên tổng chi tiêu và giá trị đơn hiện tại

        await this.viVoucherService.rewardOnPurchase(
          updatedOrder.khachhangid,
          tongchi,
          updatedOrder.tongtien,
        );
      } catch (rewardError) {
        // Log lỗi tặng quà để tránh làm sập luồng update chính của đơn hàng
        console.error(
          "Lỗi khi tính tổng chi hoặc tặng voucher thưởng:",
          rewardError,
        );
      }
    }

    // 6. Trả về kết quả đơn hàng đã update ở cuối hàm
    return updatedOrder;
  }

  async findAll() {
    return await prisma.donhang.findMany({
      orderBy: { ngaydat: "desc" },
      include: {
        khachhang: true,
        nhanvien: true,
        vivoucher: true,
        // chitietdonhangs: {
        //   include: {
        //     sanpham: true,
        //   },
        // },
      },
    });
  }

  // 2. Lấy 1 đơn hàng theo ID
  async findOne(id) {
    return await prisma.donhang.findUnique({
      where: { id: id },
      include: {
        khachhang: true,
        nhanvien: true,
        vivoucher: true,
        // chitietdonhangs: {
        //   include: {
        //     sanpham: true,
        //   },
        // },
      },
    });
  }

  // 3. Xóa đơn hàng theo ID (Xóa luôn các chi tiết đơn hàng liên quan nếu có)
  async delete(id) {
    // Sử dụng transaction để đảm bảo xóa chi tiết đơn hàng trước, sau đó xóa đơn hàng
    return await prisma.$transaction(async (tx) => {
      // Xóa tất cả chi tiết đơn hàng của đơn này
      await tx.chitietdonhang.deleteMany({
        where: { donhangid: id },
      });

      // Xóa đơn hàng
      return await tx.donhang.delete({
        where: { id: id },
      });
    });
  }

  async restoreStockByDonHangId(donhangid) {
    // 1. Kiểm tra đơn hàng có tồn tại không
    const donHang = await prisma.donhang.findUnique({
      where: { id: donhangid },
      include: {
        chitietdonhangs: true, // Lấy toàn bộ chi tiết đơn hàng
      },
    });

    if (!donHang) {
      throw new Error("DON_HANG_KHONG_TON_TAI");
    }

    if (!donHang.chitietdonhangs || donHang.chitietdonhangs.length === 0) {
      throw new Error("DON_HANG_KHONG_CO_CHI_TIET");
    }

    // 2. Thực hiện Transaction hoàn trả kho cho từng biến thể
    return await prisma.$transaction(async (tx) => {
      // Lặp qua từng chi tiết đơn hàng để cộng lại số lượng vào bảng Bienthe
      for (const item of donHang.chitietdonhangs) {
        await tx.bienthe.update({
          where: { id: item.bientheid },
          data: {
            soluong: {
              increment: item.soluong, // Cộng trả lại số lượng đã mua
            },
          },
        });
      }
    });
  }

  /**
   * Cập nhật lại tổng tiền đơn hàng (bao gồm tính toán các sản phẩm và áp dụng Ví Voucher)
   */
  async recalculateTotalAmount(donHangId, vivoucherid = null, tx = prisma) {
    // 1. Tìm đơn hàng kèm theo danh sách sản phẩm
    const donHang = await tx.donhang.findUnique({
      where: { id: donHangId },
      include: {
        chitietdonhangs: true,
      },
    });

    if (!donHang) {
      throw new Error("DON_HANG_KHONG_TON_TAI");
    }
    // const tongTienGoc = donHang.chitietdonhangs.reduce((sum, item) => {
    //   return sum + Number(item.gialucmua) * item.soluong;
    // }, 0);

    let tienGiam = 0;

    // 3. Nếu có donhang.vivoucherid truyền vào -> Thực hiện kiểm tra và tính toán giảm giá
    if (vivoucherid !== null) {
      // 3.1 Truy xuất Ví voucher kèm thông tin Phiếu giảm giá
      const viVoucher = await tx.vivoucher.findUnique({
        where: { id: vivoucherid },
        include: {
          phieugiamgia: true,
        },
      });

      if (!viVoucher) {
        throw new Error("VI_VOUCHER_KHONG_TON_TAI");
      }

      // 3.2 Kiểm tra Ví voucher có đúng thuộc sở hữu của Khách hàng trong đơn hàng không
      if (viVoucher.makhachhang !== donHang.khachhangid) {
        throw new Error("VOUCHER_KHONG_THUOC_SO_HUU_KHACH_HANG");
      }

      // 3.3 Kiểm tra trạng thái ví voucher (ví dụ: còn hiệu lực/chưa sử dụng)
      if (viVoucher.trangthai !== "Chưa dùng") {
        throw new Error("VOUCHER_DA_SU_DUNG");
      }

      const ngayHetHan = new Date(viVoucher.ngayketthuc);
      const ngayHienTai = new Date();

      if (ngayHetHan < ngayHienTai) {
        throw new Error("VOUCHER_DA_HET_HAN");
      }

      const pgg = viVoucher.phieugiamgia;
      if (!pgg) {
        throw new Error("PHIEU_GIAM_GIA_KHONG_TON_TAI");
      }

      // 3.4 Kiểm tra tổng tiền đơn hàng có >= dongiatoithieu không
      const donGiaToiThieu = Number(pgg.dongiatoithieu || 0);
      if (donHang.tongtien < donGiaToiThieu) {
        throw new Error("DON_HANG_CHUA_DAT_GIA_TRI_TOI_THIEU");
      }

      // 3.5 Tính số tiền được giảm theo Loại giảm giá
      const giaTriGiam = Number(pgg.giatrigiam || 0);
      if (pgg.loaigiamgia === "Phần trăm") {
        tienGiam = (donHang.tongtien * giaTriGiam) / 100;
      } else if (pgg.loaigiamgia === "Tiền cố định") {
        tienGiam = giaTriGiam;
      }

      // 3.6 So sánh số tiền giảm với giamtoida (nếu có tồn tại giamtoida > 0)
      if (pgg.giamtoida && Number(pgg.giamtoida) > 0) {
        const giamToiDa = Number(pgg.giamtoida);
        if (tienGiam > giamToiDa) {
          tienGiam = giamToiDa;
        }
      }

      // Đảm bảo tiền giảm không vượt quá tổng tiền gốc đơn hàng
      if (tienGiam > donHang.tongtien) {
        tienGiam = donHang.tongtien;
      }

      await tx.vivoucher.update({
        where: { id: vivoucherid },
        data: {
          trangthai: "Đã dùng",
        },
      });
    }

    // 4. Tính tổng tiền thực tế sau giảm giá
    const tongTienCuoiCung = donHang.tongtien - tienGiam;
    // 5. Cập nhật lại đơn hàng
    return await tx.donhang.update({
      where: { id: donHangId },
      data: {
        tongtien: tongTienCuoiCung,
        vivoucherid: vivoucherid,
      },
      include: {
        vivoucher: {
          include: {
            phieugiamgia: true,
          },
        },
        chitietdonhangs: true,
      },
    });
  }

  async previewCheckout(chitietgiohangids = [], vivoucherid = null) {
    if (!chitietgiohangids || chitietgiohangids.length === 0) {
      throw new Error("DANH_SACH_SAN_PHAM_RONG");
    }

    // 1. Lấy danh sách các item trong chi tiết giỏ hàng theo mảng ID
    const chiTietGioHangs = await prisma.chitietgiohang.findMany({
      where: {
        id: { in: chitietgiohangids },
      },
    });

    if (!chiTietGioHangs || chiTietGioHangs.length === 0) {
      throw new Error("CHI_TIET_GIO_HANG_KHONG_TON_TAI");
    }

    // 2. Gọi bienTheService.findById cho từng item để lấy thông tin sản phẩm & giá đợt khuyến mãi
    let tongTienGoc = 0; // Tổng tiền theo giá niêm yết (chưa đợt KM)
    let tongTienSauGiamDotKM = 0; // Tổng tiền thực tế của sản phẩm (đã trừ đợt KM)

    const danhsachSanPham = await Promise.all(
      chiTietGioHangs.map(async (item) => {
        const bienThe = await this.bienTheService.findById(item.bientheid);

        if (!bienThe) {
          throw new Error(`BIEN_THE_KHONG_TON_TAI_${item.bientheid}`);
        }

        const giaGoc = Number(bienThe.giagoc || bienThe.gia || 0);
        const giaSauGiam = Number(bienThe.giasaugiam ?? giaGoc);
        const soLuong = Number(item.soluong || 1);

        const thanhTienGoc = giaGoc * soLuong;
        const thanhTienSauGiam = giaSauGiam * soLuong;

        tongTienGoc += thanhTienGoc;
        tongTienSauGiamDotKM += thanhTienSauGiam;

        return {
          chitietgiohangid: item.id,
          bientheid: item.bientheid,
          soluong: soLuong,
          giagoc: giaGoc,
          giasaugiam: giaSauGiam,
          thanhtien: thanhTienSauGiam,
          bienthe: bienThe,
        };
      }),
    );

    let tienGiamVoucher = 0;
    let thongTinVoucher = null;

    // 3. Xử lý Voucher (Ví voucher) nếu khách hàng truyền vivoucherid
    if (vivoucherid) {
      const viVoucher = await prisma.vivoucher.findUnique({
        where: { id: vivoucherid },
        include: {
          phieugiamgia: true,
        },
      });

      if (!viVoucher) {
        throw new Error("VI_VOUCHER_KHONG_TON_TAI");
      }

      // 3.2 Kiểm tra trạng thái
      if (viVoucher.trangthai !== "Chưa dùng") {
        throw new Error("VOUCHER_DA_SU_DUNG");
      }

      // 3.3 Kiểm tra thời hạn
      const ngayHetHan = new Date(viVoucher.ngayketthuc);
      const ngayHienTai = new Date();
      if (ngayHetHan < ngayHienTai) {
        throw new Error("VOUCHER_DA_HET_HAN");
      }

      const pgg = viVoucher.phieugiamgia;
      if (!pgg) {
        throw new Error("PHIEU_GIAM_GIA_KHONG_TON_TAI");
      }

      // 3.4 Kiểm tra giá trị đơn hàng tối thiểu (So sánh với tổng tiền sau đợt khuyến mãi)
      const donGiaToiThieu = Number(pgg.dongiatoithieu || 0);
      if (tongTienSauGiamDotKM < donGiaToiThieu) {
        throw new Error(
          `DON_HANG_CHUA_DAT_GIA_TRI_TOI_THIEU_${donGiaToiThieu}`,
        );
      }

      // 3.5 Tính tiền giảm theo loại voucher
      const giaTriGiam = Number(pgg.giatrigiam || 0);
      if (pgg.loaigiamgia === "Phần trăm") {
        tienGiamVoucher = (tongTienSauGiamDotKM * giaTriGiam) / 100;
      } else if (pgg.loaigiamgia === "Tiền cố định") {
        tienGiamVoucher = giaTriGiam;
      }

      // 3.6 So sánh giới hạn giảm tối đa
      if (pgg.giamtoida && Number(pgg.giamtoida) > 0) {
        const giamToiDa = Number(pgg.giamtoida);
        if (tienGiamVoucher > giamToiDa) {
          tienGiamVoucher = giamToiDa;
        }
      }

      // Không giảm vượt quá tổng tiền sản phẩm
      if (tienGiamVoucher > tongTienSauGiamDotKM) {
        tienGiamVoucher = tongTienSauGiamDotKM;
      }

      thongTinVoucher = {
        vivoucherid: viVoucher.id,
        tenvoucher: pgg.tenphieu,
        loaigiamgia: pgg.loaigiamgia,
        giatrigiam: giaTriGiam,
        giamtoida: pgg.giamtoida,
        duongdananh: pgg.duongdananh,
        dongiatoithieu: pgg.dongiatoithieu,
        tiengiam: tienGiamVoucher,
      };
    }

    // 4. Tổng thanh toán cuối cùng
    const tongThanhToan = tongTienSauGiamDotKM - tienGiamVoucher;

    // 5. Trả về kết quả (Không ghi DB)
    return {
      danhsachsanpham: danhsachSanPham,
      tongtiengoc: tongTienGoc, // Tổng giá niêm yết
      tiengiamdotkhuyenmai: tongTienGoc - tongTienSauGiamDotKM, // Tiền giảm do đợt khuyến mãi
      tongtiensaugiamdotkhuyenmai: tongTienSauGiamDotKM, // Tổng tiền tạm tính
      tiengiamvoucher: tienGiamVoucher, // Tiền giảm từ Voucher
      tongthanhtoan: tongThanhToan, // Số tiền khách phải trả thực tế
      voucher: thongTinVoucher,
    };
  }

  async placeOrder(payload) {
    const { khachhangid, diachi, phuongthucthanhtoan, items, vivoucherid } =
      payload;

    // Bọc toàn bộ quy trình checkout trong 1 Transaction duy nhất
    return await prisma.$transaction(async (tx) => {
      // 1. Tạo Đơn Hàng cơ bản
      const newOrder = await this.create(
        { khachhangid, diachi, phuongthucthanhtoan },
        tx,
      );

      // 2. Thêm Hàng Loạt Chi Tiết Đơn Hàng (Trừ kho & Xóa khỏi giỏ hàng)
      await this.chiTietDonHangService.createMany(
        { donhangid: newOrder.id, items },
        tx,
      );
      // 3. Tính lại Tổng tiền & Áp dụng Ví Voucher (nếu có)
      const finalOrder = await this.recalculateTotalAmount(
        newOrder.id,
        vivoucherid || null,
        tx,
      );

      return finalOrder;
    });
  }

  async getTongChiByKhachHangId(khachhangid, tx = prisma) {
    if (!khachhangid) {
      throw new Error("KHACH_HANG_ID_KHONG_HOP_LE");
    }

    // 1. Tính tổng tiền (sum) của tất cả đơn hàng thuộc về khách hàng này
    const result = await tx.donhang.aggregate({
      _sum: {
        tongtien: true,
      },
      _count: {
        id: true, // Đếm tổng số đơn hàng đã mua luôn nếu cần
      },
      where: {
        khachhangid: khachhangid,
        trangthaidonhang: "Đã hoàn thành",
      },
    });

    // 2. Trả về kết quả (Nói không với null/undefined, nếu chưa mua đơn nào thì trả về 0)
    const tongChi = Number(result._sum.tongtien || 0);
    const tongSoDonHang = result._count.id || 0;

    return {
      khachhangid: khachhangid,
      tongchi: tongChi,
      sodonhang: tongSoDonHang,
    };
  }
}

module.exports = DonHangService;
