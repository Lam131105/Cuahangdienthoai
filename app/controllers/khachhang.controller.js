const KhachHangService = require("../services/khachhang.service");
const ApiError = require("../api-error");

// ============================== 1. Tạo và lưu Khách Hàng mới (Có thể kèm Địa Chỉ) ==================================
exports.create = async (req, res, next) => {
  if (
    !req.body?.hoten ||
    !req.body?.email ||
    !req.body?.matkhau ||
    !req.body?.sodienthoai
  ) {
    return next(
      new ApiError(
        400,
        "Họ tên, email, số điện thoại và mật khẩu không được để trống",
      ),
    );
  }

  try {
    const khachHangService = new KhachHangService();
    const document = await khachHangService.create(req.body);

    return res.send({
      message: "Tạo tài khoản và giỏ hàng cho khách hàng thành công",
      data: document,
    });
  } catch (error) {
    console.error("LỖI CHI TIẾT NHẬP:", error);
    if (error.message === "EMAIL_DA_TON_TAI") {
      return next(
        new ApiError(400, "Email này đã được sử dụng trong hệ thống"),
      );
    }
    return next(
      new ApiError(
        500,
        "Đã xảy ra lỗi trong quá trình tạo tài khoản Khách Hàng",
      ),
    );
  }
};

// =================== 2. Lấy danh sách Khách Hàng (Lọc theo Mã, Tên, Email, SĐT) =================
exports.findAll = async (req, res, next) => {
  try {
    const khachHangService = new KhachHangService();

    const filterData = {
      id: req.query.id, // ?id=KH0001
      hoten: req.query.name, // ?name=Nguyen
      email: req.query.email, // ?email=abc@gmail.com
      sodienthoai: req.query.phone, // ?phone=090
    };

    const documents = await khachHangService.find(filterData);
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách Khách Hàng"),
    );
  }
};

// ============================== 3. Cập nhật thông tin Khách Hàng theo mã ==================================
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
    const khachHangService = new KhachHangService();
    const document = await khachHangService.update(req.params.id, updateData);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy Khách hàng cần cập nhật"));
    }
    return res.send({ message: "Cập nhật thông tin thành công", document });
  } catch (error) {
    if (error.message === "EMAIL_DA_TON_TAI") {
      return next(
        new ApiError(400, "Email này đã được sử dụng bởi tài khoản khác"),
      );
    }
    return next(
      new ApiError(
        500,
        `Lỗi khi cập nhật Khách hàng với mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 4. Xóa một Khách Hàng theo mã ==================================
exports.delete = async (req, res, next) => {
  try {
    const khachHangService = new KhachHangService();
    const document = await khachHangService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy Khách hàng cần xóa"));
    }
    return res.send({ message: "Đã xóa Khách hàng thành công" });
  } catch (error) {
    if (error.code === "P2003") {
      return next(
        new ApiError(
          400,
          `Không thể xóa các Khách hàng này vì khách hàng ${req.params.id} đã mua hàng trước đây!`,
        ),
      );
    }
    return next(
      new ApiError(
        400,
        error.message || `Không thể xóa Khách hàng với mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 5. Xóa sạch tất cả Khách Hàng ==================================
exports.deleteAll = async (req, res, next) => {
  try {
    const khachHangService = new KhachHangService();
    const deletedCount = await khachHangService.deleteAll();
    return res.send({
      message: `Đã xóa sạch thành công ${deletedCount} Khách hàng khỏi hệ thống`,
    });
  } catch (error) {
    if (error.code === "P2003") {
      return next(
        new ApiError(
          400,
          "Không thể xóa các Khách hàng này vì khách hàng này đã mua hàng trước đây!",
        ),
      );
    }
    return next(
      new ApiError(
        400,
        error.message || "Đã xảy ra lỗi khi xóa toàn bộ khách hàng",
      ),
    );
  }
};

// ============================== 6. Tìm một Khách Hàng theo id (Kèm danh sách địa chỉ) ==================================
exports.findOne = async (req, res, next) => {
  try {
    const khachHangService = new KhachHangService();
    const document = await khachHangService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy Khách hàng"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi truy vấn Khách hàng với mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 2. Khách Hàng Đăng Nhập ==================================
exports.login = async (req, res, next) => {
  const { email, matkhau } = req.body;

  if (!email || !matkhau) {
    return next(new ApiError(400, "Vui lòng nhập đầy đủ Email và Mật khẩu"));
  }

  try {
    const khachHangService = new KhachHangService();
    const user = await khachHangService.login(email, matkhau);
    return res.send({
      message: "Đăng nhập thành công",
      user: user,
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
    return next(new ApiError(500, "Đã xảy ra lỗi trong quá trình đăng nhập"));
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Thiếu Google Token trong request payload!",
      });
    }

    const khachHangService = new KhachHangService();
    const user = await khachHangService.loginWithGoogle(token);

    return res.status(200).json({
      success: true,
      message: "Đăng nhập bằng Google thành công!",
      user: user,
    });
  } catch (error) {
    console.error("Lỗi Controller googleLogin:", error);

    if (error.message === "TOKEN_INVALID") {
      return res.status(401).json({
        success: false,
        message: "Token Google không hợp lệ hoặc đã hết hạn!",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi hệ thống khi đăng nhập bằng Google.",
    });
  }
};

exports.loginWithFacebook = async (req, res) => {
  try {
    // 1. Lấy biến 'token' từ req.body (khớp với Frontend gửi lên { token: facebookToken })
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Thiếu Facebook Token trong request payload!",
      });
    }

    const khachHangService = new KhachHangService();

    // 2. Truyền đúng biến 'token' vừa lấy ở trên vào Service
    const user = await khachHangService.loginWithFacebook(token);

    return res.status(200).json({
      success: true,
      message: "Đăng nhập bằng Facebook thành công!",
      user: user,
    });
  } catch (error) {
    console.error("Lỗi Controller loginWithFacebook:", error);

    if (error.message === "XAC_THUC_FACEBOOK_THAT_BAI") {
      return res.status(401).json({
        success: false,
        message: "Token Facebook không hợp lệ hoặc đã hết hạn!",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi hệ thống khi đăng nhập bằng Facebook.",
    });
  }
};
