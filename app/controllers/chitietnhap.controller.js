const ChiTietNhapService = require("../services/chitietnhap.service");
const ApiError = require("../api-error");

// ============================== 1. Tạo 1 Chi Tiết Nhập ==================================
exports.create = async (req, res, next) => {
  const { maphieunhap, mabienthe, soluongnhap, gianhap } = req.body;

  if (
    !maphieunhap ||
    !mabienthe ||
    soluongnhap === undefined ||
    gianhap === undefined
  ) {
    return next(
      new ApiError(
        400,
        "Mã phiếu nhập, mã biến thể, số lượng nhập và giá nhập không được để trống",
      ),
    );
  }

  if (parseInt(soluongnhap, 10) <= 0 || parseFloat(gianhap) < 0) {
    return next(
      new ApiError(400, "Số lượng nhập phải lớn hơn 0 và giá nhập phải >= 0"),
    );
  }

  try {
    const service = new ChiTietNhapService();
    const document = await service.create(req.body);
    return res.send({
      message:
        "Thêm chi tiết nhập thành công, đã cập nhật kho và tổng tiền phiếu nhập",
      data: document,
    });
  } catch (error) {
    console.error("LỖI CHI TIẾT NHẬP:", error);
    if (error.message === "PHIEU_NHAP_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã phiếu nhập không tồn tại"));
    }
    if (error.message === "BIEN_THE_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã biến thể không tồn tại"));
    }
    return next(
      new ApiError(500, "Đã xảy ra lỗi trong quá trình tạo chi tiết nhập"),
    );
  }
};

// =================== 3. Lấy danh sách Chi Tiết Nhập (Hỗ trợ lọc) =================
exports.findAll = async (req, res, next) => {
  try {
    const service = new ChiTietNhapService();

    const filterData = {
      id: req.query.id, // ?id=CTN0001
      maphieunhap: req.query.maphieugiamgia || req.query.maphieunhap, // ?maphieunhap=PN0001
      mabienthe: req.query.mabienthe, // ?mabienthe=BT0001
    };

    const documents = await service.find(filterData);
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách chi tiết nhập"),
    );
  }
};

// =================== 4. Lấy theo Mã Phiếu Nhập =================
exports.findByPhieuNhap = async (req, res, next) => {
  try {
    const service = new ChiTietNhapService();
    const documents = await service.findByPhieuNhap(req.params.maphieunhap);
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi lấy chi tiết nhập của phiếu mã = ${req.params.maphieunhap}`,
      ),
    );
  }
};

// ============================== 5. Cập nhật Chi Tiết Nhập ==================================
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }

  try {
    const service = new ChiTietNhapService();
    const document = await service.update(req.params.id, req.body);
    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy chi tiết nhập cần cập nhật"),
      );
    }
    return res.send({
      message:
        "Cập nhật chi tiết nhập thành công (Đã điều chỉnh tồn kho & tổng tiền)",
      data: document,
    });
  } catch (error) {
    return next(
      new ApiError(
        500,
        error.message || `Lỗi khi cập nhật chi tiết nhập mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 6. Xóa 1 Chi Tiết Nhập ==================================
exports.delete = async (req, res, next) => {
  try {
    const service = new ChiTietNhapService();
    const document = await service.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy chi tiết nhập cần xóa"));
    }
    return res.send({
      message:
        "Đã xóa chi tiết nhập thành công (Đã hoàn lại số lượng tồn kho & tính lại tổng tiền)",
    });
  } catch (error) {
    return next(
      new ApiError(
        400,
        error.message || `Không thể xóa chi tiết nhập mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 7. Tìm chi tiết theo ID ==================================
exports.findOne = async (req, res, next) => {
  try {
    const service = new ChiTietNhapService();
    const document = await service.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy chi tiết nhập"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi truy vấn chi tiết nhập mã = ${req.params.id}`),
    );
  }
};
