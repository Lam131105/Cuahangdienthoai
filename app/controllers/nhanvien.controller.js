const NhanVienService = require("../services/nhanvien.service");
const ApiError = require("../api-error");

// ============================== 1. Tạo và lưu Nhân Viên mới ==================================
exports.create = async (req, res, next) => {
  if (
    !req.body?.hoten ||
    !req.body?.email ||
    !req.body?.matkhau ||
    !req.body?.sodienthoai ||
    !req.body?.vaitroid
  ) {
    return next(
      new ApiError(
        400,
        "Họ tên, email, mật khẩu, số điện thoại và mã vai trò không được để trống",
      ),
    );
  }

  try {
    const nhanVienService = new NhanVienService();
    const document = await nhanVienService.create(req.body);
    return res.send({
      message: "Tạo tài khoản Nhân viên thành công",
      data: document,
    });
  } catch (error) {
    if (error.message === "EMAIL_DA_TON_TAI") {
      return next(
        new ApiError(400, "Email này đã được sử dụng trong hệ thống"),
      );
    }
    if (error.message === "VAI_TRO_KHONG_TON_TAI") {
      return next(
        new ApiError(404, "Không tìm thấy Vai trò với mã đã cung cấp"),
      );
    }
    return next(
      new ApiError(
        500,
        "Đã xảy ra lỗi trong quá trình tạo tài khoản Nhân viên",
      ),
    );
  }
};

// =================== 2. Lấy danh sách Nhân Viên (Lọc theo Mã, Tên, Email, SĐT, Vai trò) =================
exports.findAll = async (req, res, next) => {
  try {
    const nhanVienService = new NhanVienService();

    const filterData = {
      id: req.query.id, // ?id=NV0001
      hoten: req.query.name, // ?name=Nguyen
      email: req.query.email, // ?email=admin@company.com
      sodienthoai: req.query.phone, // ?phone=090
      vaitroid: req.query.vaitroid, // ?vaitroid=VT0001
    };

    const documents = await nhanVienService.find(filterData);
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách Nhân viên"));
  }
};

// ============================== 4. Cập nhật thông tin Nhân Viên ==================================
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0 && !req.file) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }

  try {
    const updateData = { ...req.body };
    if (req.file) {
      // 🟢 Gán tên file vào thuộc tính duongdananh của Database
      updateData.duongdananh = `/uploads/khachhang/${req.file.filename}`;
    }
    const nhanVienService = new NhanVienService();
    const document = await nhanVienService.update(req.params.id, updateData);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy Nhân viên cần cập nhật"));
    }
    return res.send({
      message: "Cập nhật thông tin Nhân viên thành công",
      document,
    });
  } catch (error) {
    if (error.message === "EMAIL_DA_TON_TAI") {
      return next(
        new ApiError(400, "Email này đã được sử dụng bởi nhân viên khác"),
      );
    }
    if (error.message === "VAI_TRO_KHONG_TON_TAI") {
      return next(new ApiError(404, "Không tìm thấy Vai trò cần thay đổi"));
    }
    return next(
      new ApiError(500, `Lỗi khi cập nhật Nhân viên với mã = ${req.params.id}`),
    );
  }
};

// ============================== 5. Xóa một Nhân Viên theo mã ==================================
exports.delete = async (req, res, next) => {
  try {
    const nhanVienService = new NhanVienService();
    const document = await nhanVienService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy Nhân viên cần xóa"));
    }
    return res.send({ message: "Đã xóa Nhân viên thành công" });
  } catch (error) {
    if (error.code === "P2003") {
      return next(
        new ApiError(
          400,
          `Không thể xóa Nhân viên ${req.params.id} vì nhân viên này đã duyệt đơn hàng trước đây!`,
        ),
      );
    }
    return next(
      new ApiError(
        400,
        error.message || `Không thể xóa Nhân viên với mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 6. Xóa tất cả Nhân Viên ==================================
exports.deleteAll = async (req, res, next) => {
  try {
    const nhanVienService = new NhanVienService();
    const deletedCount = await nhanVienService.deleteAll();
    return res.send({
      message: `Đã xóa sạch thành công ${deletedCount} Nhân viên khỏi hệ thống`,
    });
  } catch (error) {
    if (error.code === "P2003") {
      return next(
        new ApiError(
          400,
          "Không thể xóa các Nhân viên này vì nhân viên này đã duyệt đơn hàng trước đây!",
        ),
      );
    }
    return next(
      new ApiError(
        400,
        error.message || "Đã xảy ra lỗi khi xóa toàn bộ nhân viên",
      ),
    );
  }
};

// ============================== 7. Tìm một Nhân Viên theo id ==================================
exports.findOne = async (req, res, next) => {
  try {
    const nhanVienService = new NhanVienService();
    const document = await nhanVienService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy Nhân viên"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi truy vấn Nhân viên với mã = ${req.params.id}`),
    );
  }
};

// ============================== 3. Nhân Viên Đăng Nhập (Admin/Staff) ==================================
exports.login = async (req, res, next) => {
  const { email, matkhau } = req.body;

  if (!email || !matkhau) {
    return next(new ApiError(400, "Vui lòng nhập đầy đủ Email và Mật khẩu"));
  }

  try {
    const nhanVienService = new NhanVienService();
    const staff = await nhanVienService.login(email, matkhau);
    return res.send({
      message: "Đăng nhập hệ thống quản trị thành công",
      user: staff,
    });
  } catch (error) {
    if (
      error.message === "TAI_KHOAN_KHONG_TON_TAI" ||
      error.message === "MAT_KHAU_KHONG_CHINH_XAC"
    ) {
      return next(new ApiError(401, "Email hoặc mật khẩu không chính xác"));
    }
    if (error.message === "TAI_KHOAN_BI_KHOA") {
      return next(
        new ApiError(
          403,
          "Tài khoản của bạn đã bị khóa, vui lòng liên hệ Admin",
        ),
      );
    }
    return next(new ApiError(500, "Đã xảy ra lỗi khi nhân viên đăng nhập"));
  }
};
