import createApiClient from "./api.service";

class VaiTroService {
  constructor(baseUrl = "/api/vaitro") {
    this.api = createApiClient(baseUrl);
  }

  async getAll() {
    return (await this.api.get("/")).data;
  }
}

export default new VaiTroService();
