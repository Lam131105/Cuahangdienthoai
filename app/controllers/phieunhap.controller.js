const PhieuNhapService = require("../services/phieunhap.service");
const ApiError = require("../api-error");

// ============================== 1. Khởi tạo Phiếu Nhập mới ==================================
exports.create = async (req, res, next) => {
  const { manhacungcap, manhanvien, ngaynhap, tongtien } = req.body;

  if (!manhacungcap || !manhanvien) {
    return next(
      new ApiError(400, "Mã nhà cung cấp và mã nhân viên không được để trống"),
    );
  }

  try {
    const phieuNhapService = new PhieuNhapService();
    const document = await phieuNhapService.create({
      manhacungcap,
      manhanvien,
      ngaynhap: ngaynhap ? new Date(ngaynhap) : new Date(), // Mặc định là ngày hiện tại
      tongtien: tongtien !== undefined ? parseFloat(tongtien) : 0, // Mặc định = 0
    });

    return res.send({
      message: "Khởi tạo phiếu nhập kho thành công",
      data: document,
    });
  } catch (error) {
    if (error.message === "NHA_CUNG_CAP_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã nhà cung cấp không tồn tại"));
    }
    if (error.message === "NHAN_VIEN_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã nhân viên không tồn tại"));
    }
    return next(
      new ApiError(500, "Đã xảy ra lỗi trong quá trình khởi tạo phiếu nhập"),
    );
  }
};

// =================== 2. Lấy danh sách Phiếu Nhập (Hỗ trợ lọc) =================
exports.findAll = async (req, res, next) => {
  try {
    const phieuNhapService = new PhieuNhapService();

    const filterData = {
      id: req.query.id, // ?id=PN0001
      manhacungcap: req.query.manhacungcap, // ?manhacungcap=NCC0001
      manhanvien: req.query.manhanvien, // ?manhanvien=NV0001
      from: req.query.from, // ?from=2026-09-01
      to: req.query.to, // ?to=2026-09-30
    };

    const documents = await phieuNhapService.find(filterData);
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách phiếu nhập"),
    );
  }
};

// =================== 3. Lấy danh sách theo Nhà Cung Cấp =================
exports.findByNhaCungCap = async (req, res, next) => {
  try {
    const phieuNhapService = new PhieuNhapService();
    const documents = await phieuNhapService.findByNhaCungCap(
      req.params.manhacungcap,
    );
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi lấy danh sách phiếu nhập của nhà cung cấp mã = ${req.params.manhacungcap}`,
      ),
    );
  }
};

// =================== 4. Lấy danh sách theo Nhân Viên =================
exports.findByNhanVien = async (req, res, next) => {
  try {
    const phieuNhapService = new PhieuNhapService();
    const documents = await phieuNhapService.findByNhanVien(
      req.params.manhanvien,
    );
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi lấy danh sách phiếu nhập do nhân viên mã = ${req.params.manhanvien} tạo`,
      ),
    );
  }
};

// ============================== 5. Cập nhật Phiếu Nhập ==================================
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }

  try {
    const phieuNhapService = new PhieuNhapService();
    const document = await phieuNhapService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy phiếu nhập cần cập nhật"));
    }
    return res.send({ message: "Cập nhật phiếu nhập thành công", document });
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi cập nhật phiếu nhập mã = ${req.params.id}`),
    );
  }
};

// ============================== 6. Xóa 1 Phiếu Nhập ==================================
exports.delete = async (req, res, next) => {
  try {
    const phieuNhapService = new PhieuNhapService();
    const document = await phieuNhapService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy phiếu nhập cần xóa"));
    }
    return res.send({ message: "Đã xóa phiếu nhập thành công" });
  } catch (error) {
    return next(
      new ApiError(
        400,
        error.message || `Không thể xóa phiếu nhập mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 7. Xóa toàn bộ Phiếu Nhập ==================================
exports.deleteAll = async (req, res, next) => {
  try {
    const phieuNhapService = new PhieuNhapService();
    const deletedCount = await phieuNhapService.deleteAll();
    return res.send({
      message: `Đã xóa thành công ${deletedCount} phiếu nhập`,
    });
  } catch (error) {
    return next(new ApiError(400, "Đã xảy ra lỗi khi xóa toàn bộ phiếu nhập"));
  }
};

// ============================== 8. Tìm chi tiết Phiếu Nhập ==================================
exports.findOne = async (req, res, next) => {
  try {
    const phieuNhapService = new PhieuNhapService();
    const document = await phieuNhapService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy thông tin phiếu nhập"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi truy vấn phiếu nhập mã = ${req.params.id}`),
    );
  }
};
