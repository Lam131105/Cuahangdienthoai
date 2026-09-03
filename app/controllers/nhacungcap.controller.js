const NhaCungCapService = require("../services/nhacungcap.service");
const ApiError = require("../api-error");

// ============================== 1. Tạo và lưu Nhà Cung Cấp mới ==================================
exports.create = async (req, res, next) => {
  if (!req.body?.tenncc) {
    return next(new ApiError(400, "tenncc không được để trống"));
  }

  try {
    const nhaCungCapService = new NhaCungCapService();
    const document = await nhaCungCapService.create(req.body);
    return res.send({
      message: "Nhà cung cấp đã được tạo thành công",
      data: document,
    });
  } catch (error) {
    if (error.message === "TEN_NCC_DA_TON_TAI") {
      return next(
        new ApiError(400, "Tên nhà cung cấp này đã tồn tại trong hệ thống"),
      );
    }
    return next(
      new ApiError(500, "Đã xảy ra lỗi trong quá trình thêm Nhà Cung Cấp mới"),
    );
  }
};

// =================== 2. Lấy danh sách Nhà Cung Cấp kết hợp bộ lọc (Mã, Tên) =================
exports.findAll = async (req, res, next) => {
  try {
    const nhaCungCapService = new NhaCungCapService();

    const filterData = {
      id: req.query.id, // Lọc theo mã (?id=NCC0001)
      tenncc: req.query.name, // Lọc theo tên (?name=Apple)
    };

    const documents = await nhaCungCapService.find(filterData);
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách Nhà Cung Cấp"),
    );
  }
};

// ============================== 3. Cập nhật Nhà Cung Cấp theo mã ==================================
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }

  try {
    const nhaCungCapService = new NhaCungCapService();
    const document = await nhaCungCapService.update(req.params.id, req.body);
    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy Nhà cung cấp cần cập nhật"),
      );
    }
    return res.send({ message: "Cập nhật Nhà cung cấp thành công", document });
  } catch (error) {
    if (error.message === "TEN_NCC_DA_TON_TAI") {
      return next(
        new ApiError(400, "Tên nhà cung cấp này đã tồn tại trong hệ thống"),
      );
    }
    return next(
      new ApiError(
        500,
        `Lỗi khi cập nhật Nhà cung cấp với mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 4. Xóa một Nhà Cung Cấp theo mã ==================================
exports.delete = async (req, res, next) => {
  try {
    const nhaCungCapService = new NhaCungCapService();
    const document = await nhaCungCapService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy Nhà cung cấp cần xóa"));
    }
    return res.send({ message: "Đã xóa Nhà cung cấp thành công" });
  } catch (error) {
    return next(
      new ApiError(
        400,
        error.message || `Không thể xóa Nhà cung cấp với mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 5. Xóa sạch tất cả Nhà Cung Cấp ==================================
exports.deleteAll = async (req, res, next) => {
  try {
    const nhaCungCapService = new NhaCungCapService();
    const deletedCount = await nhaCungCapService.deleteAll();
    return res.send({
      message: `Đã xóa sạch thành công ${deletedCount} Nhà cung cấp khỏi hệ thống`,
    });
  } catch (error) {
    return next(
      new ApiError(
        400,
        error.message || "Đã xảy ra lỗi khi xóa toàn bộ nhà cung cấp",
      ),
    );
  }
};

// ============================== 6. Tìm một Nhà Cung Cấp theo id ==================================
exports.findOne = async (req, res, next) => {
  try {
    const nhaCungCapService = new NhaCungCapService();
    const document = await nhaCungCapService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy Nhà cung cấp"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi truy vấn Nhà cung cấp với mã = ${req.params.id}`,
      ),
    );
  }
};
