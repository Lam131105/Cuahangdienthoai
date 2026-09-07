const RomService = require("../services/rom.service");
const ApiError = require("../api-error");

// ============================== 1. Tạo ROM mới ==================================
exports.create = async (req, res, next) => {
  if (!req.body?.dungluongrom) {
    return next(new ApiError(400, "Dung lượng ROM không được để trống"));
  }

  try {
    const romService = new RomService();
    const document = await romService.create(req.body);
    return res.send({
      message: "Tạo dung lượng ROM mới thành công",
      data: document,
    });
  } catch (error) {
    return next(
      new ApiError(500, "Đã xảy ra lỗi trong quá trình tạo dung lượng ROM"),
    );
  }
};

// =================== 2. Lấy danh sách ROM (Hỗ trợ lọc theo id, dungluongrom) =================
exports.findAll = async (req, res, next) => {
  try {
    const romService = new RomService();

    const filterData = {
      id: req.query.id, // ?id=ROM0001
      dungluongrom: req.query.dungluongrom, // ?dungluongrom=8GB
    };

    const documents = await romService.find(filterData);
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách ROM"));
  }
};

// ============================== 3. Cập nhật thông tin ROM ==================================
exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }

  try {
    const romService = new RomService();
    const document = await romService.update(req.params.id, req.body);
    if (!document) {
      return next(
        new ApiError(404, "Không tìm thấy dung lượng ROM cần cập nhật"),
      );
    }
    return res.send({
      message: "Cập nhật dung lượng ROM thành công",
      document,
    });
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi cập nhật ROM với mã = ${req.params.id}`),
    );
  }
};

// ============================== 4. Xóa một ROM ==================================
exports.delete = async (req, res, next) => {
  try {
    const romService = new RomService();
    const document = await romService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy dung lượng ROM cần xóa"));
    }
    return res.send({ message: "Đã xóa dung lượng ROM thành công" });
  } catch (error) {
    return next(
      new ApiError(
        400,
        error.message || `Không thể xóa ROM với mã = ${req.params.id}`,
      ),
    );
  }
};

// ============================== 5. Xóa tất cả ROM ==================================
exports.deleteAll = async (req, res, next) => {
  try {
    const romService = new RomService();
    const deletedCount = await romService.deleteAll();
    return res.send({
      message: `Đã xóa thành công ${deletedCount} loại ROM khỏi hệ thống`,
    });
  } catch (error) {
    return next(new ApiError(400, "Đã xảy ra lỗi khi xóa toàn bộ dữ liệu ROM"));
  }
};

// ============================== 6. Tìm chi tiết một ROM ==================================
exports.findOne = async (req, res, next) => {
  try {
    const romService = new RomService();
    const document = await romService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy dung lượng ROM"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi truy vấn ROM với mã = ${req.params.id}`),
    );
  }
};
