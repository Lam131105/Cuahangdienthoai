const VaiTroService = require("../services/vaitro.service");
const ApiError = require("../api-error");

// ============================== 1. Tạo và lưu Vai Trò mới ==================================
exports.create = async (req, res, next) => {
  if (!req.body?.tenvaitro) {
    return next(new ApiError(400, "tenvaitro không được để trống"));
  }

  try {
    const vaiTroService = new VaiTroService();
    const document = await vaiTroService.create(req.body);
    return res.send({
      message: "Vai trò đã được tạo thành công",
      data: document,
    });
  } catch (error) {
    if (error.message === "TEN_VAI_TRO_DA_TON_TAI") {
      return next(
        new ApiError(400, "Tên vai trò này đã tồn tại trong hệ thống")
      );
    }
    return next(
      new ApiError(500, "Đã xảy ra lỗi trong quá trình thêm Vai Trò mới")
    );
  }
};

// =================== 2. Lấy danh sách Vai Trò kết hợp bộ lọc (Mã, Tên) =================
exports.findAll = async (req, res, next) => {
  try {
    const vaiTroService = new VaiTroService();

    const filterData = {
      id: req.query.id,          // Lọc theo mã (?id=VT0001)
      tenvaitro: req.query.name, // Lọc theo tên (?name=Admin)
    };

    const documents = await vaiTroService.find(filterData);
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách Vai Trò"));
  }
};

// ============================== 3. Cập nhật Vai Trò theo mã ==================================
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }

  try {
    const vaiTroService = new VaiTroService();
    const document = await vaiTroService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy Vai trò cần cập nhật"));
    }
    return res.send({ message: "Cập nhật Vai trò thành công", document });
  } catch (error) {
    if (error.message === "TEN_VAI_TRO_DA_TON_TAI") {
      return next(
        new ApiError(400, "Tên vai trò này đã tồn tại trong hệ thống")
      );
    }
    return next(
      new ApiError(500, `Lỗi khi cập nhật Vai trò với mã = ${req.params.id}`)
    );
  }
};

// ============================== 4. Xóa một Vai Trò theo mã ==================================
exports.delete = async (req, res, next) => {
  try {
    const vaiTroService = new VaiTroService();
    const document = await vaiTroService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy Vai trò cần xóa"));
    }
    return res.send({ message: "Đã xóa Vai trò thành công" });
  } catch (error) {
    return next(
      new ApiError(
        400,
        error.message || `Không thể xóa Vai trò với mã = ${req.params.id}`
      )
    );
  }
};

// ============================== 5. Xóa sạch tất cả Vai Trò ==================================
exports.deleteAll = async (req, res, next) => {
  try {
    const vaiTroService = new VaiTroService();
    const deletedCount = await vaiTroService.deleteAll();
    return res.send({
      message: `Đã xóa sạch thành công ${deletedCount} Vai trò khỏi hệ thống`,
    });
  } catch (error) {
    return next(
      new ApiError(
        400,
        error.message || "Đã xảy ra lỗi khi xóa toàn bộ vai trò"
      )
    );
  }
};

// ============================== 6. Tìm một Vai Trò theo id ==================================
exports.findOne = async (req, res, next) => {
  try {
    const vaiTroService = new VaiTroService();
    const document = await vaiTroService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy Vai trò"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi truy vấn Vai trò với mã = ${req.params.id}`)
    );
  }
};