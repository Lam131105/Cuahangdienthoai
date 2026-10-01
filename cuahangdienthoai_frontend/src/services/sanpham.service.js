import createApiClient from "./api.service";

class SanPhamService {
  constructor(baseUrl = "/api/sanpham") {
    this.api = createApiClient(baseUrl);
  }

  // Lấy danh sách Sản phẩm hoặc tìm kiếm theo query (?dungluongsanpham=...)
  async getAll(params = {}) {
    return (await this.api.get("/", { params })).data;
  }

  async getAllForKhachHang(params = {}) {
    return (await this.api.get("/forkhachhang", { params })).data;
  }

  // Lấy chi tiết 1 loại Sản phẩm
  async get(id, params = {}) {
    return (await this.api.get(`/${id}`, { params })).data;
  }

  // Tạo mới Sản phẩm
  async create(data) {
    return (await this.api.post("/", data)).data;
  }

  // Cập nhật Sản phẩm
  async update(id, data) {
    return (await this.api.put(`/${id}`, data)).data;
  }

  // Xóa 1 Sản phẩm
  async delete(id) {
    return (await this.api.delete(`/${id}`)).data;
  }

  // Xóa tất cả Sản phẩm
  async deleteAll() {
    return (await this.api.delete("/")).data;
  }
}

export default new SanPhamService();
