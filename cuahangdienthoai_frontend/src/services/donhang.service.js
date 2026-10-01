import createApiClient from "./api.service"; // Hoặc đường dẫn đến file khởi tạo axios của bạn

class DonHangService {
  constructor(baseUrl = "/api/donhang") {
    this.api = createApiClient(baseUrl);
  }

  // Lấy tất cả đơn hàng
  async getAll() {
    return (await this.api.get("/")).data;
  }

  // Lấy chi tiết đơn hàng theo ID
  async get(id) {
    return (await this.api.get(`/${id}`)).data;
  }

  // Lấy tổng chi tiêu của khách hàng
  async getTongChi(khachhangid) {
    return (await this.api.post("/tongchi", { khachhangid })).data;
  }

  // Tạo đơn hàng mới
  async create(data) {
    return (await this.api.post("/", data)).data;
  }

  // Tạo đơn hàng mới
  async previewcheckout(data) {
    return (await this.api.post("/preview-checkout", data)).data;
  }

  // Cập nhật đơn hàng
  async update(id, data) {
    return (await this.api.put(`/${id}`, data)).data;
  }

  // Xóa đơn hàng
  async delete(id) {
    return (await this.api.delete(`/${id}`)).data;
  }
}

export default new DonHangService();
