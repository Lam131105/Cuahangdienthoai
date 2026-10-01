import createApiClient from "./api.service"; // Hoặc axios instance của bạn

class GioHangService {
  constructor(baseUrl = "/api/giohang") {
    this.api = createApiClient(baseUrl);
  }

  // Lấy danh sách chi tiết theo Mã Phiếu Nhập
  async getByGioHang(makhachhang) {
    return (await this.api.get(`/khachhang/${makhachhang}`)).data;
  }
}

export default new GioHangService();
