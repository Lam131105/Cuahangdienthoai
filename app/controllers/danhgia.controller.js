const DanhGiaService = require("../services/danhgia.service");
const ApiError = require("../api-error");

// ============================== 1. Tạo Đánh Giá mới ==================================
exports.create = async (req, res, next) => {
  const { sosao, noidung, masanpham, makhachhang } = req.body;

  if (sosao === undefined || !noidung || !masanpham || !makhachhang) {
    return next(
      new ApiError(
        400,
        "Số sao, nội dung, mã sản phẩm và mã khách hàng không được để trống",
      ),
    );
  }

  if (!Number.isInteger(sosao) || sosao < 1 || sosao > 5) {
    return next(
      new ApiError(400, "Số sao đánh giá phải là số nguyên từ 1 đến 5"),
    );
  }

  try {
    const danhGiaService = new DanhGiaService();
    const document = await danhGiaService.create(req.body);
    return res.send({
      message: "Gửi đánh giá sản phẩm thành công",
      data: document,
    });
  } catch (error) {
    if (error.message === "SAN_PHAM_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã sản phẩm không tồn tại"));
    }
    if (error.message === "KHACH_HANG_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã khách hàng không tồn tại"));
    }
    if (error.message === "KHACH_HANG_DA_DANH_GIA") {
      return next(
        new ApiError(404, "Khách hàng đã đánh giá sản phẩm này trước đó"),
      );
    }
    return next(
      new ApiError(500, "Đã xảy ra lỗi trong quá trình gửi đánh giá"),
    );
  }
};

// =================== 2. Lấy danh sách Đánh Giá (Hỗ trợ lọc) =================
exports.findAll = async (req, res, next) => {
  try {
    const danhGiaService = new DanhGiaService();

    const filterData = {
      id: req.query.id, // ?id=DG0001
      masanpham: req.query.masanpham, // ?masanpham=SP0001
      makhachhang: req.query.makhachhang, // ?makhachhang=KH0001
      sosao: req.query.sosao, // ?sosao=5
    };

    const documents = await danhGiaService.find(filterData);
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách đánh giá"));
  }
};

// =================== 3. Lấy đánh giá theo Mã Sản Phẩm =================
exports.findBySanPham = async (req, res, next) => {
  try {
    const danhGiaService = new DanhGiaService();
    const result = await danhGiaService.findBySanPham(req.params.masanpham);
    return res.send(result);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi lấy danh sách đánh giá của sản phẩm mã = ${req.params.masanpham}`,
      ),
    );
  }
};

// ============================== 5. Cập nhật Đánh Giá ==================================
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }

  const { sosao } = req.body;
  if (
    sosao !== undefined &&
    (!Number.isInteger(sosao) || sosao < 1 || sosao > 5)
  ) {
    return next(
      new ApiError(400, "Số sao đánh giá phải là số nguyên từ 1 đến 5"),
    );
  }

  try {
    const danhGiaService = new DanhGiaService();
    const document = await danhGiaService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy đánh giá cần cập nhật"));
    }
    return res.send({ message: "Cập nhật đánh giá thành công", document });
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi cập nhật đánh giá với mã = ${req.params.id}`),
    );
  }
};

// ============================== 6. Xóa một Đánh Giá ==================================
exports.delete = async (req, res, next) => {
  try {
    const danhGiaService = new DanhGiaService();
    const document = await danhGiaService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy đánh giá cần xóa"));
    }
    return res.send({ message: "Đã xóa đánh giá thành công" });
  } catch (error) {
    return next(
      new ApiError(
        400,
        error.message || `Không thể xóa đánh giá với mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 7. Xóa tất cả Đánh Giá ==================================
exports.deleteAll = async (req, res, next) => {
  try {
    const danhGiaService = new DanhGiaService();
    const deletedCount = await danhGiaService.deleteAll();
    return res.send({
      message: `Đã xóa thành công ${deletedCount} đánh giá khỏi hệ thống`,
    });
  } catch (error) {
    return next(new ApiError(400, "Đã xảy ra lỗi khi xóa toàn bộ đánh giá"));
  }
};

// ============================== 8. Tìm chi tiết một Đánh Giá ==================================
exports.findOne = async (req, res, next) => {
  try {
    const danhGiaService = new DanhGiaService();
    const document = await danhGiaService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy đánh giá"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi truy vấn đánh giá với mã = ${req.params.id}`),
    );
  }
};
