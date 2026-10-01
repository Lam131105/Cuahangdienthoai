import createApiClient from "./api.service";

class DiaChiService {
  constructor(baseUrl = "/api/diachi") {
    this.api = createApiClient(baseUrl);
  }

  // Lấy danh sách Dia Chi hoặc tìm kiếm theo query (?MaKhachHang=...)
  async getAll(params = {}) {
    return (await this.api.get("/", { params })).data;
  }

  // Lấy chi tiết 1 loại Dia Chi
  async get(id) {
    return (await this.api.get(`/${id}`)).data;
  }

  // Tạo mới Dia Chi
  async create(data) {
    return (await this.api.post("/", data)).data;
  }

  // Cập nhật Dia Chi
  async update(id, data) {
    return (await this.api.put(`/${id}`, data)).data;
  }

  // Xóa 1 Dia Chi
  async delete(id) {
    return (await this.api.delete(`/${id}`)).data;
  }

  // Xóa tất cả Dia Chi
  async deleteAll() {
    return (await this.api.delete("/")).data;
  }
}

export default new DiaChiService();
