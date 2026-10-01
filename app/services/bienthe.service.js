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

    payload.soluong = 0;

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
        //     Include đợt khuyến mãi thông qua bảng trung gian
        // sanpham: {
        //   include: {
        //     danhsach_chitietkhuyenmai: {
        //       include: {
        //         dotkhuyenmai: true,
        //       },
        //     },
        //   },
        // },
      },
    });

    // 🟢 Cách viết ngắn gọn & tối ưu hơn:
    return await Promise.all(
      rawList.map((item) => this.applyPromotionToVariant(item)),
    );
  }

  // 3. Lấy tất cả Biến Thể thuộc một Sản Phẩm
  async findBySanPham(masanpham) {
    const rawList = await prisma.bienthe.findMany({
      where: { masanpham: masanpham },
      orderBy: { id: "desc" },
      include: {
        ram: true,
        rom: true,
        mausac: true,
        sanpham: {
          include: {
            danhsach_chitietkhuyenmai: {
              include: {
                dotkhuyenmai: true,
              },
            },
          },
        },
      },
    });

    // 🟢 Cách viết ngắn gọn & tối ưu hơn:
    return await Promise.all(
      rawList.map((item) => this.applyPromotionToVariant(item)),
    );
  }

  // 4. Cập nhật Biến Thể
  async update(id, payload) {
    const updateData = this.extractBienTheData(payload);
    delete updateData.id;
    delete updateData.soluong;

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
    const now = new Date();
    const rawData = await prisma.bienthe.findUnique({
      where: { id: id },
      include: {
        ram: true,
        rom: true,
        mausac: true,
        sanpham: {
          include: {
            danhsach_chitietkhuyenmai: {
              where: {
                dotkhuyenmai: {
                  ngaybatdau: { lte: now },
                  ngayketthuc: { gte: now },
                },
              },
              include: { dotkhuyenmai: true },
            },

            danhsach_anh: {
              where: {
                laanhchinh: true,
              },
            },
          },
        },
      },
    });

    if (!rawData) return null;

    return await this.applyPromotionToVariant(rawData);
  }

  // 🔹 HÀM PHỤ TRỢ: Xử lý tính toán giá khuyến mãi cho 1 Biến Thể
  async applyPromotionToVariant(bienThe) {
    const now = new Date();
    let giagoc = Number(bienThe.gia);
    let giasaugiam = giagoc;
    let dakhuyenmai = false;
    let thongtinkhuyenmai = null;
    const sanPham = await prisma.sanpham.findUnique({
      where: { id: bienThe.masanpham },

      include: {
        danhsach_chitietkhuyenmai: {
          where: {
            dotkhuyenmai: {
              ngaybatdau: { lte: now },
              ngayketthuc: { gte: now },
            },
          },
          include: { dotkhuyenmai: true },
        },
      },
    });

    // 1. Lọc lấy danh sách đợt khuyến mãi ĐANG DIỄN RA + Tính sẵn số tiền giảm thực tế
    const activePromotions = (sanPham.danhsach_chitietkhuyenmai || [])
      .map((ct) => ct.dotkhuyenmai)
      .filter((dot) => {
        if (!dot) return false;
        return true;
      })
      .map((dot) => {
        const giatrigiam = Number(dot.giatrigiam);
        const loaigiamgia = dot.loaigiamgia;
        let giatiengiam = 0;

        // Quy đổi tất cả về số tiền giảm thực tế (để so sánh chính xác)
        if (loaigiamgia === "Phần trăm") {
          giatiengiam = (giagoc * giatrigiam) / 100;
        } else {
          giatiengiam = giatrigiam;
        }

        return {
          ...dot,
          giatrigiam,
          giatiengiam, // 🟢 Lưu số tiền được giảm thực tế
        };
      });

    // 2. Nếu có ít nhất 1 đợt khuyến mãi đang diễn ra
    if (activePromotions.length > 0) {
      // 🟢 3. Tìm đợt khuyến mãi có `giatiengiam` LỚN NHẤT
      const bestPromotion = activePromotions.reduce((best, current) => {
        return current.giatiengiam > best.giatiengiam ? current : best;
      }, activePromotions[0]);

      // Đảm bảo giá sau giảm không bị âm
      giasaugiam = Math.max(0, giagoc - bestPromotion.giatiengiam);
      dakhuyenmai = true;

      thongtinkhuyenmai = {
        madot: bestPromotion.id,
        tendot: bestPromotion.tendot,
        loaigiamgia: bestPromotion.loaigiamgia,
        giatrigiam: bestPromotion.giatrigiam,
        sotiengiam: bestPromotion.giatiengiam,
        ngayketthuc: bestPromotion.ngayketthuc,
      };
    }

    // Loại bỏ mảng trung gian dư thừa
    const { danhsach_chitietkhuyenmai, ...cleanBienThe } = bienThe;

    return {
      ...cleanBienThe,

      giagoc: giagoc,
      giasaugiam: giasaugiam,
      dakhuyenmai: dakhuyenmai,
      thongtinkhuyenmai: thongtinkhuyenmai,
    };
  }
}

module.exports = BienTheService;
