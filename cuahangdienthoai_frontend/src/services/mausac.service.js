import createApiClient from "./api.service";

class MauSacService {
  constructor(baseUrl = "/api/mausac") {
    this.api = createApiClient(baseUrl);
  }

  // Lấy danh sách Màu sắc hoặc tìm kiếm theo query (?tenmau=...)
  async getAll(params = {}) {
    return (await this.api.get("/", { params })).data;
  }

  // Lấy chi tiết 1 loại Màu sắc
  async get(id) {
    return (await this.api.get(`/${id}`)).data;
  }

  // Tạo mới Màu sắc
  async create(data) {
    return (await this.api.post("/", data)).data;
  }

  // Cập nhật Màu sắc
  async update(id, data) {
    return (await this.api.put(`/${id}`, data)).data;
  }

  // Xóa 1 Màu sắc
  async delete(id) {
    return (await this.api.delete(`/${id}`)).data;
  }

  // Xóa tất cả Màu sắc
  async deleteAll() {
    return (await this.api.delete("/")).data;
  }
}

export default new MauSacService();
