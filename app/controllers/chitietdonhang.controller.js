const ChiTietDonHangService = require("../services/chitietdonhang.service");
const ApiError = require("../api-error");

exports.createMany = async (req, res, next) => {
  const { donhangid, items } = req.body;

  // Validation dữ liệu đầu vào
  if (!donhangid) {
    return next(new ApiError(400, "donhangid là bắt buộc."));
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(
      new ApiError(400, "Danh sách sản phẩm (items) không được để trống."),
    );
  }

  // Kiểm tra từng phần tử trong danh sách items
  for (const item of items) {
    if (!item.bientheid || !item.soluong) {
      return next(
        new ApiError(
          400,
          "Mỗi sản phẩm trong danh sách phải có bientheid và soluong.",
        ),
      );
    }
    if (item.soluong <= 0) {
      return next(
        new ApiError(
          400,
          `Số lượng cho sản phẩm ${item.bientheid} phải lớn hơn 0.`,
        ),
      );
    }
  }

  try {
    const service = new ChiTietDonHangService();
    const result = await service.createMany(req.body);

    return res.status(201).json({
      message: "Thêm danh sách chi tiết đơn hàng thành công!",
      data: result,
    });
  } catch (error) {
    const errMsg = error.message || "";

    // Bắt các lỗi chung
    if (errMsg === "DANH_SACH_SAN_PHAM_RONG") {
      return next(
        new ApiError(400, "Danh sách sản phẩm gửi lên không hợp lệ."),
      );
    }
    if (errMsg === "DON_HANG_KHONG_TON_TAI") {
      return next(new ApiError(404, "Không tìm thấy đơn hàng tương ứng."));
    }
    if (errMsg === "GIO_HANG_KHONG_TON_TAI") {
      return next(new ApiError(404, "Không tìm thấy giỏ hàng của khách hàng."));
    }

    // Bắt các lỗi động chứa mã bientheid (VD: BIEN_THE_KHONG_TON_TAI_BT0001)
    if (errMsg.startsWith("BIEN_THE_KHONG_TON_TAI_")) {
      const id = errMsg.replace("BIEN_THE_KHONG_TON_TAI_", "");
      return next(
        new ApiError(404, `Sản phẩm/Biến thể mã [${id}] không tồn tại.`),
      );
    }

    if (errMsg.startsWith("SAN_PHAM_KHONG_CO_TRONG_GIO_HANG_")) {
      const id = errMsg.replace("SAN_PHAM_KHONG_CO_TRONG_GIO_HANG_", "");
      return next(
        new ApiError(400, `Sản phẩm mã [${id}] không có trong giỏ hàng.`),
      );
    }

    if (errMsg.startsWith("SO_LUONG_KHONG_KHOP_VOI_GIO_HANG_")) {
      const id = errMsg.replace("SO_LUONG_KHONG_KHOP_VOI_GIO_HANG_", "");
      return next(
        new ApiError(
          400,
          `Số lượng mua của sản phẩm [${id}] không khớp với giỏ hàng.`,
        ),
      );
    }

    if (errMsg.startsWith("SO_LUONG_TON_KHO_KHONG_DU_")) {
      const id = errMsg.replace("SO_LUONG_TON_KHO_KHONG_DU_", "");
      return next(
        new ApiError(
          400,
          `Số lượng tồn kho của sản phẩm [${id}] không đủ để đặt hàng.`,
        ),
      );
    }

    // Lỗi hệ thống ngoài dự kiến
    console.error("Lỗi khi thêm danh sách chi tiết đơn hàng:", error);
    return next(
      new ApiError(500, "Lỗi hệ thống khi thêm danh sách chi tiết đơn hàng."),
    );
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const service = new ChiTietDonHangService();
    const documents = await service.findAll();
    return res.status(200).json(documents);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách chi tiết đơn hàng:", error);
    return next(
      new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách chi tiết đơn hàng."),
    );
  }
};

// 2. Lấy 1 chi tiết đơn hàng theo ID
exports.findOne = async (req, res, next) => {
  const { id } = req.params;
  try {
    const service = new ChiTietDonHangService();
    const document = await service.findOne(id);

    if (!document) {
      return next(
        new ApiError(404, `Không tìm thấy chi tiết đơn hàng mã = ${id}`),
      );
    }

    return res.status(200).json(document);
  } catch (error) {
    console.error(`Lỗi khi lấy chi tiết đơn hàng id = ${id}:`, error);
    return next(new ApiError(500, `Lỗi khi tìm chi tiết đơn hàng mã = ${id}`));
  }
};

// 3. Lấy tất cả chi tiết đơn hàng theo mã Đơn Hàng (donhangid)
exports.findByDonHangId = async (req, res, next) => {
  const { donhangid } = req.params;
  try {
    const service = new ChiTietDonHangService();
    const documents = await service.findByDonHangId(donhangid);
    return res.status(200).json(documents);
  } catch (error) {
    console.error(`Lỗi khi lấy chi tiết của đơn hàng ${donhangid}:`, error);
    return next(
      new ApiError(500, `Lỗi khi lấy các chi tiết thuộc đơn hàng ${donhangid}`),
    );
  }
};

// 4. Xóa chi tiết đơn hàng
exports.delete = async (req, res, next) => {
  const { id } = req.params;
  try {
    const service = new ChiTietDonHangService();
    const deletedItem = await service.delete(id);

    if (!deletedItem) {
      return next(
        new ApiError(404, `Không tìm thấy chi tiết đơn hàng mã = ${id} để xóa`),
      );
    }

    return res.status(200).json({
      message: `Đã xóa thành công chi tiết đơn hàng mã = ${id}`,
      data: deletedItem,
    });
  } catch (error) {
    console.error(`Lỗi khi xóa chi tiết đơn hàng id = ${id}:`, error);
    return next(
      new ApiError(500, `Lỗi hệ thống khi xóa chi tiết đơn hàng mã = ${id}`),
    );
  }
};
