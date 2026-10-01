import createApiClient from "./api.service";

class NhaCungCapService {
  constructor(baseUrl = "/api/nhacungcap") {
    this.api = createApiClient(baseUrl);
  }

  // Lấy tất cả hoặc tìm kiếm theo query (?name=...)
  async getAll(params = {}) {
    return (await this.api.get("/", { params })).data;
  }

  // Lấy chi tiết 1 nhà cung cấp
  async get(id) {
    return (await this.api.get(`/${id}`)).data;
  }

  // Tạo mới nhà cung cấp
  async create(data) {
    return (await this.api.post("/", data)).data;
  }

  // Cập nhật nhà cung cấp
  async update(id, data) {
    return (await this.api.put(`/${id}`, data)).data;
  }

  // Xóa 1 nhà cung cấp
  async delete(id) {
    return (await this.api.delete(`/${id}`)).data;
  }

  // Xóa tất cả nhà cung cấp
  async deleteAll() {
    return (await this.api.delete("/")).data;
  }
}

export default new NhaCungCapService();
