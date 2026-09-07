const ViVoucherService = require("../services/vivoucher.service");
const ApiError = require("../api-error");

// ============================== 1. Thêm Voucher vào ví ==================================
exports.create = async (req, res, next) => {
  const { makhachhang, maphieugiamgia, trangthai } = req.body;

  if (!makhachhang || !maphieugiamgia) {
    return next(
      new ApiError(
        400,
        "Mã khách hàng và mã phiếu giảm giá không được để trống",
      ),
    );
  }

  try {
    const service = new ViVoucherService();
    const document = await service.create({
      makhachhang,
      maphieugiamgia,
      trangthai: trangthai || "Chưa dùng",
    });

    return res.send({
      message: "Thêm voucher vào ví thành công",
      data: document,
    });
  } catch (error) {
    if (error.message === "KHACH_HANG_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã khách hàng không tồn tại"));
    }
    if (error.message === "PHIEU_GIAM_GIA_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã phiếu giảm giá không tồn tại"));
    }
    return next(
      new ApiError(500, "Đã xảy ra lỗi trong quá trình thêm voucher vào ví"),
    );
  }
};

// =================== 3. Lấy danh sách Ví Voucher (Hỗ trợ lọc) =================
exports.findAll = async (req, res, next) => {
  try {
    const service = new ViVoucherService();

    const filterData = {
      id: req.query.id, // ?id=VVC0001
      makhachhang: req.query.makhachhang, // ?makhachhang=KH0001
      trangthai: req.query.trangthai, // ?trangthai=Chưa dùng
    };

    const documents = await service.find(filterData);
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách ví voucher"),
    );
  }
};

// =================== 4. Lấy danh sách Ví Voucher theo Mã Khách Hàng =================
exports.findByKhachHang = async (req, res, next) => {
  try {
    const service = new ViVoucherService();
    const documents = await service.findByKhachHang(req.params.makhachhang);
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi lấy danh sách voucher của khách hàng mã = ${req.params.makhachhang}`,
      ),
    );
  }
};

// =================== 5. Đánh dấu sử dụng Voucher =================
exports.useVoucher = async (req, res, next) => {
  try {
    const service = new ViVoucherService();
    const document = await service.useVoucher(req.params.id);

    if (!document) {
      return next(new ApiError(404, "Không tìm thấy voucher trong ví"));
    }

    const isUsed = document.trangthai === "Đã dùng";
    const message = isUsed
      ? "Sử dụng voucher thành công"
      : "Đã hoàn trả voucher về ví thành công (Do hủy đơn)";

    return res.send({
      message: message,
      trangthaiHienTai: document.trangthai,
      document,
    });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi cập nhật trạng thái voucher với mã = ${req.params.id}`,
      ),
    );
  }
};
// ============================== 6. Cập nhật Ví Voucher ==================================
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }

  try {
    const service = new ViVoucherService();
    const document = await service.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy ví voucher cần cập nhật"));
    }
    return res.send({ message: "Cập nhật ví voucher thành công", document });
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi cập nhật ví voucher mã = ${req.params.id}`),
    );
  }
};

// ============================== 7. Xóa 1 Voucher khỏi ví ==================================
exports.delete = async (req, res, next) => {
  try {
    const service = new ViVoucherService();
    const document = await service.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy voucher cần xóa khỏi ví"));
    }
    return res.send({ message: "Đã xóa voucher khỏi ví thành công" });
  } catch (error) {
    return next(
      new ApiError(
        400,
        error.message || `Không thể xóa voucher mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 8. Xóa toàn bộ Ví Voucher ==================================
exports.deleteAll = async (req, res, next) => {
  try {
    const service = new ViVoucherService();
    const deletedCount = await service.deleteAll();
    return res.send({
      message: `Đã xóa thành công ${deletedCount} voucher khỏi ví`,
    });
  } catch (error) {
    return next(new ApiError(400, "Đã xảy ra lỗi khi xóa toàn bộ ví voucher"));
  }
};

// ============================== 9. Tìm chi tiết theo ID ==================================
exports.findOne = async (req, res, next) => {
  try {
    const service = new ViVoucherService();
    const document = await service.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy thông tin ví voucher"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi truy vấn ví voucher mã = ${req.params.id}`),
    );
  }
};

// =================== Tặng Voucher Tự Động Khi Duyệt Đơn =================
exports.rewardOnPurchase = async (req, res, next) => {
  const { makhachhang, tongchi, sotientronghoadonnay } = req.params;

  if (!makhachhang || isNaN(tongchi) || isNaN(sotientronghoadonnay)) {
    return next(
      new ApiError(
        400,
        "Mã khách hàng, tổng chi và số tiền trong hóa đơn không hợp lệ",
      ),
    );
  }

  if (
    parseFloat(sotientronghoadonnay) <= 0 ||
    parseFloat(tongchi) < parseFloat(sotientronghoadonnay)
  ) {
    return next(
      new ApiError(
        400,
        "Số tiền hóa đơn phải lớn hơn 0 và Tổng chi không được nhỏ hơn số tiền hóa đơn",
      ),
    );
  }

  try {
    const service = new ViVoucherService();
    const result = await service.rewardOnPurchase(
      makhachhang,
      tongchi,
      sotientronghoadonnay,
    );

    return res.send({
      message:
        result.soVoucherDaTang > 0
          ? `Chúc mừng! Khách hàng đã đạt mốc thưởng và nhận được ${result.soVoucherDaTang} voucher mới.`
          : "Đơn hàng được duyệt thành công. Khách hàng chưa đạt thêm mốc thưởng mới nào.",
      makhachhang,
      tongChiCu: parseFloat(tongchi) - parseFloat(sotientronghoadonnay),
      tongChiMoi: parseFloat(tongchi),
      soTienHoaDon: parseFloat(sotientronghoadonnay),
      data: result,
    });
  } catch (error) {
    if (error.code === "P2003") {
      return next(
        new ApiError(404, "Mã khách hàng không tồn tại trong hệ thống"),
      );
    }
    return next(
      new ApiError(
        500,
        "Đã xảy ra lỗi trong quá trình xử lý tặng voucher tự động",
      ),
    );
  }
};
