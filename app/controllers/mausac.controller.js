const MauSacService = require("../services/mausac.service");
const ApiError = require("../api-error");

// ============================== 1. Tạo Màu Sắc mới ==================================
exports.create = async (req, res, next) => {
  if (!req.body?.tenmau) {
    return next(new ApiError(400, "Tên màu sắc không được để trống"));
  }

  try {
    const mauSacService = new MauSacService();
    const document = await mauSacService.create(req.body);
    return res.send({
      message: "Tạo màu sắc mới thành công",
      data: document,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return next(
        new ApiError(400, "Đã tồn tại màu săc này trong cơ sở dữ liệu!"),
      );
    }
    return next(new ApiError(500, "Đã xảy ra lỗi trong quá trình tạo màu sắc"));
  }
};

// =================== 2. Lấy danh sách Màu Sắc (Hỗ trợ lọc theo id, tenmau) =================
exports.findAll = async (req, res, next) => {
  try {
    const mauSacService = new MauSacService();

    const filterData = {
      id: req.query.id, // ?id=MS0001
      tenmau: req.query.tenmau, // ?tenmau=Đen
    };

    const documents = await mauSacService.find(filterData);
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách màu sắc"));
  }
};

// ============================== 3. Cập nhật thông tin Màu Sắc ==================================
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }

  try {
    const mauSacService = new MauSacService();
    const document = await mauSacService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy màu sắc cần cập nhật"));
    }
    return res.send({
      message: "Cập nhật thông tin màu sắc thành công",
      document,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return next(
        new ApiError(400, "Đã tồn tại màu săc này trong cơ sở dữ liệu!"),
      );
    }
    return next(
      new ApiError(500, `Lỗi khi cập nhật màu sắc với mã = ${req.params.id}`),
    );
  }
};

// ============================== 4. Xóa một Màu Sắc ==================================
exports.delete = async (req, res, next) => {
  try {
    const mauSacService = new MauSacService();
    const document = await mauSacService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy màu sắc cần xóa"));
    }
    return res.send({ message: "Đã xóa màu sắc thành công" });
  } catch (error) {
    if (error.code === "P2003") {
      return next(
        new ApiError(
          400,
          "Không thể xóa Màu sắc này vì đang có Sản phẩm thuộc màu sắc này!",
        ),
      );
    }
    return next(
      new ApiError(
        400,
        error.message || `Không thể xóa màu sắc với mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 5. Xóa tất cả Màu Sắc ==================================
exports.deleteAll = async (req, res, next) => {
  try {
    const mauSacService = new MauSacService();
    const deletedCount = await mauSacService.deleteAll();
    return res.send({
      message: `Đã xóa thành công ${deletedCount} màu sắc khỏi hệ thống`,
    });
  } catch (error) {
    if (error.code === "P2003") {
      return next(
        new ApiError(
          400,
          "Không thể xóa tất cả màu sắc vì đang có Sản phẩm thuộc các màu sắc này!",
        ),
      );
    }
    return next(
      new ApiError(400, "Đã xảy ra lỗi khi xóa toàn bộ dữ liệu màu sắc"),
    );
  }
};

// ============================== 6. Tìm chi tiết một Màu Sắc ==================================
exports.findOne = async (req, res, next) => {
  try {
    const mauSacService = new MauSacService();
    const document = await mauSacService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy màu sắc"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi truy vấn màu sắc với mã = ${req.params.id}`),
    );
  }
};
