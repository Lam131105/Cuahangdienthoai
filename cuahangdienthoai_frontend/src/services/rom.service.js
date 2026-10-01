import createApiClient from "./api.service";

class RomService {
  constructor(baseUrl = "/api/rom") {
    this.api = createApiClient(baseUrl);
  }

  // Lấy danh sách ROM hoặc tìm kiếm theo query (?dungluongrom=...)
  async getAll(params = {}) {
    return (await this.api.get("/", { params })).data;
  }

  // Lấy chi tiết 1 loại ROM
  async get(id) {
    return (await this.api.get(`/${id}`)).data;
  }

  // Tạo mới ROM
  async create(data) {
    return (await this.api.post("/", data)).data;
  }

  // Cập nhật ROM
  async update(id, data) {
    return (await this.api.put(`/${id}`, data)).data;
  }

  // Xóa 1 ROM
  async delete(id) {
    return (await this.api.delete(`/${id}`)).data;
  }

  // Xóa tất cả ROM
  async deleteAll() {
    return (await this.api.delete("/")).data;
  }
}

export default new RomService();
