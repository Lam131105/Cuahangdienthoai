const BienTheService = require("../services/bienthe.service");
const ApiError = require("../api-error");

// ============================== 1. Tạo Biến Thể mới ==================================
exports.create = async (req, res, next) => {
  const { gia, masanpham, maram, marom, mamausac } = req.body;
  if (req.file) {
    req.body.duongdananh = `/uploads/bienthe/${req.file.filename}`;
  }

  if (!gia || !masanpham || !maram || !marom || !mamausac) {
    return next(
      new ApiError(
        400,
        "Giá, Mã sản phẩm, Mã RAM, Mã ROM và Mã màu sắc không được để trống",
      ),
    );
  }

  try {
    const bienTheService = new BienTheService();
    const document = await bienTheService.create(req.body);
    return res.send({
      message: "Tạo biến thể sản phẩm thành công",
      data: document,
    });
  } catch (error) {
    if (error.message === "BIEN_THE_DA_TON_TAI") {
      return next(
        new ApiError(
          400,
          "Biến thể với cấu hình (Sản phẩm, RAM, ROM, Màu sắc) này đã tồn tại trong hệ thống",
        ),
      );
    }
    if (error.message === "SAN_PHAM_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã sản phẩm cung cấp không tồn tại"));
    }
    if (error.message === "RAM_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã RAM cung cấp không tồn tại"));
    }
    if (error.message === "ROM_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã ROM cung cấp không tồn tại"));
    }
    if (error.message === "MAU_SAC_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã màu sắc cung cấp không tồn tại"));
    }
    return next(
      new ApiError(500, "Đã xảy ra lỗi trong quá trình tạo biến thể"),
    );
  }
};

// =================== 2. Lấy danh sách Biến Thể (Hỗ trợ lọc) =================
exports.findAll = async (req, res, next) => {
  try {
    const bienTheService = new BienTheService();

    const filterData = {
      id: req.query.id, // ?id=BT0001
      masanpham: req.query.masanpham, // ?masanpham=SP0001
      maram: req.query.maram, // ?maram=RAM0001
      marom: req.query.marom, // ?marom=ROM0001
      mamausac: req.query.mamausac, // ?mamausac=MS0001
    };

    const documents = await bienTheService.find(filterData);
    return res.send(documents);
  } catch (error) {
    console.error(`Lỗi khi xóa chi tiết `, error);
    return next(new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách biến thể"));
  }
};

// =================== 3. Lấy tất cả Biến Thể của 1 Sản Phẩm =================
exports.findBySanPham = async (req, res, next) => {
  try {
    const bienTheService = new BienTheService();
    const documents = await bienTheService.findBySanPham(req.params.masanpham);
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi lấy danh sách biến thể của sản phẩm mã = ${req.params.masanpham}`,
      ),
    );
  }
};

// ============================== 4. Cập nhật Biến Thể ==================================
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }
  if (req.file) {
    req.body.duongdananh = `/uploads/bienthe/${req.file.filename}`;
  }

  try {
    const bienTheService = new BienTheService();
    const document = await bienTheService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy biến thể cần cập nhật"));
    }
    return res.send({ message: "Cập nhật biến thể thành công", document });
  } catch (error) {
    if (error.message === "BIEN_THE_DA_TON_TAI") {
      return next(
        new ApiError(
          400,
          "Biến thể với cấu hình (Sản phẩm, RAM, ROM, Màu sắc) này đã tồn tại trong hệ thống",
        ),
      );
    }
    if (error.message === "SAN_PHAM_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã sản phẩm không tồn tại"));
    }
    if (error.message === "RAM_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã RAM không tồn tại"));
    }
    if (error.message === "ROM_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã ROM không tồn tại"));
    }
    if (error.message === "MAU_SAC_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã màu sắc không tồn tại"));
    }
    return next(
      new ApiError(500, `Lỗi khi cập nhật biến thể với mã = ${req.params.id}`),
    );
  }
};

// ============================== 5. Xóa một Biến Thể ==================================
exports.delete = async (req, res, next) => {
  try {
    const bienTheService = new BienTheService();
    const document = await bienTheService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy biến thể cần xóa"));
    }
    return res.send({ message: "Đã xóa biến thể thành công" });
  } catch (error) {
    return next(
      new ApiError(
        400,
        error.message || `Không thể xóa biến thể với mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 6. Xóa tất cả Biến Thể ==================================
exports.deleteAll = async (req, res, next) => {
  try {
    const bienTheService = new BienTheService();
    const deletedCount = await bienTheService.deleteAll();
    return res.send({
      message: `Đã xóa thành công ${deletedCount} biến thể khỏi hệ thống`,
    });
  } catch (error) {
    return next(new ApiError(400, "Đã xảy ra lỗi khi xóa toàn bộ biến thể"));
  }
};

// ============================== 7. Tìm chi tiết một Biến Thể ==================================
exports.findOne = async (req, res, next) => {
  try {
    const bienTheService = new BienTheService();
    const document = await bienTheService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy biến thể"));
    }
    return res.send(document);
  } catch (error) {
    console.error(`Lỗi khi xóa chi tiết `, error);
    return next(
      new ApiError(500, `Lỗi khi truy vấn biến thể với mã = ${req.params.id}`),
    );
  }
};
