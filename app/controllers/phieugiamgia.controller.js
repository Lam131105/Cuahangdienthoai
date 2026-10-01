const PhieuGiamGiaService = require("../services/phieugiamgia.service");
const ApiError = require("../api-error");

// ============================== 1. Tạo Phiếu Giảm Giá mới ==================================
exports.create = async (req, res, next) => {
  const data = { ...req.body };
  if (req.file) {
    data.duongdananh = `/uploads/phieugiamgia/${req.file.filename}`;
  }
  if (
    !data.tenphieu ||
    data.giatrigiam === undefined ||
    data.dongiatoithieu === undefined ||
    !data.thoihan ||
    !data.loaigiamgia
  ) {
    return next(
      new ApiError(
        400,
        "Tên phiếu, giá trị giảm, đơn giá tối thiểu, loại giảm giá, thoihan không được để trống",
      ),
    );
  }
  if (data.loaigiamgia === "Phần trăm") {
    if (data.giamtoida === "") {
      return next(
        new ApiError(
          400,
          "Phiếu giảm theo phần trăm bắt buộc phải nhập vào giá trị Giảm tối đa",
        ),
      );
    }
    if (data.giatrigiam > 100) {
      return next(
        new ApiError(
          400,
          "Phiếu giảm theo phần trăm bắt buộc giá trị Giảm nhỏ hơn 100%",
        ),
      );
    }
  }

  try {
    const phieuGiamGiaService = new PhieuGiamGiaService();
    const document = await phieuGiamGiaService.create(data);
    return res.send({
      message: "Tạo phiếu giảm giá thành công",
      data: document,
    });
  } catch (error) {
    return next(
      new ApiError(500, "Đã xảy ra lỗi trong quá trình tạo phiếu giảm giá"),
    );
  }
};

// =================== 2. Lấy danh sách Phiếu Giảm Giá (Hỗ trợ lọc) =================
exports.findAll = async (req, res, next) => {
  try {
    const phieuGiamGiaService = new PhieuGiamGiaService();

    const filterData = {
      id: req.query.id, // ?id=PGG0001
      tenphieu: req.query.tenphieu, // ?tenphieu=Voucher
      loaigiamgia: req.query.loaigiamgia, // ?loaigiamgia=Phần trăm
    };

    const documents = await phieuGiamGiaService.find(filterData);
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách phiếu giảm giá"),
    );
  }
};

// =================== 3. Lấy phiếu giảm giá đang hoạt động =================
exports.findActive = async (req, res, next) => {
  try {
    const phieuGiamGiaService = new PhieuGiamGiaService();
    const documents = await phieuGiamGiaService.findActive();
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(
        500,
        "Đã xảy ra lỗi khi lấy danh sách phiếu giảm giá đang hoạt động",
      ),
    );
  }
};

// ============================== 4. Cập nhật Phiếu Giảm Giá ==================================
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0 && !req.file) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }

  try {
    const updateData = { ...req.body };

    if (req.file) {
      updateData.duongdananh = `/uploads/phieugiamgia/${req.file.filename}`;
    }
    if (updateData.loaigiamgia === "Phần trăm") {
      if (updateData.giamtoida === undefined) {
        return next(
          new ApiError(
            400,
            "Phiếu giảm theo phần trăm bắt buộc phải nhập vào Giá trị giảm tối đa",
          ),
        );
      }
      if (updateData.giatrigiam > 100) {
        return next(
          new ApiError(
            400,
            "Phiếu giảm theo phần trăm bắt buộc Giá trị giảm nhỏ hơn 100%",
          ),
        );
      }
    }
    const phieuGiamGiaService = new PhieuGiamGiaService();
    const document = await phieuGiamGiaService.update(
      req.params.id,
      updateData,
    );
    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy phiếu giảm giá cần cập nhật"),
      );
    }
    return res.send({
      message: "Cập nhật phiếu giảm giá thành công",
      document,
    });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi cập nhật phiếu giảm giá với mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 5. Xóa một Phiếu Giảm Giá ==================================
exports.delete = async (req, res, next) => {
  try {
    const phieuGiamGiaService = new PhieuGiamGiaService();
    const document = await phieuGiamGiaService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy phiếu giảm giá cần xóa"));
    }
    return res.send({ message: "Đã xóa phiếu giảm giá thành công" });
  } catch (error) {
    if (error.code === "P2003") {
      return next(
        new ApiError(
          400,
          `Không thể xóa Phiếu giảm giá ${req.params.id} vì đang có khách hàng sở hữu hoặc đang nằm trong danh sách nhận thưởng!`,
        ),
      );
    }
    return next(
      new ApiError(
        400,
        error.message ||
          `Không thể xóa phiếu giảm giá với mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 6. Xóa tất cả Phiếu Giảm Giá ==================================
exports.deleteAll = async (req, res, next) => {
  try {
    const phieuGiamGiaService = new PhieuGiamGiaService();
    const deletedCount = await phieuGiamGiaService.deleteAll();
    return res.send({
      message: `Đã xóa thành công ${deletedCount} phiếu giảm giá khỏi hệ thống`,
    });
  } catch (error) {
    if (error.code === "P2003") {
      return next(
        new ApiError(
          400,
          "Không thể xóa các Phiếu giảm giá này vì đang có khách hàng sở hữu hoặc đang nằm trong danh sách nhận thưởng!",
        ),
      );
    }
    return next(
      new ApiError(400, "Đã xảy ra lỗi khi xóa toàn bộ phiếu giảm giá"),
    );
  }
};

// ============================== 7. Tìm chi tiết một Phiếu Giảm Giá ==================================
exports.findOne = async (req, res, next) => {
  try {
    const phieuGiamGiaService = new PhieuGiamGiaService();
    const document = await phieuGiamGiaService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy phiếu giảm giá"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi truy vấn phiếu giảm giá với mã = ${req.params.id}`,
      ),
    );
  }
};
