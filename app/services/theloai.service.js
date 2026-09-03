const prisma = require("../../prisma/prisma.js");

class TheLoaiService {
  // Lọc lấy các trường thuộc tính hợp lệ
  extractTheLoaiData(payload) {
    const theLoai = {
      id: payload.id,
      tentheloai: payload.tentheloai,
      mota: payload.mota,
    };
    Object.keys(theLoai).forEach(
      (key) => theLoai[key] === undefined && delete theLoai[key],
    );
    return theLoai;
  }

  // 1. Tạo danh mục mới (Tự sinh mã TL01, TL02 không bị trùng khi xóa)
  async create(payload) {
    if (!payload.id) {
      // Tìm 1 danh mục có ID lớn nhất hiện tại
      const lastTheLoai = await prisma.theloai.findFirst({
        orderBy: {
          id: "desc", // Sắp xếp ID giảm dần (ví dụ: TL05, TL04, TL03...)
        },
      });

      if (!lastTheLoai) {
        // Nếu database chưa có danh mục nào
        payload.id = "TL0001";
      } else {
        // Lấy phần số ra khỏi chuỗi (VD: "TL05" -> lấy số 5)
        const currentNumber =
          parseInt(lastTheLoai.id.replace(/\D/g, ""), 10) || 0;
        // Cộng thêm 1 và format lại thành chuỗi TL06
        payload.id = `TL${String(currentNumber + 1).padStart(4, "0")}`;
      }
    }

    const data = this.extractTheLoaiData(payload);
    try {
      return await prisma.theloai.create({
        data: data,
      });
    } catch (error) {
      // Mã P2002 của Prisma đại diện cho lỗi vi phạm ràng buộc UNIQUE
      if (error.code === "P2002") {
        throw new Error("TEN_THE_LOAI_DA_TON_TAI");
      }
      throw error;
    }
  }

  // 2. Tìm kiếm danh mục theo mã (id) hoặc tên (tentheloai)
  async find(filterData) {
    const where = {};

    // Tìm kiếm chính xác theo mã
    if (filterData.id) {
      where.id = filterData.id;
    }

    // Tìm kiếm gần đúng (chứa từ khóa, không phân biệt hoa thường) theo tên
    if (filterData.tentheloai) {
      where.tentheloai = {
        contains: filterData.tentheloai,
        mode: "insensitive",
      };
    }

    return await prisma.theloai.findMany({
      where: where,
    });
  }

  // ==================== Cập nhật thông tin một Danh Mục dựa trên id ======================
  async update(id, payload) {
    // Trích xuất các trường dữ liệu của Danh mục từ payload gửi lên
    const updateData = this.extractTheLoaiData(payload);
    delete updateData.id; // Không cho phép cập nhật khóa chính (id)

    try {
      // Thực hiện cập nhật vào CSDL bằng phương thức update của Prisma
      const result = await prisma.theloai.update({
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
        throw new Error("TEN_THE_LOAI_DA_TON_TAI");
      }
      throw error;
    }
  }

  // ======================== Xóa Danh Mục dựa trên id ==============================
  async delete(id) {
    try {
      // Đơn giản hóa: Thực hiện xóa trực tiếp theo id
      const result = await prisma.theloai.delete({
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

  // ====================== Xóa tất cả các Danh Mục ========================
  async deleteAll() {
    // Đơn giản hóa: Tiến hành xóa sạch toàn bộ bản ghi
    const result = await prisma.theloai.deleteMany({});
    return result.count; // Trả về số lượng bản ghi đã xóa
  }

  // ==================== Tìm một Danh Mục dựa trên id ======================
  async findById(id) {
    return await prisma.theloai.findUnique({
      where: { id: id },
    });
  }
}

module.exports = TheLoaiService;
