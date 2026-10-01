import createApiClient from "./api.service";

class PhieuNhapService {
  constructor(baseUrl = "/api/phieunhap") {
    this.api = createApiClient(baseUrl);
  }

  // Lấy danh sách RAM hoặc tìm kiếm theo query (?dungluongram=...)
  async getAll(params = {}) {
    return (await this.api.get("/", { params })).data;
  }

  // Lấy chi tiết 1 loại RAM
  async get(id) {
    return (await this.api.get(`/${id}`)).data;
  }

  // Tạo mới RAM
  async create(data) {
    return (await this.api.post("/", data)).data;
  }

  // Cập nhật RAM
  async update(id, data) {
    return (await this.api.put(`/${id}`, data)).data;
  }

  // Xóa 1 RAM
  async delete(id) {
    return (await this.api.delete(`/${id}`)).data;
  }

  // Xóa tất cả RAM
  async deleteAll() {
    return (await this.api.delete("/")).data;
  }
}

export default new PhieuNhapService();
