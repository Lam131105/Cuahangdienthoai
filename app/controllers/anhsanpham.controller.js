const AnhSanPhamService = require("../services/anhsanpham.service");
const ApiError = require("../api-error");

// ============================== 1. Tạo Ảnh Sản Phẩm mới ==================================
exports.create = async (req, res, next) => {
  // Lấy đường dẫn file nếu người dùng upload ảnh qua Form-Data (multer)
  let duongdananh = req.body.duongdananh;
  if (req.file) {
    // Lưu đường dẫn tương đối (Ví dụ: /uploads/sanpham/sanpham-1234567.png)
    duongdananh = `/uploads/sanpham/${req.file.filename}`;
  }

  if (!duongdananh || !req.body.masanpham) {
    return next(
      new ApiError(
        400,
        "Đường dẫn ảnh/file ảnh và mã sản phẩm không được để trống",
      ),
    );
  }

  try {
    const anhSanPhamService = new AnhSanPhamService();
    const payload = {
      ...req.body,
      duongdananh: duongdananh,
      // Chuyển kiểu dữ liệu chuỗi từ FormData sang Boolean nếu cần
      laanhchinh:
        req.body.laanhchinh === "true" || req.body.laanhchinh === true,
    };

    const document = await anhSanPhamService.create(payload);
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
  try {
    const anhSanPhamService = new AnhSanPhamService();
    const updateData = { ...req.body };

    if (req.file) {
      updateData.duongdananh = `/uploads/sanpham/${req.file.filename}`;
    }

    if (updateData.laanhchinh !== undefined) {
      updateData.laanhchinh =
        updateData.laanhchinh === "true" || updateData.laanhchinh === true;
    }

    const document = await anhSanPhamService.update(req.params.id, updateData);
    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy ảnh sản phẩm cần cập nhật"),
      );
    }
    return res.send({ message: "Cập nhật ảnh sản phẩm thành công", document });
  } catch (error) {
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

exports.findBySanPham = async (req, res, next) => {
  try {
    const anhSanPhamService = new AnhSanPhamService();

    const documents = await anhSanPhamService.findBySanPham(
      req.params.masanpham,
    );
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách ảnh sản phẩm"),
    );
  }
};
