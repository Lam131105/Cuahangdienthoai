const TheLoaiService = require("../services/theloai.service");
const ApiError = require("../api-error");

// ============================== 1. Tạo và lưu Danh Mục mới ==================================
exports.create = async (req, res, next) => {
  if (!req.body?.tentheloai) {
    return next(new ApiError(400, "tentheloai không được để trống"));
  }

  try {
    const theLoaiService = new TheLoaiService();
    const document = await theLoaiService.create(req.body);
    return res.send({
      message: "Danh mục đã được tạo thành công",
      data: document,
    });
  } catch (error) {
    if (error.message === "TEN_THE_LOAI_DA_TON_TAI") {
      return next(
        new ApiError(400, "Tên danh mục này đã tồn tại trong hệ thống"),
      );
    }
    return next(
      new ApiError(500, "Đã xảy ra lỗi trong quá trình thêm Danh Mục mới"),
    );
  }
};

// =================== 2. Lấy danh sách Danh Mục kết hợp bộ lọc (Mã, Tên) =================
exports.findAll = async (req, res, next) => {
  try {
    const theLoaiService = new TheLoaiService();

    const filterData = {
      id: req.query.id, // Lọc theo mã (?id=DM01)
      tentheloai: req.query.name, // Lọc theo tên (?name=Gaming)
    };

    const documents = await theLoaiService.find(filterData);
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách Danh Mục"));
  }
};

// ============================== 3. Cập nhật Danh Mục theo mã ==================================
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }

  try {
    const theLoaiService = new TheLoaiService();
    const document = await theLoaiService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy Danh mục cần cập nhật"));
    }
    return res.send({ message: "Cập nhật Danh mục thành công", document });
  } catch (error) {
    if (error.message === "TEN_THE_LOAI_DA_TON_TAI") {
      return next(
        new ApiError(400, "Tên danh mục này đã tồn tại trong hệ thống"),
      );
    }
    return next(
      new ApiError(500, `Lỗi khi cập nhật Danh mục với mã = ${req.params.id}`),
    );
  }
};

// ============================== 4. Xóa một Danh Mục theo mã ==================================
exports.delete = async (req, res, next) => {
  try {
    const theLoaiService = new TheLoaiService();
    const document = await theLoaiService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy Danh mục cần xóa"));
    }
    return res.send({ message: "Đã xóa Danh mục thành công" });
  } catch (error) {
    if (error.code === "P2003") {
      return next(
        new ApiError(
          400,
          `Không thể xóa danh mục ${req.params.id} vì đang có sản phẩm thuộc danh mục này!`,
        ),
      );
    }
    return next(
      new ApiError(
        400,
        error.message || `Không thể xóa Danh mục với mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 5. Xóa sạch tất cả Danh Mục ==================================
exports.deleteAll = async (req, res, next) => {
  try {
    const theLoaiService = new TheLoaiService();
    const deletedCount = await theLoaiService.deleteAll();
    return res.send({
      message: `Đã xóa sạch thành công ${deletedCount} Danh mục khỏi hệ thống`,
    });
  } catch (error) {
    if (error.code === "P2003") {
      return next(
        new ApiError(
          400,
          `Không thể xóa tất cả danh mục vì đang có sản phẩm thuộc danh mục này!`,
        ),
      );
    }
    return next(
      new ApiError(
        400,
        error.message || "Đã xảy ra lỗi khi xóa toàn bộ danh mục",
      ),
    );
  }
};

// ============================== 6. Tìm một Danh Mục theo id ==================================
exports.findOne = async (req, res, next) => {
  try {
    const theLoaiService = new TheLoaiService();
    const document = await theLoaiService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy Danh mục"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi truy vấn Danh mục với mã = ${req.params.id}`),
    );
  }
};
