const GioHangService = require("../services/giohang.service");
const ApiError = require("../api-error");

// ============================== 1. Tạo Giỏ Hàng Mới ==================================
exports.create = async (req, res, next) => {
  const { khachhangid } = req.body;

  if (!khachhangid) {
    return next(
      new ApiError(400, "Mã khách hàng (khachhangid) không được để trống"),
    );
  }

  try {
    const gioHangService = new GioHangService();
    const document = await gioHangService.create({ khachhangid });

    return res.send({
      message: "Khởi tạo giỏ hàng thành công",
      data: document,
    });
  } catch (error) {
    if (error.message === "KHACH_HANG_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã khách hàng không tồn tại"));
    }
    if (error.message === "GIO_HANG_DA_TON_TAI") {
      return next(
        new ApiError(400, "Khách hàng này đã có giỏ hàng trong hệ thống"),
      );
    }
    return next(
      new ApiError(500, "Đã xảy ra lỗi trong quá trình khởi tạo giỏ hàng"),
    );
  }
};

// =================== 2. Lấy hoặc Tự Tạo Giỏ Hàng Theo Mã Khách Hàng =================
exports.findByKhachHang = async (req, res, next) => {
  const { makhachhang } = req.params;

  try {
    const gioHangService = new GioHangService();
    // Hàm này sẽ tự kiểm tra, nếu chưa có giỏ hàng thì tự động tạo mới cho khách
    const document = await gioHangService.getOrCreateByKhachHang(makhachhang);

    return res.send(document);
  } catch (error) {
    if (error.message === "KHACH_HANG_KHONG_TON_TAI") {
      return next(
        new ApiError(404, `Không tìm thấy khách hàng mã = ${makhachhang}`),
      );
    }
    return next(
      new ApiError(
        500,
        `Lỗi khi lấy thông tin giỏ hàng của khách hàng = ${makhachhang}`,
      ),
    );
  }
};

// =================== 3. Lấy Danh Sách Toàn Bộ Giỏ Hàng =================
exports.findAll = async (req, res, next) => {
  try {
    const gioHangService = new GioHangService();
    const documents = await gioHangService.find(req.query);
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách giỏ hàng"));
  }
};

// ============================== 4. Xem Chi Tiết 1 Giỏ Hàng ==================================
exports.findOne = async (req, res, next) => {
  try {
    const gioHangService = new GioHangService();
    const document = await gioHangService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy giỏ hàng"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi truy vấn giỏ hàng mã = ${req.params.id}`),
    );
  }
};

// ============================== 5. Xóa 1 Giỏ Hàng ==================================
exports.delete = async (req, res, next) => {
  try {
    const gioHangService = new GioHangService();
    const document = await gioHangService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy giỏ hàng cần xóa"));
    }
    return res.send({ message: "Đã xóa giỏ hàng thành công" });
  } catch (error) {
    return next(
      new ApiError(500, `Không thể xóa giỏ hàng mã = ${req.params.id}`),
    );
  }
};

// ============================== 6. Xóa Toàn Bộ Giỏ Hàng ==================================
exports.deleteAll = async (req, res, next) => {
  try {
    const gioHangService = new GioHangService();
    const deletedCount = await gioHangService.deleteAll();
    return res.send({
      message: `Đã xóa thành công ${deletedCount} giỏ hàng`,
    });
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi xóa toàn bộ giỏ hàng"));
  }
};
