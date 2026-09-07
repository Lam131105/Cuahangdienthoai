const ChiTietDotKhuyenMaiService = require("../services/chitietdotkhuyenmai.service");
const ApiError = require("../api-error");

// ============================== 1. Thêm biến thể vào Đợt Khuyến Mãi ==================================
exports.create = async (req, res, next) => {
  const { madotkhuyenmai, mabienthe } = req.body;

  if (!madotkhuyenmai || !mabienthe) {
    return next(
      new ApiError(400, "Mã đợt khuyến mãi và mã biến thể không được để trống"),
    );
  }

  try {
    const service = new ChiTietDotKhuyenMaiService();
    const document = await service.create(req.body);
    return res.send({
      message: "Thêm biến thể vào đợt khuyến mãi thành công",
      data: document,
    });
  } catch (error) {
    if (error.message === "DOT_KHUYES_MAI_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã đợt khuyến mãi không tồn tại"));
    }
    if (error.message === "BIEN_THE_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã biến thể sản phẩm không tồn tại"));
    }
    if (error.message === "BIEN_THE_DA_CO_TRONG_DOT") {
      return next(
        new ApiError(400, "Biến thể này đã được áp dụng trong đợt khuyến mãi"),
      );
    }
    return next(
      new ApiError(500, "Đã xảy ra lỗi khi áp dụng khuyến mãi cho biến thể"),
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
      mabienthe: req.query.mabienthe, // ?mabienthe=BT0001
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
exports.delete = async (req, res, next) => {
  try {
    const service = new ChiTietDotKhuyenMaiService();
    const document = await service.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy bản ghi chi tiết cần xóa"));
    }
    return res.send({ message: "Xóa biến thể khỏi đợt khuyến mãi thành công" });
  } catch (error) {
    return next(
      new ApiError(
        400,
        error.message || `Không thể xóa bản ghi chi tiết mã = ${req.params.id}`,
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
