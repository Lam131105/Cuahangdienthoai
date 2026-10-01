import createApiClient from "./api.service";

class MauSacService {
  constructor(baseUrl = "/api/chitietdotkhuyenmai") {
    this.api = createApiClient(baseUrl);
  }

  // Lấy danh sách Màu sắc hoặc tìm kiếm theo query (?tenmau=...)
  async getByDotKhuyenMai(madotkhuyenmai) {
    return (await this.api.get(`/dotkhuyenmai/${madotkhuyenmai}`)).data;
  }

  // Tạo mới Màu sắc
  async createMany(data) {
    return (await this.api.post("/", data)).data;
  }

  // Xóa 1 Màu sắc
  async deleteMany(ids) {
    return (await this.api.delete(`/bulk-delete`, { data: { ids } })).data;
  }
}

export default new MauSacService();
