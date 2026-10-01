<template>
  <div class="fixed-bottom bg-white border-top shadow-lg py-3 px-4 z-index-100">
    <div
      class="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"
    >
      <!-- KHỐI CHỌN VOUCHER (DẠNG CARD MỞ RỘNG) -->
      <div class="position-relative w-100 w-md-auto" style="min-width: 320px">
        <div class="card border-0 shadow-sm rounded-3 bg-light">
          <div class="card-body p-2 px-3">
            <!-- Header: Tiêu đề + Nút Thay đổi -->
            <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center text-warning fw-bold small">
                <i class="fas fa-ticket-alt me-2 fs-6"></i>
                <span>Voucher ưu đãi</span>
              </div>
              <button
                type="button"
                class="btn btn-link text-decoration-none p-0 fs-7 fw-semibold"
                :disabled="selectedCount === 0"
                @click="isChangingVoucher = !isChangingVoucher"
              >
                {{ isChangingVoucher ? "Đóng" : "Thay đổi" }}
              </button>
            </div>

            <!-- Trạng thái: Voucher đang chọn -->
            <div
              class="d-flex align-items-center cursor-pointer mt-1"
              @click="
                selectedCount > 0 && (isChangingVoucher = !isChangingVoucher)
              "
            >
              <div class="flex-grow-1 text-truncate pe-2">
                <span
                  class="fw-medium d-block text-truncate"
                  :class="
                    selectedVoucher
                      ? 'text-warning-emphasis fw-bold'
                      : 'text-muted'
                  "
                  style="font-size: 0.875rem"
                  ><div v-if="selectedVoucher">
                    <i class="fas fa-check-circle me-2 text-success"></i>
                    {{
                      selectedVoucher
                        ? selectedVoucher.phieugiamgia?.tenphieu
                        : "-- Không sử dụng Voucher --"
                    }}
                  </div>
                </span>
              </div>
              <i class="fas fa-chevron-down text-muted small"></i>
            </div>
          </div>
        </div>

        <!-- Popup Danh sách Voucher (Hiển thị khi bấm "Thay đổi", sổ ngược lên trên) -->
        <div
          v-if="isChangingVoucher"
          class="position-absolute start-0 w-100 bg-white border rounded-3 shadow-lg p-3 z-index-1050 mb-2"
          style="bottom: 100%; max-height: 300px; overflow-y: auto"
        >
          <div class="d-flex flex-column gap-2">
            <!-- Option 1: Không dùng Voucher -->
            <div
              class="p-2.5 px-3 rounded-3 border transition-all cursor-pointer"
              :class="{
                'border-warning bg-warning-subtle': !selectedVoucherId,
                'border-light-subtle bg-white hover-shadow': selectedVoucherId,
              }"
              @click="selectVoucher('')"
            >
              <div class="fw-bold text-dark fs-7">
                -- Không sử dụng Voucher --
              </div>
            </div>

            <!-- Option 2: Danh sách Voucher khả dụng -->
            <div
              v-for="item in vouchers"
              :key="item.id"
              class="p-2.5 px-3 rounded-3 border transition-all cursor-pointer position-relative"
              :class="{
                'border-warning bg-warning-subtle':
                  selectedVoucherId === item.id,
                'border-light-subtle bg-white hover-shadow':
                  selectedVoucherId !== item.id,
              }"
              @click="selectVoucher(item.id)"
            >
              <!-- Chi tiết thông tin giảm giá -->
              <div class="d-flex align-items-center gap-3">
                <img
                  :src="getImageUrl(item.phieugiamgia.duongdananh)"
                  class="rounded border voucher-thumb"
                  alt="Voucher Image"
                />
                <div class="flex-grow-1">
                  <h6 class="fw-bold text-success mb-1">
                    {{ item.phieugiamgia.tenphieu }}
                  </h6>

                  <p class="text-muted small mb-0">
                    <span v-if="item.phieugiamgia.loaigiamgia === 'Phần trăm'">
                      Giảm {{ item.phieugiamgia.giatrigiam }}% (Tối đa
                      {{ formatCurrency(item.phieugiamgia.giamtoida) }})
                    </span>
                    <span v-else>
                      Giảm trực tiếp
                      {{ formatCurrency(item.phieugiamgia.giatrigiam) }}
                    </span>
                  </p>
                  <div class="fw-bold text-info mb-1 small">
                    Áp dụng với đơn hàng từ
                    {{ formatCurrency(item.phieugiamgia.dongiatoithieu) }} trở
                    lên
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- KHỐI TỔNG TIỀN & NÚT ĐẶT HÀNG (GIỮ NGUYÊN) -->
      <div
        class="d-flex align-items-center justify-content-between justify-content-md-end gap-4 w-100 w-md-auto"
      >
        <div class="text-end" v-if="previewData">
          <div
            v-if="previewData.voucher"
            class="text-success small fw-bold mb-1"
          >
            <div
              v-if="
                previewData.voucher.loaigiamgia !== 'Tiền cố định' &&
                previewData.tiengiamvoucher == previewData.voucher.giamtoida
              "
            >
              <i class="fas fa-exclamation-triangle me-1"></i>Đã đạt giá trị
              giảm tối đa
              {{ formatCurrency(previewData.voucher.giamtoida) }}
            </div>
          </div>
          <div class="text-muted extra-small">
            Tổng gốc: {{ formatCurrency(previewData.tongtiengoc) }}
            <span
              v-if="previewData.tiengiamdotkhuyenmai > 0"
              class="text-danger ms-1"
            >
              (Giảm KM: -{{ formatCurrency(previewData.tiengiamdotkhuyenmai) }})
            </span>
            <span
              v-if="previewData.tiengiamvoucher > 0"
              class="text-success ms-1"
            >
              (Voucher: -{{ formatCurrency(previewData.tiengiamvoucher) }})
            </span>
          </div>
          <div>
            <span class="fw-bold me-1">Tổng thanh toán:</span>
            <span class="text-danger fw-bold fs-4">
              {{ formatCurrency(previewData.tongthanhtoan) }}
            </span>
          </div>
        </div>

        <div class="text-end" v-else>
          <div class="text-muted small">Chưa chọn sản phẩm nào</div>
          <span class="text-danger fw-bold fs-4">0 đ</span>
        </div>

        <button
          class="btn btn-danger btn-lg px-4 fw-bold text-nowrap rounded-pill"
          :disabled="selectedCount === 0 || loadingPreview"
          @click="$emit('checkout')"
        >
          <span
            v-if="loadingPreview"
            class="spinner-border spinner-border-sm me-1"
          ></span>
          Đặt hàng ({{ selectedCount }})
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CartCheckoutBar",
  props: {
    vouchers: {
      type: Array,
      default: () => [],
    },
    selectedVoucherId: {
      type: String,
      default: "",
    },
    selectedCount: {
      type: Number,
      default: 0,
    },
    previewData: {
      type: Object,
      default: null,
    },

    loadingPreview: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isChangingVoucher: false,
    };
  },
  computed: {
    // Tự động tìm thông tin Voucher đang được chọn
    selectedVoucher() {
      return this.vouchers.find((v) => v.id === this.selectedVoucherId) || null;
    },
  },
  methods: {
    selectVoucher(voucherId) {
      // Báo lên component cha (GioHang.vue) để gọi API tính lại tiền
      this.$emit("update:selectedVoucherId", voucherId);
      // Tự động đóng popup danh sách
      this.isChangingVoucher = false;
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount || 0);
    },
    getImageUrl(path) {
      if (!path) return "https://via.placeholder.com/80";
      if (path.startsWith("http")) return path;
      return `http://localhost:5000${path}`; // Đổi port/host theo backend của bạn
    },
  },
};
</script>

<style scoped>
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
