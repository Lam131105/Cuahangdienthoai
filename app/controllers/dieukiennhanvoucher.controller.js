const DieuKienNhanVoucherService = require("../services/dieukiennhanvoucher.service");
const ApiError = require("../api-error");

// ============================== 1. Tạo Điều Kiện Nhận Voucher ==================================
exports.create = async (req, res, next) => {
  const { mocchitoithieu, soluongnhan, maphieugiamgia } = req.body;

  if (
    mocchitoithieu === undefined ||
    soluongnhan === undefined ||
    !maphieugiamgia
  ) {
    return next(
      new ApiError(
        400,
        "Mốc chi tối thiểu, số lượng nhận và mã phiếu giảm giá không được để trống",
      ),
    );
  }

  if (parseFloat(mocchitoithieu) < 0 || parseInt(soluongnhan, 10) <= 0) {
    return next(
      new ApiError(
        400,
        "Mốc chi phải lớn hơn hoặc bằng 0 và số lượng nhận phải lớn hơn 0",
      ),
    );
  }

  try {
    const service = new DieuKienNhanVoucherService();
    const document = await service.create(req.body);
    return res.send({
      message: "Tạo điều kiện nhận voucher thành công",
      data: document,
    });
  } catch (error) {
    if (error.message === "PHIEU_GIAM_GIA_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã phiếu giảm giá không tồn tại"));
    }
    return next(
      new ApiError(
        500,
        "Đã xảy ra lỗi trong quá trình tạo điều kiện nhận voucher",
      ),
    );
  }
};

// =================== 3. Lấy danh sách Điều Kiện (Hỗ trợ lọc) =================
exports.findAll = async (req, res, next) => {
  try {
    const service = new DieuKienNhanVoucherService();

    const filterData = {
      id: req.query.id, // ?id=DKV0001
      maphieugiamgia: req.query.maphieugiamgia, // ?maphieugiamgia=PGG0001
    };

    const documents = await service.find(filterData);
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(
        500,
        "Đã xảy ra lỗi khi lấy danh sách điều kiện nhận voucher",
      ),
    );
  }
};

// ============================== 5. Cập nhật Điều Kiện ==================================
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }

  try {
    const service = new DieuKienNhanVoucherService();
    const document = await service.update(req.params.id, req.body);
    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy điều kiện nhận voucher cần cập nhật"),
      );
    }
    return res.send({
      message: "Cập nhật điều kiện nhận voucher thành công",
      document,
    });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi cập nhật điều kiện nhận voucher mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 6. Xóa 1 Điều Kiện ==================================
exports.delete = async (req, res, next) => {
  try {
    const service = new DieuKienNhanVoucherService();
    const document = await service.delete(req.params.id);
    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy điều kiện nhận voucher cần xóa"),
      );
    }
    return res.send({ message: "Đã xóa điều kiện nhận voucher thành công" });
  } catch (error) {
    return next(
      new ApiError(
        400,
        error.message ||
          `Không thể xóa điều kiện nhận voucher mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 7. Xóa tất cả Điều Kiện ==================================
exports.deleteAll = async (req, res, next) => {
  try {
    const service = new DieuKienNhanVoucherService();
    const deletedCount = await service.deleteAll();
    return res.send({
      message: `Đã xóa thành công ${deletedCount} điều kiện nhận voucher`,
    });
  } catch (error) {
    return next(
      new ApiError(400, "Đã xảy ra lỗi khi xóa toàn bộ điều kiện nhận voucher"),
    );
  }
};

// ============================== 8. Tìm chi tiết theo ID ==================================
exports.findOne = async (req, res, next) => {
  try {
    const service = new DieuKienNhanVoucherService();
    const document = await service.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy điều kiện nhận voucher"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi truy vấn điều kiện nhận voucher mã = ${req.params.id}`,
      ),
    );
  }
};
