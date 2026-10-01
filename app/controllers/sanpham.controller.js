const SanPhamService = require("../services/sanpham.service");
const ApiError = require("../api-error");

// ============================== 1. Tạo Sản Phẩm mới ==================================
exports.create = async (req, res, next) => {
  console.log("1. req.body (Các trường dữ liệu Text):", req.body);
  if (
    !req.body?.tensanpham ||
    !req.body?.mathuonghieu ||
    !req.body?.matheloai ||
    !req.body?.manhacungcap
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
    if (error.message === "NHA_CUNG_CAP_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã nhà cung cấp cung cấp không tồn tại"));
    }
    return next(
      new ApiError(500, "Đã xảy ra lỗi trong quá trình tạo sản phẩm"),
    );
  }
};

// =================== 2. Lấy danh sách Sản Phẩm (Hỗ trợ lọc) =================
exports.findAll = async (req, res, next) => {
  try {
    console.log("=== DỮ LIỆU QUERY NHẬN ĐƯỢC ===");
    console.log(req.query);
    const sanPhamService = new SanPhamService();

    const filterData = {
      id: req.query.id, // ?id=SP0001
      tensanpham: req.query.tensanpham, // ?name=iPhone
      mathuonghieu: req.query.mathuonghieu, // ?mathuonghieu=TH0001
      matheloai: req.query.matheloai, // ?matheloai=TL0001
      manhacungcap: req.query.manhacungcap,
      trangthai: req.query.trangthai, // ?trangthai=true
      marom: req.query.marom,
      maram: req.query.maram,
      mamausac: req.query.mamausac,
      makhachhang: req.query.makhachhang,
    };

    const documents = await sanPhamService.find(filterData);
    return res.send(documents);
  } catch (error) {
    console.error("Lỗi khi thêm danh sách chi tiết đơn hàng:", error);
    return next(new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách sản phẩm"));
  }
};

// =================== 2. Lấy danh sách Sản Phẩm (Hỗ trợ lọc) =================
exports.findForKhachHang = async (req, res, next) => {
  try {
    console.log("=== DỮ LIỆU QUERY NHẬN ĐƯỢC ===");
    console.log(req.query);
    const sanPhamService = new SanPhamService();

    const filterData = {
      id: req.query.id, // ?id=SP0001
      tensanpham: req.query.tensanpham, // ?name=iPhone
      mathuonghieu: req.query.mathuonghieu, // ?mathuonghieu=TH0001
      matheloai: req.query.matheloai, // ?matheloai=TL0001
      manhacungcap: req.query.manhacungcap,
      trangthai: req.query.trangthai, // ?trangthai=true
      marom: req.query.marom,
      maram: req.query.maram,
      mamausac: req.query.mamausac,
      makhachhang: req.query.makhachhang,
    };

    const documents = await sanPhamService.findForKhachHang(filterData);
    return res.send(documents);
  } catch (error) {
    console.error("Lỗi khi thêm danh sách chi tiết đơn hàng:", error);
    return next(new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách sản phẩm"));
  }
};

// ============================== 5. Cập nhật Sản Phẩm ==================================
exports.update = async (req, res, next) => {
  console.log("1. req.body (Các trường dữ liệu Text):", req.body);
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
    if (error.message === "NHA_CUNG_CAP_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã nhà cung cấp cung cấp không tồn tại"));
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
    const filterData = {
      makhachhang: req.query.makhachhang,
    };
    const document = await sanPhamService.findById(req.params.id, filterData);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy sản phẩm"));
    }
    return res.send(document);
  } catch (error) {
    console.error("Lỗi khi thêm danh sách chi tiết đơn hàng:", error);
    return next(
      new ApiError(500, `Lỗi khi truy vấn sản phẩm với mã = ${req.params.id}`),
    );
  }
};
