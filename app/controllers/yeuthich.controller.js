const YeuThichService = require("../services/yeuthich.service");
const ApiError = require("../api-error");

// ============================== 1. Tạo yêu thích mới ==================================
exports.create = async (req, res, next) => {
  const { masanpham, makhachhang } = req.body;

  if (!masanpham || !makhachhang) {
    return next(
      new ApiError(400, "Mã sản phẩm và mã khách hàng không được để trống"),
    );
  }

  try {
    const yeuThichService = new YeuThichService();
    const document = await yeuThichService.create(req.body);
    return res.send({
      message: "Gửi yêu thích sản phẩm thành công",
      data: document,
    });
  } catch (error) {
    if (error.message === "SAN_PHAM_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã sản phẩm không tồn tại"));
    }
    if (error.message === "KHACH_HANG_KHONG_TON_TAI") {
      return next(new ApiError(404, "Mã khách hàng không tồn tại"));
    }
    if (error.message === "KHACH_HANG_DA_YEU_THICH") {
      return next(
        new ApiError(404, "Khách hàng đã yêu thích sản phẩm này trước đó"),
      );
    }
    return next(
      new ApiError(500, "Đã xảy ra lỗi trong quá trình gửi yêu thích"),
    );
  }
};

// =================== 2. Lấy danh sách yêu thích (Hỗ trợ lọc) =================
exports.findAll = async (req, res, next) => {
  try {
    const yeuThichService = new YeuThichService();

    const filterData = {
      id: req.query.id, // ?id=DG0001
      masanpham: req.query.masanpham, // ?masanpham=SP0001
      makhachhang: req.query.makhachhang, // ?makhachhang=KH0001
    };

    const documents = await yeuThichService.find(filterData);
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách yêu thích"));
  }
};

// =================== 3. Lấy yêu thích theo Mã Sản Phẩm =================
exports.findBySanPham = async (req, res, next) => {
  try {
    const yeuThichService = new YeuThichService();
    const result = await yeuThichService.findBySanPham(req.params.masanpham);
    return res.send(result);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi lấy danh sách yêu thích của sản phẩm mã = ${req.params.masanpham}`,
      ),
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const yeuThichService = new YeuThichService();
    if (!req.query.masanpham || !req.query.makhachhang) {
      return next(
        new ApiError(400, "Mã sản phẩm và mã khách hàng không được để trống"),
      );
    }
    const filterData = {
      masanpham: req.query.masanpham, // ?masanpham=SP0001
      makhachhang: req.query.makhachhang, // ?makhachhang=KH0001
    };

    const document = await yeuThichService.delete(filterData);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy yêu thích cần xóa"));
    }
    return res.send({ message: "Đã xóa yêu thích thành công" });
  } catch (error) {
    console.error(`Lỗi khi xóa chi tiết đơn hàng id `, error);
    return next(
      new ApiError(
        400,
        error.message ||
          `Không thể xóa yêu thích với mã = ${req.query.masanpham}/${req.query.makhachhang}`,
      ),
    );
  }
};

// ============================== 8. Tìm chi tiết một yêu thích ==================================
exports.findOne = async (req, res, next) => {
  try {
    const yeuThichService = new YeuThichService();
    const document = await yeuThichService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy yêu thích"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi truy vấn yêu thích với mã = ${req.params.id}`),
    );
  }
};
