import createApiClient from "./api.service";

class AnhSanPhamService {
  constructor(baseUrl = "/api/anhsanpham") {
    this.api = createApiClient(baseUrl);
  }

  // Lấy tất cả ảnh (hoặc lọc theo masanpham qua params)
  async getAll(params = {}) {
    return (await this.api.get("/", { params })).data;
  }

  // Lấy chi tiết 1 ảnh theo ID
  async get(id) {
    return (await this.api.get(`/${id}`)).data;
  }

  // Lấy danh sách ảnh của 1 sản phẩm cụ thể
  async getBySanPham(masanpham) {
    return (await this.api.get(`/sanpham/${masanpham}`)).data;
  }

  // Thêm ảnh mới bằng FormData (chứa file upload)
  async create(data) {
    return (
      await this.api.post("/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data;
  }

  // Cập nhật ảnh/thông tin bằng FormData
  async update(id, data) {
    return (
      await this.api.put(`/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data;
  }

  // Xóa 1 ảnh theo ID
  async delete(id) {
    return (await this.api.delete(`/${id}`)).data;
  }

  // Xóa tất cả ảnh
  async deleteAll() {
    return (await this.api.delete("/")).data;
  }
}

export default new AnhSanPhamService();
