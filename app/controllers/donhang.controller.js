const DonHangService = require("../services/donhang.service");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
  const { khachhangid, diachi, phuongthucthanhtoan } = req.body;

  // Ràng buộc dữ liệu bắt buộc đầu vào
  if (!khachhangid) {
    return next(new ApiError(400, "khachhangid không được để trống."));
  }
  if (!diachi) {
    return next(new ApiError(400, "diachi giao hàng không được để trống."));
  }
  if (!phuongthucthanhtoan) {
    return next(new ApiError(400, "phuongthucthanhtoan không được để trống."));
  }

  try {
    const donHangService = new DonHangService();
    const document = await donHangService.create(req.body);
    return res.status(201).json({
      message: "Tạo đơn hàng thành công!",
      data: document,
    });
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    return next(
      new ApiError(500, "Đã xảy ra lỗi trong quá trình tạo đơn hàng."),
    );
  }
};

exports.update = async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ApiError(400, "Mã đơn hàng (id) không được để trống."));
  }

  try {
    const donHangService = new DonHangService();
    const updatedDonHang = await donHangService.update(id, req.body);

    if (!updatedDonHang) {
      return next(
        new ApiError(404, `Không tìm thấy đơn hàng có mã id = ${id}`),
      );
    }

    return res.status(200).json({
      message: "Cập nhật đơn hàng thành công!",
      data: updatedDonHang,
    });
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi cập nhật đơn hàng có mã id = ${id}`),
    );
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const donHangService = new DonHangService();
    const documents = await donHangService.findAll();
    return res.status(200).json(documents);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    return next(
      new ApiError(500, "Đã xảy ra lỗi khi truy vấn danh sách đơn hàng."),
    );
  }
};

// 2. Lấy 1 đơn hàng theo ID
exports.findOne = async (req, res, next) => {
  const { id } = req.params;
  try {
    const donHangService = new DonHangService();
    const document = await donHangService.findOne(id);

    if (!document) {
      return next(
        new ApiError(404, `Không tìm thấy đơn hàng với mã id = ${id}`),
      );
    }

    return res.status(200).json(document);
  } catch (error) {
    console.error(`Lỗi khi lấy chi tiết đơn hàng id = ${id}:`, error);
    return next(new ApiError(500, `Lỗi khi truy vấn đơn hàng id = ${id}`));
  }
};

// 3. Xóa đơn hàng theo ID
exports.delete = async (req, res, next) => {
  const { id } = req.params;
  try {
    const donHangService = new DonHangService();

    // Kiểm tra đơn hàng có tồn tại không trước khi xóa
    const existingOrder = await donHangService.findOne(id);
    if (!existingOrder) {
      return next(
        new ApiError(404, `Không tìm thấy đơn hàng với mã id = ${id} để xóa`),
      );
    }

    await donHangService.delete(id);
    return res.status(200).json({
      message: `Đã xóa thành công đơn hàng mã = ${id}`,
    });
  } catch (error) {
    console.error(`Lỗi khi xóa đơn hàng id = ${id}:`, error);
    return next(new ApiError(500, `Không thể xóa đơn hàng mã = ${id}`));
  }
};

exports.recalculateTotalAmount = async (req, res, next) => {
  const { id } = req.params; // donhangid truyền từ URL
  const { vivoucherid } = req.body; // vivoucherid gửi từ Body (có thể null nếu muốn hủy voucher)

  if (!id) {
    return next(new ApiError(400, "Mã đơn hàng (id) không được để trống."));
  }
  if (!vivoucherid) {
    return next(new ApiError(400, "vivoucherid không được để trống."));
  }

  try {
    const donHangService = new DonHangService();
    const updatedDonHang = await donHangService.recalculateTotalAmount(
      id,
      vivoucherid,
    );

    return res.status(200).json({
      message: vivoucherid
        ? "Áp dụng voucher và cập nhật tổng tiền thành công!"
        : "Cập nhật lại tổng tiền đơn hàng thành công!",
      data: updatedDonHang,
    });
  } catch (error) {
    switch (error.message) {
      case "DON_HANG_KHONG_TON_TAI":
        return next(new ApiError(404, `Không tìm thấy đơn hàng mã = ${id}`));

      case "VI_VOUCHER_KHONG_TON_TAI":
        return next(new ApiError(404, "Ví voucher được chọn không tồn tại."));

      case "VOUCHER_KHONG_THUOC_SO_HUU_KHACH_HANG":
        return next(
          new ApiError(
            403,
            "Voucher này không thuộc sở hữu của khách hàng đặt đơn.",
          ),
        );

      case "VOUCHER_DA_SU_DUNG":
        return next(
          new ApiError(
            400,
            "Voucher này đã được sử dụng hoặc không còn khả dụng.",
          ),
        );

      case "VOUCHER_DA_HET_HAN":
        return next(new ApiError(400, "Voucher này đã hết hạn sử dụng."));

      case "PHIEU_GIAM_GIA_KHONG_TON_TAI":
        return next(
          new ApiError(404, "Thông tin phiếu giảm giá đính kèm không tồn tại."),
        );

      case "DON_HANG_CHUA_DAT_GIA_TRI_TOI_THIEU":
        return next(
          new ApiError(
            400,
            "Tổng giá trị đơn hàng chưa đạt giá trị tối thiểu để áp dụng voucher này.",
          ),
        );

      default:
        console.error(`Lỗi tính lại tổng tiền cho đơn hàng ${id}:`, error);
        return next(
          new ApiError(
            500,
            `Lỗi hệ thống khi cập nhật tổng tiền đơn hàng mã = ${id}`,
          ),
        );
    }
  }
};

exports.previewCheckout = async (req, res, next) => {
  try {
    const { chitietgiohangids, vivoucherid } = req.body;

    if (
      !chitietgiohangids ||
      !Array.isArray(chitietgiohangids) ||
      chitietgiohangids.length === 0
    ) {
      return next(
        new ApiError(
          400,
          "Vui lòng chọn ít nhất 1 sản phẩm từ giỏ hàng để xem trước.",
        ),
      );
    }

    const donHangService = new DonHangService();
    const result = await donHangService.previewCheckout(
      chitietgiohangids,
      vivoucherid || null,
    );

    return res.status(200).json({
      status: "success",
      message: "Tính toán giá trị đơn hàng thành công!",
      data: result,
    });
  } catch (error) {
    console.error("Lỗi Preview Checkout:", error.message);

    // Bắt các lỗi throw từ Service để trả về status code phù hợp
    if (error.message.startsWith("BIEN_THE_KHONG_TON_TAI")) {
      return next(
        new ApiError(404, "Sản phẩm trong giỏ hàng không còn tồn tại."),
      );
    }
    const errMsg = error.message || "";
    if (errMsg.startsWith("DON_HANG_CHUA_DAT_GIA_TRI_TOI_THIEU_")) {
      const id = errMsg.replace("DON_HANG_CHUA_DAT_GIA_TRI_TOI_THIEU_", "");
      return next(
        new ApiError(
          400,
          `Giá trị đơn hàng chưa đạt điều kiện tối thiểu để áp dụng voucher${id}.`,
        ),
      );
    }

    switch (error.message) {
      case "DANH_SACH_SAN_PHAM_RONG":
      case "CHI_TIET_GIO_HANG_KHONG_TON_TAI":
        return next(
          new ApiError(400, "Danh sách sản phẩm giỏ hàng không hợp lệ."),
        );

      case "VI_VOUCHER_KHONG_TON_TAI":
      case "PHIEU_GIAM_GIA_KHONG_TON_TAI":
        return next(new ApiError(404, "Voucher không tồn tại trên hệ thống."));

      case "VOUCHER_DA_SU_DUNG":
        return next(new ApiError(400, "Voucher này đã được sử dụng trước đó."));

      case "VOUCHER_DA_HET_HAN":
        return next(new ApiError(400, "Voucher này đã hết hạn sử dụng."));

      case "DON_HANG_CHUA_DAT_GIA_TRI_TOI_THIEU":
        return next(
          new ApiError(
            400,
            "Giá trị đơn hàng chưa đạt điều kiện tối thiểu để áp dụng voucher.",
          ),
        );

      default:
        return next(
          new ApiError(500, "Lỗi hệ thống khi tính toán giá trị đơn hàng."),
        );
    }
  }
};

exports.placeOrder = async (req, res, next) => {
  const { khachhangid, diachi, phuongthucthanhtoan, items } = req.body;

  if (!khachhangid || !diachi || !phuongthucthanhtoan) {
    return next(new ApiError(400, "Thông tin đặt hàng không đầy đủ."));
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(new ApiError(400, "Danh sách sản phẩm mua không được trống."));
  }

  try {
    const donHangService = new DonHangService();
    const result = await donHangService.placeOrder(req.body);

    return res.status(201).json({
      message: "Đặt hàng thành công!",
      data: result,
    });
  } catch (error) {
    const errMsg = error.message || "";

    // Bắt các lỗi validation từ các service con
    if (errMsg === "GIO_HANG_KHONG_TON_TAI") {
      return next(new ApiError(404, "Không tìm thấy giỏ hàng của khách hàng."));
    }
    if (errMsg === "VOUCHER_DA_HET_HAN") {
      return next(new ApiError(400, "Voucher chọn sử dụng đã hết hạn."));
    }
    if (errMsg === "DON_HANG_CHUA_DAT_GIA_TRI_TOI_THIEU") {
      return next(
        new ApiError(
          400,
          "Đơn hàng chưa đạt giá trị tối thiểu để dùng voucher.",
        ),
      );
    }
    if (errMsg.startsWith("SO_LUONG_TON_KHO_KHONG_DU_")) {
      const id = errMsg.replace("SO_LUONG_TON_KHO_KHONG_DU_", "");
      return next(
        new ApiError(400, `Sản phẩm [${id}] trong kho không đủ số lượng.`),
      );
    }

    console.error("Lỗi khi đặt hàng:", error);
    return next(new ApiError(500, "Lỗi hệ thống khi xử lý đặt hàng."));
  }
};

exports.getTongChiKhachHang = async (req, res, next) => {
  try {
    console.log("=== BACKEND RECEIVE REQUEST ===");
    console.log("req.body nhận được là:", req.body);
    // Lấy khachhangid từ Token (người dùng tự xem) hoặc từ req.params (Admin xem)
    const { khachhangid } = req.body;
    const donHangService = new DonHangService();
    const data = await donHangService.getTongChiByKhachHangId(khachhangid);

    return res.status(200).json({
      status: "success",
      message: "Lấy tổng chi tiêu của khách hàng thành công!",
      data: data,
    });
  } catch (error) {
    console.error("Lỗi tính tổng chi tiêu:", error);
    return next(
      new ApiError(500, "Lỗi hệ thống khi tính tổng chi tiêu khách hàng."),
    );
  }
};
