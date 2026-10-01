<template>
  <div class="container py-4">
    <h3 class="fw-bold text-primary mb-1">
      Tổng chi của quý khách: {{ formatCurrency(tongChi) }}
    </h3>

    <VoucherProgressTracker :dieuKiens="dieuKiens" :tongChi="tongChi" />
    <!-- Tiêu đề trang -->
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div>
        <h3 class="fw-bold text-primary mb-1">
          <i class="bi bi-wallet2 me-2"></i>Ví Voucher Của Tôi
        </h3>
        <p class="text-muted small mb-0">
          Danh sách các mã giảm giá bạn đang sở hữu và có thể áp dụng khi mua
          hàng.
        </p>
      </div>
      <button class="btn btn-outline-secondary btn-sm" @click="fetchMyVouchers">
        <i class="bi bi-arrow-clockwise me-1"></i> Làm mới
      </button>
    </div>

    <!-- Thông báo Alert lỗi nếu có -->
    <div
      v-if="errorMessage"
      class="alert alert-danger alert-dismissible fade show mb-4"
      role="alert"
    >
      <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
      <button
        type="button"
        class="btn-close"
        @click="errorMessage = ''"
      ></button>
    </div>

    <!-- Trạng thái Loading -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải ví voucher...</span>
      </div>
      <p class="mt-2 text-muted">Đang tải danh sách voucher của bạn...</p>
    </div>

    <!-- Trạng thái Trống (Chưa có voucher nào) -->
    <div
      v-else-if="vouchers.length === 0"
      class="card border-0 shadow-sm text-center py-5"
    >
      <div class="card-body">
        <i class="bi bi-ticket-perforated text-muted display-1"></i>
        <h5 class="fw-bold mt-3 text-secondary">Ví Voucher đang trống</h5>
        <p class="text-muted">
          Bạn chưa sở hữu voucher nào. Hãy tích lũy chi tiêu để nhận thêm nhiều
          phần thưởng hấp dẫn!
        </p>
        <router-link
          to="/"
          class="btn btn-primary px-4 fw-semibold rounded-pill"
        >
          <i class="bi bi-cart me-1"></i> Mua sắm ngay
        </router-link>
      </div>
    </div>

    <!-- Danh Sách Voucher Hiện Có -->
    <div v-else class="row g-3">
      <div class="col-12 text-end text-muted small mb-2">
        Tổng số: <strong>{{ vouchers.length }}</strong> Phiếu giảm giá
      </div>

      <div
        v-for="item in vouchers"
        :key="item.maphieugiamgia"
        class="col-12 col-md-6 col-lg-4"
      >
        <!-- Click vào cả thẻ card để chuyển trang -->
        <div
          class="card voucher-card border-0 shadow-sm h-100 overflow-hidden clickable-card"
          @click="goToVoucher(item.phieugiamgia.id)"
          title="Nhấn để xem chi tiết phiếu giảm giá"
        >
          <div class="card-body p-3 d-flex align-items-center gap-3">
            <!-- Hình ảnh voucher bên trái -->
            <div class="voucher-img-wrapper flex-shrink-0">
              <img
                :src="getImageUrl(item.phieugiamgia.duongdananh)"
                alt="voucher image"
                class="voucher-img rounded"
              />
            </div>

            <!-- Thông tin chi tiết Voucher bên phải -->
            <div class="voucher-info flex-grow-1 overflow-hidden">
              <span
                class="badge bg-danger-subtle text-danger border border-danger-subtle ms-1 flex-shrink-0"
              >
                {{ item.id }}|{{ item.maphieugiamgia }}
              </span>

              <!-- Số lượng nếu gom nhóm -->
              <div v-if="item.tongSoluong || item.soluong" class="mb-1">
                <span class="badge bg-primary rounded-pill">
                  x{{ item.tongSoluong || item.soluong }} khả dụng
                </span>
              </div>

              <div class="text-muted small" style="font-size: 0.75rem">
                <i class="bi bi-hourglass-split me-1"></i>
                Thời hạn: {{ item.phieugiamgia.thoihan }} ngày
              </div>

              <div
                v-if="item.ngayketthuc"
                class="text-muted small"
                style="font-size: 0.75rem"
              >
                <i class="bi bi-clock me-1"></i>
                Hạn dùng: {{ formatDate(item.ngayketthuc) }}
              </div>
            </div>
          </div>
          <h6
            class="fw-bold text-dark text-truncate mb-0 text-center"
            :title="item.phieugiamgia.tenphieu"
          >
            {{ item.phieugiamgia.tenphieu }}
          </h6>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ViVoucherService from "@/services/vivoucher.service";
import DieuKienNhanVoucherService from "@/services/dieukiennhanvoucher.service";
import VoucherProgressTracker from "@/components/VoucherProgressTracker.vue";
import DonHangService from "@/services/donhang.service";

export default {
  name: "UserVoucherWallet",
  components: {
    VoucherProgressTracker,
  },
  data() {
    return {
      dieuKiens: [],
      vouchers: [],
      tongChi: 0,
      isLoading: false,
      errorMessage: "",
      currentUser: null,
      defaultImage: "http://localhost:5000phieugiamgia.png",
    };
  },
  methods: {
    formatCurrency(value) {
      if (!value && value !== 0) return "0 đ";
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(value);
    },
    async fetchDieuKiens() {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        this.dieuKiens = await DieuKienNhanVoucherService.getAll();
      } catch (error) {
        console.error("Lỗi tải danh sách điều kiện nhận voucher:", error);
        this.errorMessage = "Không thể lấy danh sách điều kiện nhận voucher!";
      } finally {
        this.isLoading = false;
      }
    },

    async getTongChi() {
      const maKH = this.currentUser?.id;

      if (!maKH) {
        this.errorMessage =
          "Bạn chưa đăng nhập hoặc thông tin tài khoản không hợp lệ.";
        return;
      }
      try {
        const res = await DonHangService.getTongChi(maKH);
        // Gán kết quả tổng chi tiêu vào biến tongChi
        this.tongChi = Number(res.data?.tongchi) || 0;
      } catch (error) {
        console.error("Lỗi tải danh sách điều kiện nhận voucher:", error);
        this.errorMessage = "Không thể lấy danh sách điều kiện nhận voucher!";
      } finally {
        this.isLoading = false;
      }
    },
    getImageUrl(fileName) {
      if (!fileName) return this.defaultImage;
      // Nếu đường dẫn lưu trong DB đã là link đầy đủ (http...) thì giữ nguyên
      if (fileName.startsWith("http")) return fileName;
      // Nối với URL server uploads của bạn
      return `http://localhost:5000${fileName}`;
    },
    // 1. Lấy thông tin user hiện tại từ localStorage
    getCurrentUser() {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          this.currentUser = null;
          return null;
        }

        const parsedUser = JSON.parse(userStr);

        // Xử lý bọc lót (fallback): Nếu dữ liệu cũ lỡ bị bọc trong dạng { user: {...} }
        const userData = parsedUser;

        // Mặc định gán role là "khachhang" nếu thiếu role
        this.currentUser = {
          ...userData,
          role: userData.role || "khachhang",
        };

        return this.currentUser;
      } catch (e) {
        console.error("Lỗi trích xuất thông tin người dùng:", e);
        this.currentUser = null;
        // Nếu JSON hỏng, xóa luôn để tránh lỗi lặp lại
        localStorage.removeItem("user");
        return null;
      }
    },

    // 2. Tải danh sách ví voucher từ API Backend
    async fetchMyVouchers() {
      // Xác định mã khách hàng (ví dụ: makhachhang, id, hoặc maKH tùy theo struct User của bạn)
      const maKH = this.currentUser?.id;

      if (!maKH) {
        this.errorMessage =
          "Bạn chưa đăng nhập hoặc thông tin tài khoản không hợp lệ.";
        return;
      }

      this.isLoading = true;
      this.errorMessage = "";
      try {
        // Trả về mảng đã được backend group theo maphieugiamgia
        this.vouchers = await ViVoucherService.getByKhachHang(maKH);
      } catch (error) {
        console.error("Lỗi lấy danh sách ví voucher:", error);
        this.errorMessage =
          error.response?.data?.message ||
          "Không thể tải danh sách voucher của bạn. Vui lòng thử lại sau.";
      } finally {
        this.isLoading = false;
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("vi-VN").format(date);
    },

    goToVoucher(id) {
      this.$router.push({ name: "phieugiamgia", params: { id } });
    },
  },
  mounted() {
    this.getCurrentUser();
    this.fetchMyVouchers();
    this.fetchDieuKiens();
    this.getTongChi();
  },
};
</script>

<style scoped>
/* Thẻ voucher hỗ trợ click */
.clickable-card {
  cursor: pointer;
  transition: all 0.25s ease-in-out;
  border-left: 4px solid #0d6efd !important; /* Viền xanh điểm nhấn phía bên trái */
}

/* Hiệu ứng khi di chuột vào thẻ */
.clickable-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 0.5rem 1.2rem rgba(13, 110, 253, 0.15) !important;
  border-left-color: #0b5ed7 !important;
}

/* Bọc hình ảnh voucher cho cân đối */
.voucher-img-wrapper {
  width: 80px;
  height: 75px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 6px;
  overflow: hidden;
}

.voucher-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
