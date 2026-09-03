const prisma = require("../../prisma/prisma.js");
class ThuongHieuService {
  // Lọc lấy các trường thuộc tính hợp lệ
  extractThuongHieuData(payload) {
    const thuongHieu = {
      id: payload.id,
      tenthuonghieu: payload.tenthuonghieu,
      logothuonghieu: payload.logothuonghieu,
      mota: payload.mota,
    };
    Object.keys(thuongHieu).forEach(
      (key) => thuongHieu[key] === undefined && delete thuongHieu[key],
    );
    return thuongHieu;
  }

  // 1. Tạo Thương hiệu mới (Tự sinh mã TL01, TL02 không bị trùng khi xóa)
  async create(payload) {
    if (!payload.id) {
      // Tìm 1 Thương hiệu có ID lớn nhất hiện tại
      const lastThuongHieu = await prisma.thuonghieu.findFirst({
        orderBy: {
          id: "desc", // Sắp xếp ID giảm dần (ví dụ: TL05, TL04, TL03...)
        },
      });

      if (!lastThuongHieu) {
        // Nếu database chưa có Thương hiệu nào
        payload.id = "TH0001";
      } else {
        // Lấy phần số ra khỏi chuỗi (VD: "TL05" -> lấy số 5)
        const currentNumber =
          parseInt(lastThuongHieu.id.replace(/\D/g, ""), 10) || 0;
        // Cộng thêm 1 và format lại thành chuỗi TL06
        payload.id = `TH${String(currentNumber + 1).padStart(4, "0")}`;
      }
    }

    const data = this.extractThuongHieuData(payload);
    try {
      return await prisma.thuonghieu.create({
        data: data,
      });
    } catch (error) {
      // Mã P2002 của Prisma đại diện cho lỗi vi phạm ràng buộc UNIQUE
      if (error.code === "P2002") {
        throw new Error("TEN_THUONG_HIEU_DA_TON_TAI");
      }
      throw error;
    }
  }

  // 2. Tìm kiếm Thương hiệu theo mã (id) hoặc tên (tenthuonghieu)
  async find(filterData) {
    const where = {};

    // Tìm kiếm chính xác theo mã
    if (filterData.id) {
      where.id = filterData.id;
    }

    // Tìm kiếm gần đúng (chứa từ khóa, không phân biệt hoa thường) theo tên
    if (filterData.tenthuonghieu) {
      where.tenthuonghieu = {
        contains: filterData.tenthuonghieu,
        mode: "insensitive",
      };
    }

    return await prisma.thuonghieu.findMany({
      where: where,
    });
  }

  // ==================== Cập nhật thông tin một Thương hiệu dựa trên id ======================
  async update(id, payload) {
    // Trích xuất các trường dữ liệu của Thương hiệu từ payload gửi lên
    const updateData = this.extractThuongHieuData(payload);
    delete updateData.id; // Không cho phép cập nhật khóa chính (id)

    try {
      // Thực hiện cập nhật vào CSDL bằng phương thức update của Prisma
      const result = await prisma.thuonghieu.update({
        where: { id: id },
        data: updateData,
      });
      return result;
    } catch (error) {
      // Nếu không tìm thấy bản ghi cần update, Prisma sẽ ném ra lỗi P2025
      if (error.code === "P2025") {
        return null;
      }
      if (error.code === "P2002") {
        throw new Error("TEN_THUONG_HIEU_DA_TON_TAI");
      }
      throw error;
    }
  }

  // ======================== Xóa Thương hiệu dựa trên id ==============================
  async delete(id) {
    try {
      // Đơn giản hóa: Thực hiện xóa trực tiếp theo id
      const result = await prisma.thuonghieu.delete({
        where: { id: id },
      });
      return result;
    } catch (error) {
      // Nếu không tìm thấy bản ghi cần xóa
      if (error.code === "P2025") {
        return null;
      }
      throw error;
    }
  }

  // ====================== Xóa tất cả các Thương hiệu ========================
  async deleteAll() {
    // Đơn giản hóa: Tiến hành xóa sạch toàn bộ bản ghi
    const result = await prisma.thuonghieu.deleteMany({});
    return result.count; // Trả về số lượng bản ghi đã xóa
  }

  // ==================== Tìm một Thương hiệu dựa trên id ======================
  async findById(id) {
    return await prisma.thuonghieu.findUnique({
      where: { id: id },
    });
  }
}

module.exports = ThuongHieuService;
