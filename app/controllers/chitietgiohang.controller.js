const ChiTietGioHangService = require("../services/chitietgiohang.service");
const ApiError = require("../api-error");

// ============================== 1. Thêm Vào Giỏ Hàng ==================================
exports.create = async (req, res, next) => {
  const { giohangid, bientheid, soluong } = req.body;

  if (!giohangid || !bientheid) {
    return next(
      new ApiError(400, "Mã giỏ hàng và Mã biến thể không được để trống"),
    );
  }

  try {
    const service = new ChiTietGioHangService();
    const document = await service.create({
      giohangid,
      bientheid,
      soluong: soluong ? parseInt(soluong, 10) : 1,
    });

    return res.send({
      message: "Thêm sản phẩm vào giỏ hàng thành công",
      data: document,
    });
  } catch (error) {
    console.error(`Lỗi khi xóa chi tiết `, error);
    if (error.message === "GIO_HANG_KHONG_TON_TAI") {
      return next(new ApiError(404, "Giỏ hàng không tồn tại"));
    }
    if (error.message === "BIEN_THE_KHONG_TON_TAI") {
      return next(new ApiError(404, "Sản phẩm (biến thể) không tồn tại"));
    }
    return next(new ApiError(500, "Đã xảy ra lỗi khi thêm vào giỏ hàng"));
  }
};

// =================== 2. Lấy Danh Sách Chi Tiết Theo Mã Giỏ Hàng =================
exports.findByKhachHang = async (req, res, next) => {
  try {
    const service = new ChiTietGioHangService();
    const documents = await service.findByKhachHang(req.params.khachhangid);
    return res.send(documents);
  } catch (error) {
    console.error(`Lỗi khi xóa chi tiết `, error);
    return next(
      new ApiError(
        500,
        `Lỗi khi lấy danh sách sản phẩm của giỏ hàng ${req.params.khachhangid}`,
      ),
    );
  }
};

// ============================== 3. Cập Nhật Số Lượng Trực Tiếp ==================================
exports.update = async (req, res, next) => {
  if (!req.body.soluong || req.body.soluong <= 0) {
    return next(new ApiError(400, "Số lượng cập nhật phải lớn hơn 0"));
  }

  try {
    const service = new ChiTietGioHangService();
    const document = await service.update(req.params.id, req.body.soluong);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy chi tiết giỏ hàng"));
    }
    return res.send({
      message: "Cập nhật số lượng thành công",
      data: document,
    });
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi khi cập nhật số lượng chi tiết giỏ hàng"),
    );
  }
};

// ============================== 4. Lấy Tất Cả ==================================
exports.findAll = async (req, res, next) => {
  try {
    const service = new ChiTietGioHangService();
    const documents = await service.findAll();
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách chi tiết giỏ hàng"));
  }
};

// ============================== 5. Xem 1 Chi Tiết ==================================
exports.findOne = async (req, res, next) => {
  try {
    const service = new ChiTietGioHangService();
    const document = await service.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy chi tiết giỏ hàng"));
    }
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi tìm chi tiết giỏ hàng"));
  }
};

// ============================== 6. Xóa 1 Sản Phẩm Khỏi Giỏ Hàng ==================================
exports.delete = async (req, res, next) => {
  try {
    const service = new ChiTietGioHangService();
    const document = await service.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy sản phẩm cần xóa"));
    }
    return res.send({ message: "Đã xóa sản phẩm khỏi giỏ hàng thành công" });
  } catch (error) {
    return next(new ApiError(500, "Không thể xóa chi tiết giỏ hàng"));
  }
};

// ============================== 7. Xóa Toàn Bộ ==================================
exports.deleteAll = async (req, res, next) => {
  try {
    const service = new ChiTietGioHangService();
    const count = await service.deleteAll();
    return res.send({
      message: `Đã xóa thành công ${count} mục chi tiết giỏ hàng`,
    });
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi dọn dẹp giỏ hàng"));
  }
};
