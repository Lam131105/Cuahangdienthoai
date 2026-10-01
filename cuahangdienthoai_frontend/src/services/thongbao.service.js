import createApiClient from "./api.service";

class MauSacService {
  constructor(baseUrl = "/api/thongbao") {
    this.api = createApiClient(baseUrl);
  }

  // Lấy danh sách Màu sắc hoặc tìm kiếm theo query (?tenmau=...)
  async getByKhachHang(makhachhang) {
    return (await this.api.get(`/khachhang/${makhachhang}`)).data;
  }

  // Tạo mới Màu sắc
  async updateSeen(id) {
    return (await this.api.put(`/daxem/${id}`)).data;
  }

  // Xóa 1 Màu sắc
  async delete(id) {
    return (await this.api.delete(`/${id}`)).data;
  }
}

export default new MauSacService();
