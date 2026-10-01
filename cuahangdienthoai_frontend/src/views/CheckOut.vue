<template>
  <div class="container py-4 mb-5">
    <h4 class="fw-bold mb-4">
      <i class="fas fa-file-invoice-dollar text-primary me-2"></i>Xác nhận đơn
      hàng
    </h4>

    <!-- Trạng thái Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Đang tính toán thông tin đơn hàng...</p>
    </div>

    <!-- Thông báo lỗi khi không thể tải preview -->
    <div
      v-else-if="errorMessage"
      class="alert alert-danger text-center my-4"
      role="alert"
    >
      <i class="fas fa-exclamation-triangle me-2"></i>{{ errorMessage }}
      <div class="mt-3">
        <router-link
          to="/giohang"
          class="btn btn-outline-danger btn-sm fw-bold"
        >
          Quay lại giỏ hàng
        </router-link>
      </div>
    </div>

    <!-- Nội dung Đơn Hàng -->
    <div v-else-if="checkoutData" class="row g-4">
      <!-- Cột trái: Danh sách Sản Phẩm & Voucher -->
      <div class="col-lg-8">
        <!-- 1. Danh sách sản phẩm -->
        <div class="card shadow-sm border-0 rounded-3 mb-4">
          <div class="card-header bg-white py-3 border-bottom">
            <h6 class="fw-bold mb-0 text-dark">
              <i class="fas fa-shopping-bag me-2 text-primary"></i>
              Sản phẩm thanh toán ({{ checkoutData.danhsachsanpham.length }})
            </h6>
          </div>
          <div class="card-body p-0">
            <div
              v-for="(sp, index) in checkoutData.danhsachsanpham"
              :key="sp.chitietgiohangid || index"
              class="p-3 border-bottom last-border-0"
            >
              <div class="d-flex align-items-center gap-3">
                <!-- Ảnh đại diện biến thể/sản phẩm -->
                <img
                  :src="
                    getImageUrl(
                      sp.bienthe?.duongdananh ||
                        sp.bienthe?.sanpham?.danhsach_anh?.[0]?.duongdananh,
                    )
                  "
                  class="rounded border product-thumb"
                  :alt="sp.bienthe?.sanpham?.tensanpham"
                />

                <!-- Thông tin chi tiết -->
                <div class="flex-grow-1">
                  <h6 class="fw-bold text-dark mb-1">
                    {{ sp.bienthe?.sanpham?.tensanpham || "Sản phẩm" }}
                  </h6>

                  <!-- Thông tin Biến thể (RAM / ROM / Màu sắc) -->
                  <div class="mb-2">
                    <span class="badge bg-light text-secondary border me-1">
                      RAM: {{ sp.bienthe?.ram?.dungluongram || "N/A" }}
                    </span>
                    <span class="badge bg-light text-secondary border me-1">
                      ROM: {{ sp.bienthe?.rom?.dungluongrom || "N/A" }}
                    </span>
                    <span class="badge bg-light text-secondary border">
                      Màu: {{ sp.bienthe?.mausac?.tenmau || "N/A" }}
                    </span>
                  </div>

                  <!-- Số lượng & Đơn giá -->
                  <div
                    class="d-flex justify-content-between align-items-center text-muted small"
                  >
                    <span
                      >Số lượng:
                      <b class="text-dark">x{{ sp.soluong }}</b></span
                    >
                    <div>
                      <template v-if="sp.bienthe?.dakhuyenmai && sp.giasaugiam">
                        <span class="text-decoration-line-through extra-small">
                          {{ formatCurrency(sp.giagoc) }}
                        </span>
                        <span class="text-danger fw-bold me-2">
                          {{ formatCurrency(sp.giasaugiam) }} x {{ sp.soluong }}
                        </span>
                      </template>
                      <template v-else>
                        <span class="text-dark fw-bold">
                          {{ formatCurrency(sp.giagoc) }} x {{ sp.soluong }}
                        </span>
                      </template>
                    </div>
                  </div>
                </div>

                <!-- Thành tiền từng món -->
                <div class="text-end ps-2">
                  <div class="text-muted extra-small">Thành tiền</div>
                  <div class="fw-bold text-danger">
                    {{ formatCurrency(sp.thanhtien) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Thông tin Voucher Áp Dụng (nếu có) -->
        <div
          v-if="checkoutData.voucher"
          class="card shadow-sm border-0 rounded-3 mb-4"
        >
          <div class="card-header bg-white py-3 border-bottom">
            <h6 class="fw-bold mb-0 text-dark">
              <i class="fas fa-ticket-alt text-warning me-2"></i>Voucher khuyến
              mãi đã chọn
            </h6>
          </div>
          <div class="card-body p-3">
            <div class="d-flex align-items-center gap-3">
              <img
                :src="getImageUrl(checkoutData.voucher.duongdananh)"
                class="rounded border voucher-thumb"
                alt="Voucher Image"
              />
              <div class="flex-grow-1">
                <h6 class="fw-bold text-success mb-1">
                  {{ checkoutData.voucher.tenvoucher }}
                </h6>
                <p class="text-muted small mb-0">
                  <span v-if="checkoutData.voucher.loaigiamgia === 'Phần trăm'">
                    Giảm {{ checkoutData.voucher.giatrigiam }}% (Tối đa
                    {{ formatCurrency(checkoutData.voucher.giamtoida) }})
                  </span>
                  <span v-else>
                    Giảm trực tiếp
                    {{ formatCurrency(checkoutData.voucher.giatrigiam) }}
                  </span>
                </p>
              </div>
              <div class="text-end">
                <span
                  class="badge bg-success-subtle text-success border border-success px-3 py-2 fw-bold"
                >
                  -{{ formatCurrency(checkoutData.voucher.tiengiam) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Khối chuẩn bị sẵn: Thông tin giao hàng & Phương thức thanh toán -->
        <div class="card shadow-sm border-0 rounded-3 mb-4 bg-light">
          <div class="card-body p-3 text-muted small">
            <i class="fas fa-info-circle me-1"></i>
            Thông tin địa chỉ khách hàng và phương thức thanh toán sẽ được tích
            hợp ở bước này.
          </div>
        </div>

        <div class="card shadow-sm border-0 rounded-3 mb-4 bg-light">
          <div class="card border-0 shadow-sm rounded-3 overflow-hidden">
            <div class="card-body p-3">
              <!-- Header: Tiêu đề + Nút Thay đổi -->
              <div
                class="d-flex justify-content-between align-items-center mb-2"
              >
                <div
                  class="d-flex align-items-center text-danger fw-bold small"
                >
                  <i class="fas fa-map-marker-alt me-2 fs-6"></i>
                  <span>Thông tin nhận hàng</span>
                </div>
                <button
                  class="btn btn-link text-decoration-none p-0 fs-7 fw-semibold"
                  @click="isChangingAddress = !isChangingAddress"
                >
                  {{ isChangingAddress ? "Đóng" : "Thay đổi" }}
                </button>
              </div>

              <!-- Trạng thái 1: Địa chỉ đang chọn (Hiển thị ngắn gọn & nổi bật) -->
              <div
                v-if="isChangingAddress === false"
                class="p-2.5 bg-light rounded-3 d-flex align-items-center"
              >
                <div class="flex-grow-1 text-truncate pe-2">
                  <span
                    class="fw-medium text-dark d-block text-truncate"
                    style="font-size: 0.9rem"
                  >
                    {{ selectedAddressString || "Chưa chọn địa chỉ nhận hàng" }}
                  </span>
                </div>
                <i class="fas fa-chevron-down text-muted small"></i>
              </div>

              <!-- Trạng thái 2: Danh sách địa chỉ dạng Card khi bấm "Thay đổi" -->
              <div v-else class="mt-2 d-flex flex-column gap-2">
                <div
                  v-for="item in addresses"
                  :key="item.id"
                  class="p-3 rounded-3 border transition-all cursor-pointer position-relative"
                  :class="{
                    'border-danger bg-danger-subtle':
                      selectedAddressString === formatFullAddress(item),
                    'border-light-subtle bg-white hover-shadow':
                      selectedAddressString !== formatFullAddress(item),
                  }"
                  @click="selectAddress(item)"
                >
                  <div
                    class="d-flex justify-content-between align-items-start mb-1"
                  >
                    <div class="fw-bold text-dark">
                      {{ item.tennguoinhan }}
                      <span class="text-muted fw-normal"
                        >| {{ item.sdtnguoinhan }}</span
                      >
                    </div>
                    <span
                      v-if="item.lamacdinh"
                      class="badge bg-danger-subtle text-danger border border-danger-subtle ms-2"
                    >
                      Mặc định
                    </span>
                  </div>
                  <div class="text-secondary small">
                    {{ item.diachichitiet }}, {{ item.tenphuongxa }},
                    {{ item.tenquanhuyen }}, {{ item.tentinhthanh }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cột phải: Bảng Tổng Tiền Thanh Toán -->
      <div class="col-lg-4">
        <div
          class="card shadow-sm border-0 rounded-3 sticky-top"
          style="top: 20px"
        >
          <div class="card-header bg-white py-3 border-bottom">
            <h6 class="fw-bold mb-0 text-dark">Tóm tắt đơn hàng</h6>
          </div>
          <div class="card-body p-3">
            <!-- Tổng tiền gốc -->
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">Tổng tiền gốc:</span>
              <span class="fw-semibold">{{
                formatCurrency(checkoutData.tongtiengoc)
              }}</span>
            </div>

            <!-- Tiền giảm đợt khuyến mãi -->
            <div
              v-if="checkoutData.tiengiamdotkhuyenmai > 0"
              class="d-flex justify-content-between mb-2 text-danger"
            >
              <span>Giảm giá khuyến mãi:</span>
              <span
                >-{{ formatCurrency(checkoutData.tiengiamdotkhuyenmai) }}</span
              >
            </div>

            <!-- Tiền giảm Voucher -->
            <div
              v-if="checkoutData.tiengiamvoucher > 0"
              class="d-flex justify-content-between mb-2 text-success"
            >
              <span>Voucher giảm giá:</span>
              <span>-{{ formatCurrency(checkoutData.tiengiamvoucher) }}</span>
            </div>

            <hr class="my-3" />

            <!-- Tổng thanh toán cuối cùng -->
            <div class="d-flex justify-content-between align-items-center mb-4">
              <span class="fw-bold fs-6">Tổng thanh toán:</span>
              <span class="text-danger fw-bold fs-4">
                {{ formatCurrency(checkoutData.tongthanhtoan) }}
              </span>
            </div>

            <!-- Nút Xác nhận Đặt Hàng -->
            <button
              class="btn btn-danger w-100 py-2.5 fw-bold rounded-pill"
              @click="submitOrder"
              :disabled="submitting"
            >
              <span
                v-if="submitting"
                class="spinner-border spinner-border-sm me-1"
              ></span>
              Xác nhận đặt hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DonHangService from "@/services/donhang.service";
import DiaChiService from "@/services/diachi.service.js";

export default {
  name: "Checkout",

  data() {
    return {
      selectedCartIds: [],
      selectedVoucherId: null,
      checkoutData: null,
      loading: false,
      submitting: false,
      errorMessage: "",
      currentUser: null,
      addresses: [],

      selectedAddressString: "", // Chuỗi hoàn chỉnh để gửi API
      isChangingAddress: false,
    };
  },

  created() {
    this.getCurrentUser();
    this.fetchAddresses();
    this.parseQueryParams();
    if (this.selectedCartIds.length > 0) {
      this.fetchPreviewCheckout();
    } else {
      this.errorMessage =
        "Không tìm thấy sản phẩm nào được chọn để thanh toán!";
    }
  },

  methods: {
    // 1. Đọc params từ URL `items` và `voucher`
    parseQueryParams() {
      try {
        const itemsQuery = this.$route.query.items;
        const voucherQuery = this.$route.query.voucher;

        if (itemsQuery) {
          this.selectedCartIds =
            typeof itemsQuery === "string"
              ? JSON.parse(itemsQuery)
              : itemsQuery;
        }
        if (voucherQuery) {
          this.selectedVoucherId = voucherQuery;
        }
      } catch (e) {
        console.error("Lỗi khi đọc query parameters:", e);
        this.errorMessage = "Dữ liệu giỏ hàng không hợp lệ!";
      }
    },

    // 2. Gọi API previewcheckout
    async fetchPreviewCheckout() {
      this.loading = true;
      this.errorMessage = "";
      try {
        const payload = {
          chitietgiohangids: this.selectedCartIds,
          vivoucherid: this.selectedVoucherId || null,
        };

        const res = await DonHangService.previewcheckout(payload);

        if (res.status === "success" || res.data) {
          this.checkoutData = res.data;
        } else {
          this.errorMessage =
            res.message || "Không thể tính toán dữ liệu đơn hàng!";
        }
      } catch (error) {
        console.error("Lỗi khi tải preview checkout:", error);
        const errorMsg =
          error.response?.data?.message ||
          "Đã xảy ra lỗi khi tải dữ liệu đơn hàng!";
        this.errorMessage = errorMsg;
      } finally {
        this.loading = false;
      }
    },

    // 3. Hàm xử lý đặt hàng chính thức (Chuẩn bị mở rộng thêm thông tin địa chỉ/thanh toán)
    // async submitOrder() {
    //   this.submitting = true;
    //   try {
    //     const orderPayload = {
    //       makhachhang: this.currentUser?.id || null,
    //       chitietgiohangids: this.selectedCartIds,
    //       vivoucherid: this.selectedVoucherId || null,
    //       tongtiengoc: this.checkoutData.tongtiengoc,
    //       tiengiamvoucher: this.checkoutData.tiengiamvoucher,
    //       tongthanhtoan: this.checkoutData.tongthanhtoan,
    //       // Sẽ bổ sung madiachi, phuongthucthanhtoan tại đây
    //     };

    //     console.log("Payload tạo đơn hàng:", orderPayload);
    //     alert("Tính năng đặt hàng chuẩn bị gọi API tạo đơn!");
    //   } catch (error) {
    //     console.error("Lỗi khi tạo đơn hàng:", error);
    //   } finally {
    //     this.submitting = false;
    //   }
    // },

    // Tiện ích
    formatCurrency(amount) {
      if (amount === undefined || amount === null) return "0 đ";
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    },

    getImageUrl(path) {
      if (!path) return "https://via.placeholder.com/80";
      if (path.startsWith("http")) return path;
      return `http://localhost:5000${path}`; // Đổi port/host theo backend của bạn
    },

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

    async fetchAddresses() {
      if (!this.currentUser?.id) return;

      this.isLoading = true;
      try {
        // Truyền query param makhachhang đúng với filterData của backend
        const response = await DiaChiService.getAll({
          makhachhang: this.currentUser.id,
        });

        // Đưa địa chỉ mặc định lên đầu danh sách
        this.addresses = (response || []).sort(
          (a, b) => (b.lamacdinh ? 1 : 0) - (a.lamacdinh ? 1 : 0),
        );

        // 🟢 SỬA LỖI TẠI ĐÂY: Thêm "this." vào đầy đủ
        if (this.addresses.length > 0) {
          this.selectedAddressString = this.formatFullAddress(
            this.addresses[0],
          );
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách địa chỉ:", error);
      } finally {
        this.isLoading = false;
      }
    },

    // 1. Hàm tạo chuỗi địa chỉ đầy đủ đúng định dạng lưu database
    formatFullAddress(item) {
      if (!item) return "";
      return `${item.tennguoinhan} | ${item.sdtnguoinhan} | ${item.diachichitiet}, ${item.tenphuongxa}, ${item.tenquanhuyen}, ${item.tentinhthanh}`;
    },

    selectAddress(item) {
      this.selectedAddressString = this.formatFullAddress(item);
      this.isChangingAddress = false; // Tự động đóng lại sau khi chọn
    },
  },
};
</script>

<style scoped>
.product-thumb {
  width: 70px;
  height: 70px;
  object-fit: contain;
  background-color: #f8f9fa;
}

.voucher-thumb {
  width: 60px;
  height: 60px;
  object-fit: contain;
  background-color: #fff;
}

.extra-small {
  font-size: 0.75rem;
}

.last-border-0:last-child {
  border-bottom: none !important;
}

.cursor-pointer {
  cursor: pointer;
}
.transition-all {
  transition: all 0.2s ease-in-out;
}
.bg-danger-subtle {
  background-color: #fff5f5 !important;
}
.hover-shadow:hover {
  border-color: #ffc9c9 !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}
.fs-7 {
  font-size: 0.825rem;
}
</style>
