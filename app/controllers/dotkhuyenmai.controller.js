const DotKhuyenMaiService = require("../services/dotkhuyenmai.service");
const ApiError = require("../api-error");

// ============================== 1. Tạo Đợt Khuyến Mãi mới ==================================
exports.create = async (req, res, next) => {
  const { tendot, ngaybatdau, ngayketthuc, loaigiamgia, giatrigiam } = req.body;

  if (
    !tendot ||
    !ngaybatdau ||
    !ngayketthuc ||
    giatrigiam === undefined ||
    !loaigiamgia
  ) {
    return next(
      new ApiError(
        400,
        "Tên đợt, ngày bắt đầu, ngày kết thúc, loại giảm giá và giá trị giảm không được để trống",
      ),
    );
  }

  if (new Date(ngaybatdau) >= new Date(ngayketthuc)) {
    return next(new ApiError(400, "Ngày bắt đầu phải nhỏ hơn ngày kết thúc"));
  }

  try {
    const dotKhuyenMaiService = new DotKhuyenMaiService();
    const document = await dotKhuyenMaiService.create(req.body);
    return res.send({
      message: "Tạo đợt khuyến mãi thành công",
      data: document,
    });
  } catch (error) {
    return next(
      new ApiError(500, "Đã xảy ra lỗi trong quá trình tạo đợt khuyến mãi"),
    );
  }
};

// =================== 2. Lấy danh sách Đợt Khuyến Mãi (Hỗ trợ lọc) =================
exports.findAll = async (req, res, next) => {
  try {
    const dotKhuyenMaiService = new DotKhuyenMaiService();

    const filterData = {
      id: req.query.id, // ?id=DKM0001
      tendot: req.query.tendot, // ?tendot=Flash Sale
      loaigiamgia: req.query.loaigiamgia, // ?loaigiamgia=Phần trăm
    };

    const documents = await dotKhuyenMaiService.find(filterData);
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách đợt khuyến mãi"),
    );
  }
};

// =================== 3. Lấy các đợt khuyến mãi đang diễn ra =================
exports.findActive = async (req, res, next) => {
  try {
    const dotKhuyenMaiService = new DotKhuyenMaiService();
    const documents = await dotKhuyenMaiService.findActive();
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(
        500,
        "Đã xảy ra lỗi khi lấy danh sách khuyến mãi đang hoạt động",
      ),
    );
  }
};

// ============================== 4. Cập nhật Đợt Khuyến Mãi ==================================
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }

  const { ngaybatdau, ngayketthuc } = req.body;
  if (
    ngaybatdau &&
    ngayketthuc &&
    new Date(ngaybatdau) >= new Date(ngayketthuc)
  ) {
    return next(new ApiError(400, "Ngày bắt đầu phải nhỏ hơn ngày kết thúc"));
  }

  try {
    const dotKhuyenMaiService = new DotKhuyenMaiService();
    const document = await dotKhuyenMaiService.update(req.params.id, req.body);
    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy đợt khuyến mãi cần cập nhật"),
      );
    }
    return res.send({
      message: "Cập nhật đợt khuyến mãi thành công",
      document,
    });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi cập nhật đợt khuyến mãi với mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 5. Xóa một Đợt Khuyến Mãi ==================================
exports.delete = async (req, res, next) => {
  try {
    const dotKhuyenMaiService = new DotKhuyenMaiService();
    const document = await dotKhuyenMaiService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy đợt khuyến mãi cần xóa"));
    }
    return res.send({ message: "Đã xóa đợt khuyến mãi thành công" });
  } catch (error) {
    return next(
      new ApiError(
        400,
        error.message ||
          `Không thể xóa đợt khuyến mãi với mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 6. Xóa tất cả Đợt Khuyến Mãi ==================================
exports.deleteAll = async (req, res, next) => {
  try {
    const dotKhuyenMaiService = new DotKhuyenMaiService();
    const deletedCount = await dotKhuyenMaiService.deleteAll();
    return res.send({
      message: `Đã xóa thành công ${deletedCount} đợt khuyến mãi khỏi hệ thống`,
    });
  } catch (error) {
    return next(
      new ApiError(400, "Đã xảy ra lỗi khi xóa toàn bộ đợt khuyến mãi"),
    );
  }
};

// ============================== 7. Tìm chi tiết một Đợt Khuyến Mãi ==================================
exports.findOne = async (req, res, next) => {
  try {
    const dotKhuyenMaiService = new DotKhuyenMaiService();
    const document = await dotKhuyenMaiService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy đợt khuyến mãi"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi truy vấn đợt khuyến mãi với mã = ${req.params.id}`,
      ),
    );
  }
};
