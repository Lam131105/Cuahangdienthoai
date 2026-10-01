<template>
  <div class="container py-4">
    <!-- Nút Quay lại & Tiêu đề -->
    <div class="d-flex align-items-center mb-4">
      <button
        class="btn btn-outline-secondary btn-sm me-3 rounded-circle"
        style="width: 36px; height: 36px"
        @click="$router.back()"
        title="Quay lại"
      >
        <i class="fas fa-arrow-left"></i>
      </button>
      <h4 class="fw-bold text-primary mb-0">Chi Tiết Phiếu Giảm Giá</h4>
    </div>

    <!-- Trạng thái Loading -->
    <div v-if="isFetching" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
      <p class="mt-2 text-muted">Đang lấy thông tin phiếu giảm giá...</p>
    </div>

    <!-- Khung Nội Dung Chi Tiết -->
    <div v-else-if="phieuGiamGia" class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-6">
        <!-- Thẻ Voucher Ticket Style -->
        <div
          class="card voucher-detail-card border-0 shadow overflow-hidden mb-4"
        >
          <!-- Banner / Hình ảnh Voucher -->
          <div
            class="voucher-header position-relative bg-light text-center p-3 border-bottom"
          >
            <img
              v-if="phieuGiamGia.duongdananh"
              :src="`http://localhost:5000${phieuGiamGia.duongdananh}`"
              alt="Voucher Banner"
              class="img-fluid voucher-img rounded"
            />
            <div v-else class="py-4 text-muted">
              <i class="bi bi-ticket-perforated display-1 text-primary"></i>
            </div>

            <!-- Mã định danh góc phải -->
            <span
              class="badge bg-danger position-absolute top-0 end-0 m-3 fs-6"
            >
              {{ phieuGiamGia.id }}
            </span>
          </div>

          <!-- Nội dung chi tiết -->
          <div class="card-body p-4">
            <!-- Tên Phiếu & Giá Trị Giảm Nổi Bật -->
            <div class="text-center mb-4">
              <h5 class="fw-bold text-dark mb-2">
                {{ phieuGiamGia.tenphieu }}
              </h5>
              <div class="display-6 fw-bold text-danger">
                {{ formatGiaTriGiam(phieuGiamGia) }}
              </div>
              <span
                class="badge bg-primary-subtle text-primary mt-1 px-3 py-1 fs-7"
              >
                Loại: {{ phieuGiamGia.loaigiamgia }}
              </span>
            </div>

            <hr class="dashed-line my-3" />

            <!-- Diễn giải Điều kiện sử dụng rõ ràng cho khách hàng -->
            <div class="voucher-conditions">
              <h6 class="fw-bold text-secondary mb-3">
                <i class="bi bi-info-circle me-1"></i> Điều kiện áp dụng:
              </h6>

              <ul class="list-unstyled mb-0">
                <!-- 1. Đơn giá tối thiểu -->
                <li class="d-flex align-items-start mb-3">
                  <i class="bi bi-cart-check-fill text-success fs-5 me-3"></i>
                  <div>
                    <strong class="d-block text-dark"
                      >Giá trị đơn hàng tối thiểu:</strong
                    >
                    <span class="text-muted small">
                      Áp dụng cho đơn hàng có tổng tiền từ
                      <strong class="text-primary">{{
                        formatCurrency(phieuGiamGia.dongiatoithieu)
                      }}</strong>
                      trở lên.
                    </span>
                  </div>
                </li>

                <!-- 2. Mức giảm tối đa -->
                <li class="d-flex align-items-start mb-3">
                  <i class="bi bi-shield-lock-fill text-warning fs-5 me-3"></i>
                  <div>
                    <strong class="d-block text-dark">Mức giảm tối đa:</strong>
                    <span class="text-muted small">
                      <template v-if="phieuGiamGia.giamtoida">
                        Giảm tối đa không quá
                        <strong class="text-danger">{{
                          formatCurrency(phieuGiamGia.giamtoida)
                        }}</strong>
                        cho 1 đơn hàng.
                      </template>
                      <template v-else>
                        Không giới hạn mức giảm tối đa.
                      </template>
                    </span>
                  </div>
                </li>

                <!-- 3. Thời hạn sử dụng -->
                <li class="d-flex align-items-start">
                  <i class="bi bi-clock-history text-info fs-5 me-3"></i>
                  <div>
                    <strong class="d-block text-dark">Thời hạn sử dụng:</strong>
                    <span class="text-muted small">
                      Có hiệu lực trong vòng
                      <strong class="text-dark"
                        >{{ phieuGiamGia.thoihan }} ngày</strong
                      >
                      kể từ ngày bạn nhận được phiếu vào ví.
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <!-- Dưới cùng: Nút Mua Sắm Ngay -->
          <div class="card-footer bg-white border-0 p-4 pt-0">
            <router-link
              to="/"
              class="btn btn-primary w-100 py-2 fw-semibold rounded-pill"
            >
              <i class="bi bi-bag-check me-1"></i> Dùng khi mua hàng ngay
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PhieuGiamGiaService from "@/services/phieugiamgia.service";

export default {
  name: "PhieuGiamGiaEdit",
  props: {
    id: { type: String, required: true },
  },
  data() {
    return {
      phieuGiamGia: null,
      isFetching: true,
      isLoading: false,
      errorMessage: "",
    };
  },
  methods: {
    async getPhieuGiamGia(id) {
      this.isFetching = true;
      try {
        this.phieuGiamGia = await PhieuGiamGiaService.get(id);
      } catch (error) {
        console.error("Lỗi lấy chi tiết Phiếu giảm giá:", error);
        this.$router.push({ name: "thongtintaikhoan" });
      } finally {
        this.isFetching = false;
      }
    },

    // Format tiền tệ VNĐ
    formatCurrency(value) {
      if (!value || isNaN(value)) return "0 đ";
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
    },

    // Hiển thị giá trị giảm dễ hiểu
    formatGiaTriGiam(phieu) {
      if (!phieu) return "";
      if (
        phieu.loaigiamgia === "Phần trăm" ||
        phieu.loaigiamgia === "PhanTram"
      ) {
        return `Giảm ${phieu.giatrigiam}%`;
      }
      return `Giảm ${this.formatCurrency(phieu.giatrigiam)}`;
    },
  },
  created() {
    this.getPhieuGiamGia(this.id);
  },
};
</script>

<style scoped>
.voucher-detail-card {
  border-radius: 16px;
  background-color: #ffffff;
}

.voucher-header {
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.voucher-img {
  max-height: 160px;
  object-fit: contain;
}

/* Đường gạch đứt kiểu vé xem phim/voucher */
.dashed-line {
  border: none;
  border-top: 2px dashed #dee2e6;
}

.fs-7 {
  font-size: 0.8rem;
}
</style>
