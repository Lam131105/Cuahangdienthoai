const ThuongHieuService = require("../services/thuonghieu.service");
const ApiError = require("../api-error");

// ============================== 1. Tạo và lưu Thương hiệu mới ==================================
exports.create = async (req, res, next) => {
  try {
    const data = { ...req.body };

    // Nếu có upload file thì lấy tên file
    if (req.file) {
      data.logothuonghieu = `/uploads/thuonghieu/${req.file.filename}`;
    }

    if (!data.tenthuonghieu || !data.logothuonghieu) {
      return next(
        new ApiError(400, "Tên thương hiệu và Logo không được để trống"),
      );
    }

    const thuongHieuService = new ThuongHieuService();
    const document = await thuongHieuService.create(data);
    return res.send({
      message: "Thương hiệu đã được tạo thành công",
      data: document,
    });
  } catch (error) {
    if (error.message === "TEN_THUONG_HIEU_DA_TON_TAI") {
      return next(
        new ApiError(400, "Tên Thương hiệu này đã tồn tại trong hệ thống"),
      );
    }
    return next(
      new ApiError(500, "Đã xảy ra lỗi trong quá trình thêm Thương hiệu mới"),
    );
  }
};
// =================== 2. Lấy danh sách Thương hiệu kết hợp bộ lọc (Mã, Tên) =================
exports.findAll = async (req, res, next) => {
  try {
    const thuongHieuService = new ThuongHieuService();

    const filterData = {
      id: req.query.id, // Lọc theo mã (?id=DM01)
      tenthuonghieu: req.query.name, // Lọc theo tên (?name=Gaming)
    };

    const documents = await thuongHieuService.find(filterData);
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách Thương hiệu"),
    );
  }
};

// ============================== 3. Cập nhật Thương hiệu theo mã ==================================
exports.update = async (req, res, next) => {
  // 🟢 CHỈNH SỬA: Kiểm tra nếu KHÔNG CÓ CẢ text (req.body) LẪN file (req.file)
  if (Object.keys(req.body).length === 0 && !req.file) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }
  try {
    const updateData = { ...req.body };

    // Nếu người dùng có chọn upload file mới
    if (req.file) {
      updateData.logothuonghieu = `/uploads/thuonghieu/${req.file.filename}`;
    }

    const thuongHieuService = new ThuongHieuService();
    const document = await thuongHieuService.update(req.params.id, updateData);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy Thương hiệu cần cập nhật"));
    }
    return res.send({ message: "Cập nhật Thương hiệu thành công", document });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách chi tiết đơn hàng:", error);
    if (error.message === "TEN_THUONG_HIEU_DA_TON_TAI") {
      return next(
        new ApiError(400, "Tên Thương hiệu này đã tồn tại trong hệ thống"),
      );
    }
    return next(
      new ApiError(
        500,
        `Lỗi khi cập nhật Thương hiệu với mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 4. Xóa một Thương hiệu theo mã ==================================
exports.delete = async (req, res, next) => {
  try {
    const thuongHieuService = new ThuongHieuService();
    const document = await thuongHieuService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy Thương hiệu cần xóa"));
    }
    return res.send({ message: "Đã xóa Thương hiệu thành công" });
  } catch (error) {
    if (error.code === "P2003") {
      return next(
        new ApiError(
          400,
          "Không thể xóa Thương hiệu này vì đang có Sản phẩm thuộc thương hiệu!",
        ),
      );
    }
    return next(
      new ApiError(
        400,
        error.message || `Không thể xóa Thương hiệu với mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 5. Xóa sạch tất cả Thương hiệu ==================================
exports.deleteAll = async (req, res, next) => {
  try {
    const thuongHieuService = new ThuongHieuService();
    const deletedCount = await thuongHieuService.deleteAll();
    return res.send({
      message: `Đã xóa sạch thành công ${deletedCount} Thương hiệu khỏi hệ thống`,
    });
  } catch (error) {
    if (error.code === "P2003") {
      return next(
        new ApiError(
          400,
          "Không thể xóa tất cả Thương hiệu này vì đang có Sản phẩm thuộc các thương hiệu này!",
        ),
      );
    }
    return next(
      new ApiError(
        400,
        error.message || "Đã xảy ra lỗi khi xóa toàn bộ Thương hiệu",
      ),
    );
  }
};

// ============================== 6. Tìm một Thương hiệu theo id ==================================
exports.findOne = async (req, res, next) => {
  try {
    const thuongHieuService = new ThuongHieuService();
    const document = await thuongHieuService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy Thương hiệu"));
      z;
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi truy vấn Thương hiệu với mã = ${req.params.id}`,
      ),
    );
  }
};
