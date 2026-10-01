const RamService = require("../services/ram.service");
const ApiError = require("../api-error");

// ============================== 1. Tạo RAM mới ==================================
exports.create = async (req, res, next) => {
  if (!req.body?.dungluongram) {
    return next(new ApiError(400, "Dung lượng RAM không được để trống"));
  }

  try {
    const ramService = new RamService();
    const document = await ramService.create(req.body);
    return res.send({
      message: "Tạo dung lượng RAM mới thành công",
      data: document,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return next(
        new ApiError(400, "Đã tồn tại dung lượng Ram này trong cơ sở dữ liệu!"),
      );
    }
    return next(
      new ApiError(500, "Đã xảy ra lỗi trong quá trình tạo dung lượng RAM"),
    );
  }
};

// =================== 2. Lấy danh sách RAM (Hỗ trợ lọc theo id, dungluongram) =================
exports.findAll = async (req, res, next) => {
  try {
    const ramService = new RamService();

    const filterData = {
      id: req.query.id, // ?id=RAM0001
      dungluongram: req.query.dungluongram, // ?dungluongram=8GB
    };

    const documents = await ramService.find(filterData);
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách RAM"));
  }
};

// ============================== 3. Cập nhật thông tin RAM ==================================
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }

  try {
    const ramService = new RamService();
    const document = await ramService.update(req.params.id, req.body);
    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy dung lượng RAM cần cập nhật"),
      );
    }
    return res.send({
      message: "Cập nhật dung lượng RAM thành công",
      document,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return next(new ApiError(400, "Đã tồn tại Ram này trong cơ sở dữ liệu!"));
    }
    return next(
      new ApiError(500, `Lỗi khi cập nhật RAM với mã = ${req.params.id}`),
    );
  }
};

// ============================== 4. Xóa một RAM ==================================
exports.delete = async (req, res, next) => {
  try {
    const ramService = new RamService();
    const document = await ramService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy dung lượng RAM cần xóa"));
    }
    return res.send({ message: "Đã xóa dung lượng RAM thành công" });
  } catch (error) {
    if (error.code === "P2003") {
      return next(
        new ApiError(
          400,
          `Không thể xóa dung lượng Ram ${req.params.id} vì đang có Sản phẩm thuộc dung lượng Ram này!`,
        ),
      );
    }
    return next(
      new ApiError(
        400,
        error.message || `Không thể xóa RAM với mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 5. Xóa tất cả RAM ==================================
exports.deleteAll = async (req, res, next) => {
  try {
    const ramService = new RamService();
    const deletedCount = await ramService.deleteAll();
    return res.send({
      message: `Đã xóa thành công ${deletedCount} loại RAM khỏi hệ thống`,
    });
  } catch (error) {
    if (error.code === "P2003") {
      return next(
        new ApiError(
          400,
          "Không thể xóa tất cả dung lượng Ram vì đang có Sản phẩm thuộc các dung lượng Ram này!",
        ),
      );
    }
    return next(new ApiError(400, "Đã xảy ra lỗi khi xóa toàn bộ dữ liệu RAM"));
  }
};

// ============================== 6. Tìm chi tiết một RAM ==================================
exports.findOne = async (req, res, next) => {
  try {
    const ramService = new RamService();
    const document = await ramService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy dung lượng RAM"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi truy vấn RAM với mã = ${req.params.id}`),
    );
  }
};
