const prisma = require("../../prisma/prisma.js");

class ChiTietNhapService {
  extractData(payload) {
    const data = {
      id: payload.id,
      soluongnhap:
        payload.soluongnhap !== undefined
          ? parseInt(payload.soluongnhap, 10)
          : undefined,
      gianhap:
        payload.gianhap !== undefined ? parseFloat(payload.gianhap) : undefined,
      maphieunhap: payload.maphieunhap,
      mabienthe: payload.mabienthe,
    };
    Object.keys(data).forEach(
      (key) => data[key] === undefined && delete data[key],
    );
    return data;
  }

  // Hàm phụ: Tính toán lại tổng tiền của Phiếu Nhập
  async recalculatePhieuNhapTotal(maphieunhap, tx = prisma) {
    const allDetails = await tx.chitietnhap.findMany({
      where: { maphieunhap: maphieunhap },
    });

    const totalMoney = allDetails.reduce((sum, item) => {
      return sum + Number(item.soluongnhap) * Number(item.gianhap);
    }, 0);

    await tx.phieunhap.update({
      where: { id: maphieunhap },
      data: { tongtien: Number(totalMoney.toFixed(2)) },
    });
  }

  // 1. Tạo 1 Chi tiết nhập mới
  async create(payload) {
    return await prisma.$transaction(async (tx) => {
      // 1. Kiểm tra tồn tại của Phiếu nhập & Biến thể
      const phieuNhap = await tx.phieunhap.findUnique({
        where: { id: payload.maphieunhap },
      });
      if (!phieuNhap) throw new Error("PHIEU_NHAP_KHONG_TON_TAI");

      const bienThe = await tx.bienthe.findUnique({
        where: { id: payload.mabienthe },
      });
      if (!bienThe) throw new Error("BIEN_THE_KHONG_TON_TAI");

      // 2. Tự động sinh mã CTN0001, CTN0002...
      if (!payload.id) {
        const last = await tx.chitietnhap.findFirst({
          orderBy: { id: "desc" },
        });
        const currentNumber = last
          ? parseInt(last.id.replace(/\D/g, ""), 10) || 0
          : 0;
        payload.id = `CTN${String(currentNumber + 1).padStart(4, "0")}`;
      }

      const data = this.extractData(payload);

      // 3. Tạo bản ghi Chi tiết nhập
      const newDetail = await tx.chitietnhap.create({
        data: data,
        include: { bienthe: true, phieunhap: true },
      });

      // 4. Cộng thêm số lượng nhập vào kho biến thể
      await tx.bienthe.update({
        where: { id: payload.mabienthe },
        data: {
          soluong: { increment: data.soluongnhap },
        },
      });

      // 5. Cập nhật lại tổng tiền phiếu nhập
      await this.recalculatePhieuNhapTotal(payload.maphieunhap, tx);

      return newDetail;
    });
  }

  // 3. Tìm theo bộ lọc
  async find(filterData) {
    const where = {};

    if (filterData.id) where.id = filterData.id;
    if (filterData.maphieunhap) where.maphieunhap = filterData.maphieunhap;
    if (filterData.mabienthe) where.mabienthe = filterData.mabienthe;

    return await prisma.chitietnhap.findMany({
      where: where,
      include: {
        bienthe: true,
        phieunhap: true,
      },
    });
  }

  // 4. Lấy theo Mã Phiếu Nhập
  async findByPhieuNhap(maphieunhap) {
    return await prisma.chitietnhap.findMany({
      where: { maphieunhap: maphieunhap },
      include: {
        bienthe: {
          include: {
            sanpham: true,
            ram: true,
            rom: true,
            mausac: true,
          },
        },
      },
    });
  }

  // 5. Cập nhật Chi tiết nhập (Tự động điều chỉnh bù trừ tồn kho)
  async update(id, payload) {
    return await prisma.$transaction(async (tx) => {
      const oldDetail = await tx.chitietnhap.findUnique({
        where: { id: id },
      });
      if (!oldDetail) return null;

      const updateData = this.extractData(payload);
      delete updateData.id;
      delete updateData.maphieunhap; // Không cho phép đổi mã phiếu nhập

      const newQty =
        updateData.soluongnhap !== undefined
          ? updateData.soluongnhap
          : oldDetail.soluongnhap;
      const newBienTheId = updateData.mabienthe || oldDetail.mabienthe;

      // Xử lý biến thể kho:
      if (newBienTheId === oldDetail.mabienthe) {
        // Trường hợp cùng biến thể: Tính chênh lệch số lượng (Mới - Cũ)
        const diffQty = newQty - oldDetail.soluongnhap;
        if (diffQty !== 0) {
          await tx.bienthe.update({
            where: { id: oldDetail.mabienthe },
            data: { soluong: { increment: diffQty } },
          });
        }
      } else {
        // Trường hợp đổi sang biến thể khác: Hoàn lại kho cũ & Cộng kho mới
        await tx.bienthe.update({
          where: { id: oldDetail.mabienthe },
          data: { soluong: { decrement: oldDetail.soluongnhap } },
        });
        await tx.bienthe.update({
          where: { id: newBienTheId },
          data: { soluong: { increment: newQty } },
        });
      }

      // Cập nhật chi tiết nhập
      const updatedDetail = await tx.chitietnhap.update({
        where: { id: id },
        data: updateData,
        include: { bienthe: true, phieunhap: true },
      });

      // Tính lại tổng tiền phiếu nhập
      await this.recalculatePhieuNhapTotal(oldDetail.maphieunhap, tx);

      return updatedDetail;
    });
  }

  // 6. Xóa Chi tiết nhập
  async delete(id) {
    return await prisma.$transaction(async (tx) => {
      const detail = await tx.chitietnhap.findUnique({
        where: { id: id },
      });
      if (!detail) return null;

      // Trừ trả lại số lượng tồn kho đã nhập trước đó
      await tx.bienthe.update({
        where: { id: detail.mabienthe },
        data: { soluong: { decrement: detail.soluongnhap } },
      });

      // Xóa bản ghi
      const deleted = await tx.chitietnhap.delete({
        where: { id: id },
      });

      // Tính lại tổng tiền phiếu nhập
      await this.recalculatePhieuNhapTotal(detail.maphieunhap, tx);

      return deleted;
    });
  }

  // 7. Tìm chi tiết theo ID
  async findById(id) {
    return await prisma.chitietnhap.findUnique({
      where: { id: id },
      include: {
        bienthe: true,
        phieunhap: true,
      },
    });
  }
}

module.exports = ChiTietNhapService;
