const prisma = require("../../prisma/prisma.js");

class ChiTietDotKhuyenMaiService {
  extractData(payload) {
    const chiTiet = {
      id: payload.id,
      madotkhuyenmai: payload.madotkhuyenmai,
      masanpham: payload.masanpham,
    };
    Object.keys(chiTiet).forEach(
      (key) => chiTiet[key] === undefined && delete chiTiet[key],
    );
    return chiTiet;
  }

  async createMany(payload, client = prisma) {
    const { madotkhuyenmai, masanphams } = payload;

    // 1. Validation cơ bản đầu vào
    if (!madotkhuyenmai) {
      throw new Error("DOT_KHUYEN_MAI_KHONG_TON_TAI");
    }

    if (!masanphams || !Array.isArray(masanphams) || masanphams.length === 0) {
      throw new Error("DANH_SACH_BIEN_THE_RONG");
    }

    // 2. Chạy Transaction cho toàn bộ danh sách biến thể
    return await client.$transaction(async (tx) => {
      // 2.1 Kiểm tra đợt khuyến mãi có tồn tại không
      const dotKhuyenMai = await tx.dotkhuyenmai.findUnique({
        where: { id: madotkhuyenmai },
      });
      if (!dotKhuyenMai) {
        throw new Error("DOT_KHUYEN_MAI_KHONG_TON_TAI");
      }

      // 2.2 Lấy ID cuối cùng để làm mốc sinh mã CTKM tự động
      const lastCT = await tx.chitietdotkhuyenmai.findFirst({
        orderBy: { id: "desc" },
      });
      let currentNumber = lastCT
        ? parseInt(lastCT.id.replace(/\D/g, ""), 10) || 0
        : 0;

      const createdList = [];

      // 2.3 Lặp qua từng biến thể để tạo Chi tiết đợt khuyến mãi
      for (const masanpham of masanphams) {
        // Kiểm tra biến thể có tồn tại không
        const bienThe = await tx.sanpham.findUnique({
          where: { id: masanpham },
        });
        if (!bienThe) {
          throw new Error(`BIEN_THE_KHONG_TON_TAI_${masanpham}`);
        }

        // Kiểm tra xem biến thể đã được thêm vào đợt khuyến mãi này chưa (tránh trùng khóa)
        const existingCTKM = await tx.chitietdotkhuyenmai.findFirst({
          where: {
            madotkhuyenmai: madotkhuyenmai,
            masanpham: masanpham,
          },
        });
        if (existingCTKM) {
          continue; //throw new Error(`BIEN_THE_DA_CO_TRONG_DOT_${masanpham}`);
        }

        currentNumber++;
        const newID = `CTKM${String(currentNumber).padStart(4, "0")}`;

        const itemPayload = {
          id: newID,
          madotkhuyenmai: madotkhuyenmai,
          masanpham: masanpham,
        };

        const data = this.extractData(itemPayload);

        const newDetail = await tx.chitietdotkhuyenmai.create({
          data: data,
          include: {
            dotkhuyenmai: true,
            sanpham: true,
          },
        });

        createdList.push(newDetail);
      }

      return createdList;
    });
  }

  // 2. Tìm danh sách Chi tiết đợt khuyến mãi theo bộ lọc
  async find(filterData) {
    const where = {};

    if (filterData.id) where.id = filterData.id;
    if (filterData.madotkhuyenmai)
      where.madotkhuyenmai = filterData.madotkhuyenmai;
    if (filterData.masanpham) where.masanpham = filterData.masanpham;

    return await prisma.chitietdotkhuyenmai.findMany({
      where: where,
      include: {
        dotkhuyenmai: true,
        sanpham: true,
      },
    });
  }

  // 5. Xóa 1 bản ghi
  async deleteMany(payload, client = prisma) {
    const { ids } = payload;

    // 1. Validation cơ bản đầu vào
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new Error("DANH_SACH_ID_RONG");
    }

    // 2. Chạy Transaction thực hiện xóa
    return await client.$transaction(async (tx) => {
      // Thực hiện xóa tất cả các bản ghi có ID nằm trong mảng truyền vào
      const result = await tx.chitietdotkhuyenmai.deleteMany({
        where: {
          id: {
            in: ids, // Xóa theo danh sách khóa chính CTKMxxxx
          },
        },
      });

      return result; // Trả về dạng { count: số_bản_ghi_đã_xóa }
    });
  }

  // 6. Xóa toàn bộ
  async deleteAll() {
    const result = await prisma.chitietdotkhuyenmai.deleteMany({});
    return result.count;
  }

  // 7. Tìm chi tiết theo ID
  async findById(id) {
    return await prisma.chitietdotkhuyenmai.findUnique({
      where: { id: id },
      include: {
        dotkhuyenmai: true,
        sanpham: true,
      },
    });
  }

  async findByDotKhuyenMai(madotkhuyenmai) {
    return await prisma.chitietdotkhuyenmai.findMany({
      where: { madotkhuyenmai: madotkhuyenmai },
      include: {
        dotkhuyenmai: true,
        sanpham: true,
      },
    });
  }
}

module.exports = ChiTietDotKhuyenMaiService;
