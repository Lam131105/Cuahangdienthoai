const AnhSanPhamService = require("../services/anhsanpham.service");
const ApiError = require("../api-error");

// ============================== 1. Tạo Ảnh Sản Phẩm mới ==================================
exports.create = async (req, res, next) => {
  if (!req.body?.duongdananh || !req.body?.masanpham) {
    return next(
      new ApiError(400, "Đường dẫn ảnh và mã sản phẩm không được để trống"),
    );
  }

  try {
    const anhSanPhamService = new AnhSanPhamService();
    const document = await anhSanPhamService.create(req.body);
    return res.send({
      message: "Thêm ảnh sản phẩm thành công",
      data: document,
    });
  } catch (error) {
    if (error.message === "SAN_PHAM_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã sản phẩm cung cấp không tồn tại"));
    }
    return next(
      new ApiError(500, "Đã xảy ra lỗi trong quá trình thêm ảnh sản phẩm"),
    );
  }
};

// =================== 2. Lấy danh sách Ảnh Sản Phẩm (Lọc theo id, masanpham, laanhchinh) =================
exports.findAll = async (req, res, next) => {
  try {
    const anhSanPhamService = new AnhSanPhamService();

    const filterData = {
      id: req.query.id, // ?id=ASP0001
      masanpham: req.query.masanpham, // ?masanpham=SP0001
      laanhchinh: req.query.laanhchinh, // ?laanhchinh=true
    };

    const documents = await anhSanPhamService.find(filterData);
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách ảnh sản phẩm"),
    );
  }
};

// ============================== 4. Cập nhật Ảnh Sản Phẩm ==================================
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }

  try {
    const anhSanPhamService = new AnhSanPhamService();
    const document = await anhSanPhamService.update(req.params.id, req.body);
    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy ảnh sản phẩm cần cập nhật"),
      );
    }
    return res.send({ message: "Cập nhật ảnh sản phẩm thành công", document });
  } catch (error) {
    if (error.message === "SAN_PHAM_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã sản phẩm không tồn tại"));
    }
    return next(
      new ApiError(
        500,
        `Lỗi khi cập nhật ảnh sản phẩm với mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 5. Xóa một Ảnh Sản Phẩm ==================================
exports.delete = async (req, res, next) => {
  try {
    const anhSanPhamService = new AnhSanPhamService();
    const document = await anhSanPhamService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy ảnh sản phẩm cần xóa"));
    }
    return res.send({ message: "Đã xóa ảnh sản phẩm thành công" });
  } catch (error) {
    return next(
      new ApiError(
        400,
        error.message || `Không thể xóa ảnh sản phẩm với mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 6. Xóa tất cả Ảnh Sản Phẩm ==================================
exports.deleteAll = async (req, res, next) => {
  try {
    const anhSanPhamService = new AnhSanPhamService();
    const deletedCount = await anhSanPhamService.deleteAll();
    return res.send({
      message: `Đã xóa thành công ${deletedCount} ảnh sản phẩm khỏi hệ thống`,
    });
  } catch (error) {
    return next(
      new ApiError(400, "Đã xảy ra lỗi khi xóa toàn bộ ảnh sản phẩm"),
    );
  }
};

// ============================== 7. Tìm chi tiết một Ảnh Sản Phẩm ==================================
exports.findOne = async (req, res, next) => {
  try {
    const anhSanPhamService = new AnhSanPhamService();
    const document = await anhSanPhamService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy ảnh sản phẩm"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi truy vấn ảnh sản phẩm với mã = ${req.params.id}`,
      ),
    );
  }
};
