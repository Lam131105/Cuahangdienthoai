const DiaChiService = require("../services/diachi.service");
const ApiError = require("../api-error");

// ============================== 1. Tạo và lưu Địa Chỉ mới ==================================
exports.create = async (req, res, next) => {
  if (
    !req.body?.tennguoinhan ||
    !req.body?.sdtnguoinhan ||
    !req.body?.diachichitiet ||
    !req.body?.makhachhang
  ) {
    return next(
      new ApiError(
        400,
        "Mã khách hàng, Tên người nhận, SĐT và Địa chỉ chi tiết không được để trống",
      ),
    );
  }

  try {
    const diaChiService = new DiaChiService();
    const document = await diaChiService.create(req.body);
    return res.send({
      message: "Địa chỉ đã được tạo thành công",
      data: document,
    });
  } catch (error) {
    if (error.message === "KHACH_HANG_KHONG_TON_TAI") {
      return next(
        new ApiError(404, "Không tìm thấy Khách hàng với mã đã cung cấp"),
      );
    }
    return next(
      new ApiError(500, "Đã xảy ra lỗi trong quá trình thêm Địa Chỉ mới"),
    );
  }
};

// =================== 2. Lấy danh sách Địa Chỉ (lọc theo Mã, Tên, SĐT, Khách hàng) =================
exports.findAll = async (req, res, next) => {
  try {
    const diaChiService = new DiaChiService();

    const filterData = {
      id: req.query.id,
      tennguoinhan: req.query.name,
      sdtnguoinhan: req.query.phone,
      makhachhang: req.query.makhachhang, // Có thể lọc ?makhachhang=KH0001
    };

    const documents = await diaChiService.find(filterData);
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách Địa Chỉ"));
  }
};

// ============================== 4. Cập nhật Địa Chỉ theo mã ==================================
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }

  try {
    const diaChiService = new DiaChiService();
    const document = await diaChiService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy Địa chỉ cần cập nhật"));
    }
    return res.send({ message: "Cập nhật Địa chỉ thành công", document });
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi cập nhật Địa chỉ với mã = ${req.params.id}`),
    );
  }
};

// ============================== 5. Xóa một Địa Chỉ theo mã ==================================
exports.delete = async (req, res, next) => {
  try {
    const diaChiService = new DiaChiService();
    const document = await diaChiService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy Địa chỉ cần xóa"));
    }
    return res.send({ message: "Đã xóa Địa chỉ thành công" });
  } catch (error) {
    return next(
      new ApiError(
        400,
        error.message || `Không thể xóa Địa chỉ với mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 6. Xóa sạch tất cả Địa Chỉ ==================================
exports.deleteAll = async (req, res, next) => {
  try {
    const diaChiService = new DiaChiService();
    const deletedCount = await diaChiService.deleteAll();
    return res.send({
      message: `Đã xóa sạch thành công ${deletedCount} Địa chỉ khỏi hệ thống`,
    });
  } catch (error) {
    return next(
      new ApiError(
        400,
        error.message || "Đã xảy ra lỗi khi xóa toàn bộ địa chỉ",
      ),
    );
  }
};

// ============================== 7. Tìm một Địa Chỉ theo id ==================================
exports.findOne = async (req, res, next) => {
  try {
    const diaChiService = new DiaChiService();
    const document = await diaChiService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy Địa chỉ"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi truy vấn Địa chỉ với mã = ${req.params.id}`),
    );
  }
};
