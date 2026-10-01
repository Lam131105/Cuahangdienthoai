import createApiClient from "./api.service"; // Hoặc axios instance của bạn

class ChiTietGioHangService {
  constructor(baseUrl = "/api/chitietgiohang") {
    this.api = createApiClient(baseUrl);
  }

  // Lấy danh sách chi tiết theo Mã Phiếu Nhập
  async getAll(makhachhang) {
    return (await this.api.get(`/khachhang/${makhachhang}`)).data;
  }

  // Thêm 1 sản phẩm/biến thể vào phiếu nhập
  async create(data) {
    return (await this.api.post("/", data)).data;
  }

  // Cập nhật số lượng / giá nhập của 1 chi tiết
  async update(id, data) {
    return (await this.api.put(`/${id}`, data)).data;
  }

  // Xóa 1 chi tiết (tự động trả tồn kho & tính lại tổng tiền)
  async delete(id) {
    return (await this.api.delete(`/${id}`)).data;
  }
}

export default new ChiTietGioHangService();
