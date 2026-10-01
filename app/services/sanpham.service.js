const prisma = require("../../prisma/prisma.js");
const BienTheService = require("./bienthe.service");
const YeuThichService = require("./yeuthich.service");
const ThongSoKyThuatService = require("./thongsokythuat.service.js");

class SanPhamService {
  constructor() {
    this.bienTheService = new BienTheService();
    this.yeuThichService = new YeuThichService();
    this.thongSoKyThuatService = new ThongSoKyThuatService();
  }
  // Trích xuất dữ liệu sản phẩm
  extractSanPhamData(payload) {
    const sanPham = {
      id: payload.id,
      tensanpham: payload.tensanpham,
      mota: payload.mota,
      trangthai:
        payload.trangthai !== undefined
          ? Boolean(payload.trangthai)
          : undefined,
      mathuonghieu: payload.mathuonghieu,
      matheloai: payload.matheloai,
      manhacungcap: payload.manhacungcap,
    };
    Object.keys(sanPham).forEach(
      (key) => sanPham[key] === undefined && delete sanPham[key],
    );
    return sanPham;
  }

  // 1. Tạo Sản phẩm mới (Có hỗ trợ Transaction Client)
  async create(payload) {
    // Sử dụng Transaction để đảm bảo cả 2 cùng tạo thành công hoặc cùng thất bại
    return await prisma.$transaction(async (tx) => {
      // 1. TỰ SINH MÃ SẢN PHẨM (SP0001, SP0002...)
      if (!payload.id) {
        const lastSP = await tx.sanpham.findFirst({
          orderBy: { id: "desc" },
        });
        const currentNumber = lastSP
          ? parseInt(lastSP.id.replace(/\D/g, ""), 10) || 0
          : 0;
        payload.id = `SP${String(currentNumber + 1).padStart(4, "0")}`;
      }

      if (payload.trangthai === undefined) {
        payload.trangthai = true;
      }

      // Trích xuất dữ liệu sản phẩm
      const sanPhamData = this.extractSanPhamData(payload);

      // 2. TẠO SẢN PHẨM MỚI
      const newSanPham = await tx.sanpham.create({
        data: sanPhamData,
      });

      // 3. TẠO THÔNG SỐ KỸ THUẬT (Nếu client có gửi kèm dữ liệu thongsokythuat)
      let newThongSo = null;
      if (
        payload.thongsokythuat &&
        Object.keys(payload.thongsokythuat).length > 0
      ) {
        // Gọi hàm create của ThongSoKyThuatService và truyền `tx` (transaction client) vào
        newThongSo = await this.thongSoKyThuatService.create(
          {
            ...payload.thongsokythuat,
            masanpham: newSanPham.id, // Gán mã sản phẩm vừa tạo vào thông số
          },
          tx, // Truyền client transaction để nằm trong cùng 1 giao dịch
        );
      }

      // 4. TRẢ VỀ KẾT QUẢ TỔNG HỢP
      return {
        ...newSanPham,
        thongsokythuat: newThongSo,
      };
    });
  }

  async findForKhachHang(filterData) {
    const where = {};

    // =========================================================================
    // 1. RÀNG BUỘC HIỂN THỊ DÀNH CHO KHÁCH HÀNG (Bắt buộc đủ 3 điều kiện)
    // =========================================================================

    // Bắt buộc sản phẩm đang ở trạng thái kinh doanh (nếu không truyền cụ thể)
    where.trangthai =
      filterData.trangthai !== undefined && filterData.trangthai !== ""
        ? filterData.trangthai === "true" || filterData.trangthai === true
        : true;

    // Điều kiện 1: Bắt buộc phải có ÍT NHẤT 1 HÌNH CẢNH
    where.danhsach_anh = {
      some: {},
    };

    // Điều kiện 2: Bắt buộc phải CÓ THÔNG SỐ KỸ THUẬT
    where.thongsokythuat = {
      isNot: null,
    };

    // =========================================================================
    // 2. LỌC THEO THUỘC TÍNH SẢN PHẨM & BIẾN THỂ
    // =========================================================================
    if (filterData.id) where.id = filterData.id;
    if (filterData.mathuonghieu) where.mathuonghieu = filterData.mathuonghieu;
    if (filterData.manhacungcap) where.manhacungcap = filterData.manhacungcap;
    if (filterData.matheloai) where.matheloai = filterData.matheloai;
    if (filterData.trangthai) where.trangthai = filterData.trangthai;

    if (filterData.tensanpham) {
      where.tensanpham = {
        contains: filterData.tensanpham,
        mode: "insensitive",
      };
    }

    // Lọc biến thể theo RAM, ROM, Màu sắc (Nếu có)
    const bienTheWhere = {};
    if (filterData.maram) bienTheWhere.maram = filterData.maram;
    if (filterData.marom) bienTheWhere.marom = filterData.marom;
    if (filterData.mamausac) bienTheWhere.mamausac = filterData.mamausac;

    // Điều kiện 3: Bắt buộc phải CÓ BIẾN THỂ (Thỏa mãn bộ lọc nếu có truyền RAM/ROM/Màu)
    where.danhsach_bienthe = {
      some: bienTheWhere,
    };

    // =========================================================================
    // 3. TRUY VẤN CƠ SỞ DỮ LIỆU
    // =========================================================================
    const now = new Date();
    const sanPhams = await prisma.sanpham.findMany({
      where: where,
      include: {
        thuonghieu: true,
        theloai: true,
        nhacungcap: true,
        danhsach_anh: {
          where: {
            laanhchinh: true,
          },
        }, // Kèm ảnh để hiển thị UI
        thongsokythuat: true, // Kèm thông số kỹ thuật
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

    if (!sanPhams || sanPhams.length === 0) {
      return [];
    }
    // Tìm yêu chích sản phẩm
    const listProductIds = sanPhams.map((sp) => sp.id);

    // 4. Query 2: Gom nhóm đếm tổng lượt thích của từng sản phẩm (Chỉ 1 Query)
    const likeCounts = await prisma.yeuthich.groupBy({
      by: ["masanpham"],
      where: { masanpham: { in: listProductIds } },
      _count: { masanpham: true },
    });
    const likeCountMap = new Map(
      likeCounts.map((item) => [item.masanpham, item._count.masanpham]),
    );

    // 5. Query 3: Kiểm tra xem User hiện tại đã bấm Tim sản phẩm nào chưa (Chỉ 1 Query)
    let userLikedSet = new Set();
    if (filterData.makhachhang) {
      const userLikes = await prisma.yeuthich.findMany({
        where: {
          makhachhang: filterData.makhachhang,
          masanpham: { in: listProductIds },
        },
        select: { masanpham: true },
      });
      userLikedSet = new Set(userLikes.map((item) => item.masanpham));
    }

    // =========================================================================
    // 4. BỔ SUNG BIẾN THỂ RẺ NHẤT LÀM ĐẠI DIỆN
    // =========================================================================
    const result = await Promise.all(
      sanPhams.map(async (sp) => {
        // Lấy danh sách các biến thể thỏa mãn bộ lọc của sản phẩm này
        const bienThes = await this.bienTheService.find({
          masanpham: sp.id,
          ...bienTheWhere,
        });

        // Phòng trường hợp biến thể không hợp lệ ở tầng service
        if (!bienThes || bienThes.length === 0) {
          return null;
        }

        // Sắp xếp tăng dần theo giá thực tế (ưu tiên giá sau giảm)
        bienThes.sort((a, b) => {
          const giaA = Number(a.giasaugiam ?? a.giagoc);
          const giaB = Number(b.giasaugiam ?? b.giagoc);
          return giaA - giaB;
        });

        const bienTheReNhat = bienThes[0];

        return {
          ...sp,
          giathapnhat: Number(bienTheReNhat.giasaugiam ?? bienTheReNhat.giagoc),
          giagoc_daidien: Number(bienTheReNhat.giagoc),
          dakhuyenmai: bienThes.some((bt) => bt.dakhuyenmai),
          tongso_bienthe_phuhop: bienThes.length,
          bienthe_daidien: bienTheReNhat,
          tongluotthich: likeCountMap.get(sp.id) || 0,
          dathich: userLikedSet.has(sp.id),
        };
      }),
    );

    return result.filter(Boolean);
  }

  async find(filterData) {
    const where = {};

    // 1. Lọc theo thuộc tính Sản Phẩm
    if (filterData.id) where.id = filterData.id;
    if (filterData.mathuonghieu) where.mathuonghieu = filterData.mathuonghieu;
    if (filterData.manhacungcap) where.manhacungcap = filterData.manhacungcap;
    if (filterData.matheloai) where.matheloai = filterData.matheloai;

    if (filterData.trangthai !== undefined && filterData.trangthai !== "") {
      if (filterData.trangthai === "true") {
        where.trangthai = true;
      }
      if (filterData.trangthai === "false") {
        where.trangthai = false;
      }
    }

    if (filterData.tensanpham) {
      where.tensanpham = {
        contains: filterData.tensanpham,
        mode: "insensitive",
      };
    }

    // 2. Lọc theo thuộc tính Biến Thể (nếu người dùng chọn RAM/ROM/Màu)
    const bienTheWhere = {};
    if (filterData.maram) bienTheWhere.maram = filterData.maram;
    if (filterData.marom) bienTheWhere.marom = filterData.marom;
    if (filterData.mamausac) bienTheWhere.mamausac = filterData.mamausac;

    const isFilteringBienThe = Object.keys(bienTheWhere).length > 0;

    if (isFilteringBienThe) {
      where.danhsach_bienthe = {
        some: bienTheWhere,
      };
    }

    // 3. Lấy danh sách Sản phẩm từ DB
    const now = new Date();
    const sanPhams = await prisma.sanpham.findMany({
      where: where,
      orderBy: { id: "desc" },
      include: {
        thuonghieu: true,
        theloai: true,
        nhacungcap: true,
        thongsokythuat: true,
        danhsach_anh: {
          where: {
            laanhchinh: true,
          },
        },
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

    if (!sanPhams || sanPhams.length === 0) {
      return [];
    }

    // Tìm yêu chích sản phẩm
    const listProductIds = sanPhams.map((sp) => sp.id);

    // 4. Query 2: Gom nhóm đếm tổng lượt thích của từng sản phẩm (Chỉ 1 Query)
    const likeCounts = await prisma.yeuthich.groupBy({
      by: ["masanpham"],
      where: { masanpham: { in: listProductIds } },
      _count: { masanpham: true },
    });
    const likeCountMap = new Map(
      likeCounts.map((item) => [item.masanpham, item._count.masanpham]),
    );

    // 5. Query 3: Kiểm tra xem User hiện tại đã bấm Tim sản phẩm nào chưa (Chỉ 1 Query)
    let userLikedSet = new Set();
    if (filterData.makhachhang) {
      const userLikes = await prisma.yeuthich.findMany({
        where: {
          makhachhang: filterData.makhachhang,
          masanpham: { in: listProductIds },
        },
        select: { masanpham: true },
      });
      userLikedSet = new Set(userLikes.map((item) => item.masanpham));
    }

    // 4. Map qua từng Sản phẩm để tính giá rẻ nhất
    const result = await Promise.all(
      sanPhams.map(async (sp) => {
        const bienThes = await this.bienTheService.find({
          masanpham: sp.id,
          ...bienTheWhere,
        });

        // Nếu KHÔNG có biến thể
        if (!bienThes || bienThes.length === 0) {
          // Nếu người dùng ĐANG LỌC RAM/ROM/Màu mà sp này không có biến thể thỏa mãn -> Bỏ qua
          if (isFilteringBienThe) {
            return null;
          }
          // Nếu không lọc biến thể (xem danh sách chung ở Admin) -> Vẫn trả về sản phẩm
          return {
            ...sp,
            giathapnhat: null,
            dakhuyenmai: false,
            tongso_bienthe_phuhop: 0,
            bienthe_daidien: null,
            tongluotthich: likeCountMap.get(sp.id) || 0,
            dathich: userLikedSet.has(sp.id),
          };
        }

        // Sắp xếp tăng dần theo giá
        bienThes.sort((a, b) => {
          const giaA = Number(a.giasaugiam ?? a.giagoc);
          const giaB = Number(b.giasaugiam ?? b.giagoc);
          return giaA - giaB;
        });

        const bienTheReNhat = bienThes[0];
        const yeuThichs = await this.yeuThichService.findBySanPham(sp.id);
        return {
          ...sp,
          giathapnhat: Number(bienTheReNhat.giasaugiam ?? bienTheReNhat.giagoc),
          dakhuyenmai: bienThes.some((bt) => bt.dakhuyenmai),
          tongso_bienthe_phuhop: bienThes.length,
          bienthe_daidien: bienTheReNhat,
          tongluotthich: yeuThichs.tongYeuThich,
          tongluotthich: likeCountMap.get(sp.id) || 0,
          dathich: userLikedSet.has(sp.id),
        };
      }),
    );

    return result.filter(Boolean);
  }

  // 5. Cập nhật Sản phẩm
  async update(id, payload) {
    // 1. Đảm bảo lấy được thongsokythuat ra trước khi lọc sanpham
    const thongSoData = payload.thongsokythuat;

    // 2. Lấy dữ liệu sản phẩm & Xóa các quan hệ lọt vào (thuonghieu, theloai, nhacungcap, thongsokythuat)
    const updateData = this.extractSanPhamData(payload);
    delete updateData.id;
    delete updateData.thuonghieu;
    delete updateData.theloai;
    delete updateData.nhacungcap;
    delete updateData.thongsokythuat;

    try {
      return await prisma.$transaction(async (tx) => {
        // 3. Xử lý Cập nhật/Tạo mới Thông số kỹ thuật
        if (
          thongSoData &&
          typeof thongSoData === "object" &&
          Object.keys(thongSoData).length > 0
        ) {
          // Bóc tách làm sạch thongSoData: Xóa id và masanpham ra khỏi data update
          const cleanThongSoData = { ...thongSoData };
          delete cleanThongSoData.id;
          delete cleanThongSoData.masanpham;
          delete cleanThongSoData.massanpham;

          // Tìm thông số kỹ thuật theo ID sản phẩm (Sửa đúng tên field theo Schema của bạn)
          // LƯU Ý: Hãy kiểm tra schema.prisma xem tên cột là 'masanpham' hay 'massanpham'
          const thongsokithuat = await tx.thongsokythuat.findFirst({
            where: { masanpham: id }, // Hoặc massanpham: id
          });

          if (thongsokithuat) {
            // Đã có -> Gọi update với dữ liệu ĐÃ LÀM SẠCH (không chứa ID)
            await this.thongSoKyThuatService.update(
              thongsokithuat.id,
              cleanThongSoData,
              tx,
            );
          } else {
            // Chưa có -> Gọi create
            await this.thongSoKyThuatService.create(
              { masanpham: id, ...cleanThongSoData },
              tx,
            );
          }
        }

        // 4. Cập nhật bảng Sản phẩm
        return await tx.sanpham.update({
          where: { id: id },
          data: updateData,
        });
      });
    } catch (error) {
      console.error("Lỗi cập nhật sản phẩm:", error); // Thêm log để dễ debug nếu crash
      if (error.code === "P2025") return null;
      if (error.code === "P2003") {
        if (error.meta?.field_name?.includes("mathuonghieu")) {
          throw new Error("THUONG_HIEU_KHONG_TON_TAI");
        }
        if (error.meta?.field_name?.includes("matheloai")) {
          throw new Error("THE_LOAI_KHONG_TON_TAI");
        }
        if (error.meta?.field_name?.includes("nhacungcap")) {
          throw new Error("NHA_CUNG_CAP_KHONG_TON_TAI");
        }
      }
      throw error;
    }
  }
  // 6. Xóa 1 Sản phẩm
  async delete(id) {
    try {
      return await prisma.sanpham.delete({
        where: { id: id },
      });
    } catch (error) {
      if (error.code === "P2025") {
        return null;
      }
      throw error;
    }
  }

  // 7. Xóa toàn bộ Sản phẩm
  async deleteAll() {
    const result = await prisma.sanpham.deleteMany({});
    return result.count;
  }

  async findById(id, filterData) {
    // 3. Lấy danh sách Sản phẩm từ DB
    const now = new Date();
    const sanPham = await prisma.sanpham.findUnique({
      where: { id: id },

      include: {
        thuonghieu: true,
        theloai: true,
        nhacungcap: true,
        thongsokythuat: true,

        danhsach_anh: true,

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

    if (!sanPham) {
      return null;
    }

    // 4. Query 2: Gom nhóm đếm tổng lượt thích của từng sản phẩm (Chỉ 1 Query)

    const likeCounts = await prisma.yeuthich.aggregate({
      where: { masanpham: sanPham.id },
      _count: { id: true },
    });

    // 5. Query 3: Kiểm tra xem User hiện tại đã bấm Tim sản phẩm nào chưa (Chỉ 1 Query)
    let userLikedSet = false;
    if (filterData.makhachhang) {
      let userLikes = await prisma.yeuthich.findUnique({
        where: {
          masanpham_makhachhang: {
            masanpham: sanPham.id,
            makhachhang: filterData.makhachhang,
          },
        },
      });
      if (userLikes != null) {
        userLikedSet = true;
      }
    }

    // 4. Map qua từng Sản phẩm để tính giá rẻ nhất
    const bienThes = await this.bienTheService.find({
      masanpham: sanPham.id,
    });

    // Nếu KHÔNG có biến thể
    if (!bienThes || bienThes.length === 0) {
      // Nếu người dùng ĐANG LỌC RAM/ROM/Màu mà sp này không có biến thể thỏa mãn -> Bỏ qua

      return {
        dakhuyenmai: false,
        danhsach_bienthe: null,
        tongluotthich: likeCounts._count.id,
        dathich: userLikedSet,
      };
    }
    return {
      ...sanPham,
      dakhuyenmai: bienThes.some((bt) => bt.dakhuyenmai),
      danhsach_bienthe: bienThes,
      tongluotthich: likeCounts._count.id,
      dathich: userLikedSet,
    };
  }
}
module.exports = SanPhamService;
