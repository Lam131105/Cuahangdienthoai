import createApiClient from "./api.service";

class KhachHangService {
  constructor(baseUrl = "/api/khachhang") {
    this.api = createApiClient(baseUrl);
  }

  async getAll(params = {}) {
    return (await this.api.get("/", { params })).data;
  }

  async register(data) {
    return (await this.api.post("/", data)).data;
  }

  async login(data) {
    return (await this.api.post("/login", data)).data;
  }

  async deleteAll() {
    return (await this.api.delete("/")).data;
  }

  async get(id) {
    return (await this.api.get(`/${id}`)).data;
  }

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

  async loginWithGoogle(data) {
    return (await this.api.post("/google-login", data)).data;
  }

  async loginWithFacebook(data) {
    return (await this.api.post("/facebook-login", data)).data;
  }
}

export default new KhachHangService();
