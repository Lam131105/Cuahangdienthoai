import createApiClient from "./api.service";

class ViVoucherService {
  constructor(baseUrl = "/api/vivoucher") {
    this.api = createApiClient(baseUrl);
  }

  async getByKhachHang(makhachhang) {
    return (await this.api.get(`/khachhang/${makhachhang}`)).data;
  }
}

export default new ViVoucherService();
