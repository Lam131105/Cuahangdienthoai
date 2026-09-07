const SanPhamService = require("../services/sanpham.service");
const ApiError = require("../api-error");

// ============================== 1. Tạo Sản Phẩm mới ==================================
exports.create = async (req, res, next) => {
  if (
    !req.body?.tensanpham ||
    !req.body?.mathuonghieu ||
    !req.body?.matheloai
  ) {
    return next(
      new ApiError(
        400,
        "Tên sản phẩm, mã thương hiệu và mã thể loại không được để trống",
      ),
    );
  }

  try {
    const sanPhamService = new SanPhamService();
    const document = await sanPhamService.create(req.body);
    return res.send({
      message: "Tạo sản phẩm thành công",
      data: document,
    });
  } catch (error) {
    if (error.message === "THUONG_HIEU_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã thương hiệu cung cấp không tồn tại"));
    }
    if (error.message === "THE_LOAI_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã thể loại cung cấp không tồn tại"));
    }
    return next(
      new ApiError(500, "Đã xảy ra lỗi trong quá trình tạo sản phẩm"),
    );
  }
};

// =================== 2. Lấy danh sách Sản Phẩm (Hỗ trợ lọc) =================
exports.findAll = async (req, res, next) => {
  try {
    const sanPhamService = new SanPhamService();

    const filterData = {
      id: req.query.id, // ?id=SP0001
      tensanpham: req.query.name, // ?name=iPhone
      mathuonghieu: req.query.mathuonghieu, // ?mathuonghieu=TH0001
      matheloai: req.query.matheloai, // ?matheloai=TL0001
      trangthai: req.query.trangthai, // ?trangthai=true
    };

    const documents = await sanPhamService.find(filterData);
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách sản phẩm"));
  }
};

// ============================== 5. Cập nhật Sản Phẩm ==================================
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }

  try {
    const sanPhamService = new SanPhamService();
    const document = await sanPhamService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy sản phẩm cần cập nhật"));
    }
    return res.send({ message: "Cập nhật sản phẩm thành công", document });
  } catch (error) {
    if (error.message === "THUONG_HIEU_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã thương hiệu không tồn tại"));
    }
    if (error.message === "THE_LOAI_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã thể loại không tồn tại"));
    }
    return next(
      new ApiError(500, `Lỗi khi cập nhật sản phẩm với mã = ${req.params.id}`),
    );
  }
};

// ============================== 6. Xóa một Sản Phẩm ==================================
exports.delete = async (req, res, next) => {
  try {
    const sanPhamService = new SanPhamService();
    const document = await sanPhamService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy sản phẩm cần xóa"));
    }
    return res.send({ message: "Đã xóa sản phẩm thành công" });
  } catch (error) {
    return next(
      new ApiError(
        400,
        error.message || `Không thể xóa sản phẩm với mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 7. Xóa tất cả Sản Phẩm ==================================
exports.deleteAll = async (req, res, next) => {
  try {
    const sanPhamService = new SanPhamService();
    const deletedCount = await sanPhamService.deleteAll();
    return res.send({
      message: `Đã xóa thành công ${deletedCount} sản phẩm khỏi hệ thống`,
    });
  } catch (error) {
    return next(new ApiError(400, "Đã xảy ra lỗi khi xóa toàn bộ sản phẩm"));
  }
};

// ============================== 8. Tìm chi tiết một Sản Phẩm ==================================
exports.findOne = async (req, res, next) => {
  try {
    const sanPhamService = new SanPhamService();
    const document = await sanPhamService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy sản phẩm"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi truy vấn sản phẩm với mã = ${req.params.id}`),
    );
  }
};
