const ChiTietDotKhuyenMaiService = require("../services/chitietdotkhuyenmai.service");
const ApiError = require("../api-error");

exports.createMany = async (req, res, next) => {
  const { madotkhuyenmai, masanphams } = req.body;

  if (!madotkhuyenmai) {
    return next(new ApiError(400, "madotkhuyenmai là bắt buộc."));
  }

  if (!masanphams || !Array.isArray(masanphams) || masanphams.length === 0) {
    return next(
      new ApiError(400, "Danh sách biến thể (masanphams) không được để trống."),
    );
  }

  try {
    const service = new ChiTietDotKhuyenMaiService();
    const result = await service.createMany(req.body);

    return res.status(201).json({
      message: "Thêm danh sách biến thể vào đợt khuyến mãi thành công!",
      data: result,
    });
  } catch (error) {
    const errMsg = error.message || "";

    if (errMsg === "DANH_SACH_BIEN_THE_RONG") {
      return next(new ApiError(400, "Danh sách biến thể không hợp lệ."));
    }
    if (errMsg === "DOT_KHUYEN_MAI_KHONG_TON_TAI") {
      return next(new ApiError(404, "Không tìm thấy đợt khuyến mãi."));
    }

    if (errMsg.startsWith("BIEN_THE_KHONG_TON_TAI_")) {
      const id = errMsg.replace("BIEN_THE_KHONG_TON_TAI_", "");
      return next(new ApiError(404, `Biến thể mã [${id}] không tồn tại.`));
    }

    if (errMsg.startsWith("BIEN_THE_DA_CO_TRONG_DOT_")) {
      const id = errMsg.replace("BIEN_THE_DA_CO_TRONG_DOT_", "");
      return next(
        new ApiError(
          400,
          `Biến thể mã [${id}] đã có sẵn trong đợt khuyến mãi này.`,
        ),
      );
    }

    console.error("Lỗi thêm hàng loạt chi tiết đợt khuyến mãi:", error);
    return next(
      new ApiError(
        500,
        "Lỗi hệ thống khi thêm danh sách chi tiết đợt khuyến mãi.",
      ),
    );
  }
};

// =================== 2. Lấy danh sách Chi Tiết Khuyến Mãi =================
exports.findAll = async (req, res, next) => {
  try {
    const service = new ChiTietDotKhuyenMaiService();

    const filterData = {
      id: req.query.id, // ?id=CTKM0001
      madotkhuyenmai: req.query.madotkhuyenmai, // ?madotkhuyenmai=DKM0001
      masanpham: req.query.masanpham, // ?masanpham=BT0001
    };

    const documents = await service.find(filterData);
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách chi tiết khuyến mãi"),
    );
  }
};

// ============================== 5. Xóa 1 bản ghi Chi Tiết Khuyến Mãi ==================================
exports.deleteMany = async (req, res, next) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return next(
      new ApiError(
        400,
        "Danh sách ID chi tiết khuyến mãi (ids) không được để trống.",
      ),
    );
  }

  try {
    const service = new ChiTietDotKhuyenMaiService();
    const result = await service.deleteMany(req.body);

    return res.status(200).json({
      message: `Đã xóa thành công ${result.count} chi tiết đợt khuyến mãi!`,
      data: result,
    });
  } catch (error) {
    const errMsg = error.message || "";

    if (errMsg === "DANH_SACH_ID_RONG") {
      return next(
        new ApiError(400, "Danh sách ID chi tiết đợt khuyến mãi không hợp lệ."),
      );
    }

    console.error("Lỗi xóa hàng loạt chi tiết đợt khuyến mãi:", error);
    return next(
      new ApiError(
        500,
        "Lỗi hệ thống khi xóa danh sách chi tiết đợt khuyến mãi.",
      ),
    );
  }
};

// ============================== 6. Xóa tất cả Chi Tiết Khuyến Mãi ==================================
exports.deleteAll = async (req, res, next) => {
  try {
    const service = new ChiTietDotKhuyenMaiService();
    const deletedCount = await service.deleteAll();
    return res.send({
      message: `Đã xóa thành công ${deletedCount} bản ghi chi tiết khuyến mãi`,
    });
  } catch (error) {
    return next(
      new ApiError(400, "Đã xảy ra lỗi khi xóa toàn bộ chi tiết khuyến mãi"),
    );
  }
};

// ============================== 7. Tìm chi tiết theo ID ==================================
exports.findOne = async (req, res, next) => {
  try {
    const service = new ChiTietDotKhuyenMaiService();
    const document = await service.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy chi tiết khuyến mãi"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi truy vấn chi tiết khuyến mãi mã = ${req.params.id}`,
      ),
    );
  }
};

// =================== 4. Lấy theo Mã Phiếu Nhập =================
exports.findByDotKhuyenMai = async (req, res, next) => {
  try {
    const service = new ChiTietDotKhuyenMaiService();
    const documents = await service.findByDotKhuyenMai(
      req.params.madotkhuyenmai,
    );
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi lấy chi tiết dợt khuyến mãi của ddotwtj khuyến mãi mã = ${req.params.madotkhuyenmai}`,
      ),
    );
  }
};
