const prisma = require("../../prisma/prisma.js");

class BienTheService {
  // Trích xuất thuộc tính Biến Thể
  extractBienTheData(payload) {
    const bienThe = {
      id: payload.id,
      gia: payload.gia !== undefined ? parseFloat(payload.gia) : undefined,
      soluong:
        payload.soluong !== undefined
          ? parseInt(payload.soluong, 10)
          : undefined,
      duongdananh: payload.duongdananh,
      masanpham: payload.masanpham,
      maram: payload.maram,
      marom: payload.marom,
      mamausac: payload.mamausac,
    };
    Object.keys(bienThe).forEach(
      (key) => bienThe[key] === undefined && delete bienThe[key],
    );
    return bienThe;
  }

  // 1. Tạo Biến Thể mới (Tự sinh mã BT0001, BT0002...)
  async create(payload, client = prisma) {
    if (!payload.id) {
      const lastBT = await client.bienthe.findFirst({
        orderBy: { id: "desc" },
      });
      const currentNumber = lastBT
        ? parseInt(lastBT.id.replace(/\D/g, ""), 10) || 0
        : 0;
      payload.id = `BT${String(currentNumber + 1).padStart(4, "0")}`;
    }

    if (payload.soluong === undefined) {
      payload.soluong = 0;
    }

    const data = this.extractBienTheData(payload);

    try {
      return await client.bienthe.create({
        data: data,
        include: {
          sanpham: true,
          ram: true,
          rom: true,
          mausac: true,
        },
      });
    } catch (error) {
      // Bắt lỗi trùng lặp bộ 4 (Khóa duy nhất @@unique)
      if (error.code === "P2002") {
        throw new Error("BIEN_THE_DA_TON_TAI");
      }

      // Bắt lỗi không tồn tại khóa ngoại
      if (error.code === "P2003") {
        if (error.meta?.field_name?.includes("masanpham"))
          throw new Error("SAN_PHAM_KHONG_TON_TAI");
        if (error.meta?.field_name?.includes("maram"))
          throw new Error("RAM_KHONG_TON_TAI");
        if (error.meta?.field_name?.includes("marom"))
          throw new Error("ROM_KHONG_TON_TAI");
        if (
          error.meta?.field_name?.includes("mams") ||
          error.meta?.field_name?.includes("mamausac")
        )
          throw new Error("MAU_SAC_KHONG_TON_TAI");
      }

      throw error;
    }
  }

  // 2. Tìm danh sách Biến Thể theo bộ lọc
  async find(filterData) {
    const where = {};

    if (filterData.id) where.id = filterData.id;
    if (filterData.masanpham) where.masanpham = filterData.masanpham;
    if (filterData.maram) where.maram = filterData.maram;
    if (filterData.marom) where.marom = filterData.marom;
    if (filterData.mamausac) where.mamausac = filterData.mamausac;

    const rawList = await prisma.bienthe.findMany({
      where: where,
      include: {
        sanpham: true,
        ram: true,
        rom: true,
        mausac: true,
        // Include đợt khuyến mãi thông qua bảng trung gian
        danhsach_chitietkhuyenmai: {
          include: {
            dotkhuyenmai: true,
          },
        },
      },
    });

    // Tính toán giá sau giảm cho từng biến thể trong danh sách
    return rawList.map((item) => this.applyPromotionToVariant(item));
  }

  // 3. Lấy tất cả Biến Thể thuộc một Sản Phẩm
  async findBySanPham(masanpham) {
    const rawList = await prisma.bienthe.findMany({
      where: { masanpham: masanpham },
      include: {
        ram: true,
        rom: true,
        mausac: true,
        danhsach_chitietkhuyenmai: {
          include: {
            dotkhuyenmai: true,
          },
        },
      },
    });

    return rawList.map((item) => this.applyPromotionToVariant(item));
  }

  // 4. Cập nhật Biến Thể
  async update(id, payload) {
    const updateData = this.extractBienTheData(payload);
    delete updateData.id;

    try {
      return await prisma.bienthe.update({
        where: { id: id },
        data: updateData,
        include: {
          sanpham: true,
          ram: true,
          rom: true,
          mausac: true,
        },
      });
    } catch (error) {
      if (error.code === "P2025") return null;
      if (error.code === "P2002") {
        throw new Error("BIEN_THE_DA_TON_TAI");
      }
      if (error.code === "P2003") {
        if (error.meta?.field_name?.includes("masanpham"))
          throw new Error("SAN_PHAM_KHONG_TON_TAI");
        if (error.meta?.field_name?.includes("maram"))
          throw new Error("RAM_KHONG_TON_TAI");
        if (error.meta?.field_name?.includes("marom"))
          throw new Error("ROM_KHONG_TON_TAI");
        if (error.meta?.field_name?.includes("mamausac"))
          throw new Error("MAU_SAC_KHONG_TON_TAI");
      }
      throw error;
    }
  }

  // 5. Xóa 1 Biến Thể
  async delete(id) {
    try {
      return await prisma.bienthe.delete({
        where: { id: id },
      });
    } catch (error) {
      if (error.code === "P2025") return null;
      throw error;
    }
  }

  // 6. Xóa tất cả Biến Thể
  async deleteAll() {
    const result = await prisma.bienthe.deleteMany({});
    return result.count;
  }

  // 7. Tìm chi tiết Biến Thể theo ID
  async findById(id) {
    const rawData = await prisma.bienthe.findUnique({
      where: { id: id },
      include: {
        sanpham: true,
        ram: true,
        rom: true,
        mausac: true,
        danhsach_chitietkhuyenmai: {
          include: {
            dotkhuyenmai: true,
          },
        },
      },
    });

    if (!rawData) return null;

    return this.applyPromotionToVariant(rawData);
  }

  // 🔹 HÀM PHỤ TRỢ: Xử lý tính toán giá khuyến mãi cho 1 Biến Thể
  applyPromotionToVariant(bienThe) {
    const now = new Date();
    let giagoc = Number(bienThe.gia);
    let giasaugiam = giagoc;
    let dakhuyenmai = false;
    let thongtinkhuyenmai = null;

    // Lọc lấy danh sách đợt khuyến mãi ĐANG DIỄN RA
    const activePromotions = (bienThe.danhsach_chitietkhuyenmai || [])
      .map((ct) => ct.dotkhuyenmai)
      .filter((dot) => {
        if (!dot) return false;
        const start = new Date(dot.ngaybatdau);
        const end = new Date(dot.ngayketthuc);
        return start <= now && now <= end;
      });

    // Nếu có ít nhất 1 đợt khuyến mãi đang diễn ra
    if (activePromotions.length > 0) {
      // Ưu tiên chọn đợt khuyến mãi có giá trị giảm sâu nhất (hoặc đợt mới nhất)
      const dotKhuyenMai = activePromotions[0];
      const giatrigiam = Number(dotKhuyenMai.giatrigiam);
      const loaigiamgia = dotKhuyenMai.loaigiamgia; // "Phần trăm" hoặc "Số tiền" / "Cố định"

      let giatiengiam = 0;

      if (loaigiamgia === "Phần trăm") {
        giatiengiam = (giagoc * giatrigiam) / 100;
      } else {
        // Giảm theo số tiền cố định (VD: giảm 500,000đ)
        giatiengiam = giatrigiam;
      }

      // Đảm bảo giá sau giảm không bị âm
      giasaugiam = Math.max(0, giagoc - giatiengiam);
      dakhuyenmai = true;

      thongtinkhuyenmai = {
        madot: dotKhuyenMai.id,
        tendot: dotKhuyenMai.tendot,
        loaigiamgia: loaigiamgia,
        giatrigiam: giatrigiam,
        sotiengiam: giatiengiam,
        ngayketthuc: dotKhuyenMai.ngayketthuc,
      };
    }

    // Loại bỏ mảng trung gian dư thừa để JSON trả về gọn đẹp hơn
    const { danhsach_chitietkhuyenmai, ...cleanBienThe } = bienThe;

    return {
      ...cleanBienThe,
      giagoc: giagoc,
      giasaugiam: giasaugiam,
      dakhuyenmai: dakhuyenmai,
      thongtinkhuyenmai: thongtinkhuyenmai,
    };
  }

  // 🔹 Lấy biến thể rẻ nhất (sau khuyến mãi) đại diện cho 1 sản phẩm
  async findCheapestBySanPham(masanpham) {
    // 1. Lấy tất cả biến thể của sản phẩm
    const rawList = await prisma.bienthe.findMany({
      where: { masanpham: masanpham },
      include: {
        sanpham: true,
        ram: true,
        rom: true,
        mausac: true,
        danhsach_chitietkhuyenmai: {
          include: {
            dotkhuyenmai: true,
          },
        },
      },
    });

    if (rawList.length === 0) return null;

    // 2. Tính giá sau giảm cho tất cả biến thể
    const calculatedVariants = rawList.map((item) =>
      this.applyPromotionToVariant(item),
    );

    // 3. Sắp xếp biến thể theo giá sau giảm tăng dần (Ascending)
    calculatedVariants.sort((a, b) => {
      //Nếu hàm trả về một số âm (< 0): a được xếp trước b.

      // Nếu hàm trả về một số dương (> 0): b được xếp trước a.

      // Nếu hàm trả về 0: Giữ nguyên vị trí tương đối giữa a và b.
      if (a.giasaugiam !== b.giasaugiam) {
        return a.giasaugiam - b.giasaugiam; // Ưu tiên giá sau giảm rẻ hơn
      }
      return a.giagoc - b.giagoc; // Nếu bằng giá sau giảm, ưu tiên giá gốc rẻ hơn
    });

    // 4. Trả về biến thể rẻ nhất (phần tử đầu tiên)
    return calculatedVariants[0];
  }
}

module.exports = BienTheService;
