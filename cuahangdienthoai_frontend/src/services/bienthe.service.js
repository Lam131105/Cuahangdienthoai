import createApiClient from "./api.service";

class BienTheService {
  constructor(baseUrl = "/api/bienthe") {
    this.api = createApiClient(baseUrl);
  }
  async find(params) {
    return (await this.api.get("/", { params })).data;
  }

  async findBySanPham(id) {
    return (await this.api.get(`/sanpham/${id}`)).data;
  }

  async findById(id) {
    return (await this.api.get(`/${id}`)).data;
  }

  // Tạo mới với FormData (để chứa file)
  async create(data) {
    return (
      await this.api.post("/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data;
  }

  // Cập nhật với FormData
  async update(id, data) {
    return (
      await this.api.put(`/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data;
  }

  async delete(id) {
    return (await this.api.delete(`/${id}`)).data;
  }
}

export default new BienTheService();
