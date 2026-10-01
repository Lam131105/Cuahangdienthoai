const ThongBaoService = require("../services/thongbao.service");
const ApiError = require("../api-error");

// ============================== 1. Tạo Thông Báo mới ==================================
exports.create = async (req, res, next) => {
  if (!req.body?.tieude || !req.body?.noidung || !req.body?.makhachhang) {
    return next(
      new ApiError(
        400,
        "Tiêu đề, nội dung và mã khách hàng không được để trống",
      ),
    );
  }

  try {
    const thongBaoService = new ThongBaoService();
    const document = await thongBaoService.create(req.body);
    return res.send({
      message: "Tạo thông báo thành công",
      data: document,
    });
  } catch (error) {
    console.error(`Lỗi khi lấy `, error);
    if (error.message === "KHACH_HANG_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã khách hàng cung cấp không tồn tại"));
    }
    return next(
      new ApiError(500, "Đã xảy ra lỗi trong quá trình tạo thông báo"),
    );
  }
};

// ============================== 1. Tạo nhiều Thông Báo mới ==================================
exports.createAll = async (req, res, next) => {
  if (!req.body?.tieude || !req.body?.noidung) {
    return next(new ApiError(400, "Tiêu đề, nội dung không được để trống"));
  }

  try {
    const thongBaoService = new ThongBaoService();
    const document = await thongBaoService.createAll(req.body);
    return res.send({
      message: "Tạo thông báo thành công",
      data: document,
    });
  } catch (error) {
    console.error(`Lỗi khi lấy `, error);
    if (error.message === "KHACH_HANG_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã khách hàng cung cấp không tồn tại"));
    }
    return next(
      new ApiError(500, "Đã xảy ra lỗi trong quá trình tạo thông báo"),
    );
  }
};

// =================== 2. Lấy danh sách Thông Báo (Hỗ trợ lọc) =================
exports.findAll = async (req, res, next) => {
  try {
    const thongBaoService = new ThongBaoService();

    const filterData = {
      id: req.query.id, // ?id=TB0001
      makhachhang: req.query.makhachhang, // ?makhachhang=KH0001
      loaithongbao: req.query.loaithongbao, // ?loaithongbao=Đơn hàng
      tieude: req.query.tieude, // ?tieude=Khuyến mãi
    };

    const documents = await thongBaoService.find(filterData);
    return res.send(documents);
  } catch (error) {
    console.error(`Lỗi khi lấy `, error);
    return next(new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách thông báo"));
  }
};

// =================== 3. Lấy thông báo theo Mã Khách Hàng =================
exports.findByKhachHang = async (req, res, next) => {
  try {
    const thongBaoService = new ThongBaoService();
    const documents = await thongBaoService.findByKhachHang(
      req.params.makhachhang,
    );
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi lấy thông báo của khách hàng mã = ${req.params.makhachhang}`,
      ),
    );
  }
};

// ============================== 4. Cập nhật Thông Báo ==================================
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }

  try {
    const thongBaoService = new ThongBaoService();
    const document = await thongBaoService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy thông báo cần cập nhật"));
    }
    return res.send({ message: "Cập nhật thông báo thành công", document });
  } catch (error) {
    if (error.message === "KHACH_HANG_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã khách hàng không tồn tại"));
    }
    return next(
      new ApiError(500, `Lỗi khi cập nhật thông báo với mã = ${req.params.id}`),
    );
  }
};

// ============================== 5. Xóa một Thông Báo ==================================
exports.delete = async (req, res, next) => {
  try {
    const thongBaoService = new ThongBaoService();
    const document = await thongBaoService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy thông báo cần xóa"));
    }
    return res.send({ message: "Đã xóa thông báo thành công" });
  } catch (error) {
    return next(
      new ApiError(
        400,
        error.message || `Không thể xóa thông báo với mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 6. Xóa tất cả Thông Báo ==================================
exports.deleteAll = async (req, res, next) => {
  try {
    const thongBaoService = new ThongBaoService();
    const deletedCount = await thongBaoService.deleteAll();
    return res.send({
      message: `Đã xóa thành công ${deletedCount} thông báo khỏi hệ thống`,
    });
  } catch (error) {
    return next(new ApiError(400, "Đã xảy ra lỗi khi xóa toàn bộ thông báo"));
  }
};

// ============================== 7. Tìm chi tiết một Thông Báo ==================================
exports.findOne = async (req, res, next) => {
  try {
    const thongBaoService = new ThongBaoService();
    const document = await thongBaoService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy thông báo"));
    }
    return res.send(document);
  } catch (error) {
    console.error(`Lỗi khi lấy `, error);
    return next(
      new ApiError(500, `Lỗi khi truy vấn thông báo với mã = ${req.params.id}`),
    );
  }
};

exports.updateSeen = async (req, res, next) => {
  try {
    const thongBaoService = new ThongBaoService();
    const document = await thongBaoService.updateSeen(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy thông báo cần cập nhật"));
    }
    return res.send({ message: "Cập nhật thông báo thành công", document });
  } catch (error) {
    console.error("Lỗi khi thêm danh sách chi tiết đơn hàng:", error);
    return next(
      new ApiError(500, `Lỗi khi cập nhật thông báo với mã = ${req.params.id}`),
    );
  }
};
