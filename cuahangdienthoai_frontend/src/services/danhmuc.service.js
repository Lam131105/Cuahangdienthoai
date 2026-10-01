import createApiClient from "./api.service";

class DanhMucService {
  constructor(baseUrl = "/api/danhmuc") {
    this.api = createApiClient(baseUrl);
  }

  async getAll(params = {}) {
    return (await this.api.get("/", { params })).data;
  }

  async get(id) {
    return (await this.api.get(`/${id}`)).data;
  }

  // Tạo danh mục mới
  async create(data) {
    return (await this.api.post("/", data)).data;
  }

  // Cập nhật danh mục
  async update(id, data) {
    return (await this.api.put(`/${id}`, data)).data;
  }
  async delete(id) {
    return (await this.api.delete(`/${id}`)).data;
  }

  async deleteAll() {
    return (await this.api.delete("/")).data;
  }
}

export default new DanhMucService();
