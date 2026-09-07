const ThongSoKyThuatService = require("../services/thongsokythuat.service");
const ApiError = require("../api-error");

// ============================== 1. Tạo Thông Số Kỹ Thuật mới ==================================
exports.create = async (req, res, next) => {
  if (!req.body?.masanpham) {
    return next(new ApiError(400, "Mã sản phẩm không được để trống"));
  }

  try {
    const thongSoKyThuatService = new ThongSoKyThuatService();
    const document = await thongSoKyThuatService.create(req.body);
    return res.send({
      message: "Tạo thông số kỹ thuật cho sản phẩm thành công",
      data: document,
    });
  } catch (error) {
    if (error.message === "SAN_PHAM_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã sản phẩm cung cấp không tồn tại"));
    }
    if (error.message === "THONG_SO_DA_TON_TAI") {
      return next(
        new ApiError(
          400,
          "Sản phẩm này đã có thông số kỹ thuật, vui lòng dùng chức năng Cập nhật",
        ),
      );
    }
    return next(
      new ApiError(500, "Đã xảy ra lỗi trong quá trình tạo thông số kỹ thuật"),
    );
  }
};

// =================== 2. Lấy danh sách Thông Số Kỹ Thuật =================
exports.findAll = async (req, res, next) => {
  try {
    const thongSoKyThuatService = new ThongSoKyThuatService();

    const filterData = {
      id: req.query.id, // ?id=TSKT0001
      kichthuocmanhinh: req.query.kichthuocmanhinh,
      congnghemanhinh: req.query.congnghemanhinh,
      chipset: req.query.chipset,
      camerasau: req.query.camerasau,
      cameratruoc: req.query.cameratruoc,
      dungluongpin: req.query.dungluongpin,
      congnghesac: req.query.congnghesac,
      masanpham: req.query.masanpham,
    };

    const documents = await thongSoKyThuatService.find(filterData);
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách thông số kỹ thuật"),
    );
  }
};

// =================== 3. Lấy Thông Số Kỹ Thuật theo Mã Sản Phẩm =================
exports.findBySanPham = async (req, res, next) => {
  try {
    const thongSoKyThuatService = new ThongSoKyThuatService();
    const document = await thongSoKyThuatService.findBySanPham(
      req.params.masanpham,
    );
    if (!document) {
      return next(
        new ApiError(
          404,
          `Sản phẩm mã = ${req.params.masanpham} chưa có thông số kỹ thuật`,
        ),
      );
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi lấy thông số kỹ thuật của sản phẩm mã = ${req.params.masanpham}`,
      ),
    );
  }
};

// ============================== 4. Cập nhật Thông Số Kỹ Thuật theo ID ==================================
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }

  try {
    const thongSoKyThuatService = new ThongSoKyThuatService();
    const document = await thongSoKyThuatService.update(
      req.params.id,
      req.body,
    );
    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy thông số kỹ thuật cần cập nhật"),
      );
    }
    return res.send({
      message: "Cập nhật thông số kỹ thuật thành công",
      document,
    });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi cập nhật thông số kỹ thuật với mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 5. Cập nhật Thông Số Kỹ Thuật theo Mã Sản Phẩm ==================================
exports.updateBySanPham = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }

  try {
    const thongSoKyThuatService = new ThongSoKyThuatService();
    const document = await thongSoKyThuatService.updateBySanPham(
      req.params.masanpham,
      req.body,
    );
    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy thông số kỹ thuật của sản phẩm này"),
      );
    }
    return res.send({
      message: "Cập nhật thông số kỹ thuật cho sản phẩm thành công",
      document,
    });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi cập nhật thông số kỹ thuật cho sản phẩm mã = ${req.params.masanpham}`,
      ),
    );
  }
};

// ============================== 6. Xóa một bản ghi Thông Số Kỹ Thuật ==================================
exports.delete = async (req, res, next) => {
  try {
    const thongSoKyThuatService = new ThongSoKyThuatService();
    const document = await thongSoKyThuatService.delete(req.params.id);
    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy thông số kỹ thuật cần xóa"),
      );
    }
    return res.send({ message: "Đã xóa thông số kỹ thuật thành công" });
  } catch (error) {
    return next(
      new ApiError(
        400,
        error.message ||
          `Không thể xóa thông số kỹ thuật với mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 7. Xóa tất cả Thông Số Kỹ Thuật ==================================
exports.deleteAll = async (req, res, next) => {
  try {
    const thongSoKyThuatService = new ThongSoKyThuatService();
    const deletedCount = await thongSoKyThuatService.deleteAll();
    return res.send({
      message: `Đã xóa thành công ${deletedCount} thông số kỹ thuật khỏi hệ thống`,
    });
  } catch (error) {
    return next(
      new ApiError(400, "Đã xảy ra lỗi khi xóa toàn bộ thông số kỹ thuật"),
    );
  }
};

// ============================== 8. Tìm chi tiết một bản ghi ==================================
exports.findOne = async (req, res, next) => {
  try {
    const thongSoKyThuatService = new ThongSoKyThuatService();
    const document = await thongSoKyThuatService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy thông số kỹ thuật"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi truy vấn thông số kỹ thuật với mã = ${req.params.id}`,
      ),
    );
  }
};
