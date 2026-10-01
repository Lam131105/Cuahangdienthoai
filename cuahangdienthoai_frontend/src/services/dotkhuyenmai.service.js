import createApiClient from "./api.service";

class DotKhuyenMaiService {
  constructor(baseUrl = "/api/dotkhuyenmai") {
    this.api = createApiClient(baseUrl);
  }

  async getAll(params = {}) {
    return (await this.api.get("/", { params })).data;
  }

  async getActive() {
    return (await this.api.get(`/active`)).data;
  }
  async get(id) {
    return (await this.api.get(`/${id}`)).data;
  }
  async create(data) {
    return (await this.api.post("/", data)).data;
  }
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

export default new DotKhuyenMaiService();
