<template>
  <div class="container-fluid py-4">
    <!-- Tiêu đề trang -->
    <h3 class="fw-bold text-primary mb-4">
      <i class="bi bi-list-check me-2"></i>Quản Lý Điều Kiện Nhận Voucher
    </h3>
    <!-- Thanh Tiến Trình Thành Tựu Mốc Tặng Voucher (Thành phần mới) -->
    <VoucherProgressTracker :dieuKiens="dieuKiens" />
    <!-- Thanh Tìm Kiếm & Nút Thao Tác -->
    <div class="row g-3 align-items-center mb-4">
      <div class="col-md-8">
        <div class="row g-2">
          <div class="col-md-4">
            <input
              type="text"
              class="form-control"
              placeholder="Mã điều kiện (VD: DKV0001)..."
              v-model="searchId"
              @keyup.enter="fetchDieuKiens"
            />
          </div>
          <div class="col-md-4">
            <input
              type="text"
              class="form-control"
              placeholder="Mã phiếu giảm giá..."
              v-model="searchMaphieugiamgia"
              @keyup.enter="fetchDieuKiens"
            />
          </div>
          <div class="col-md-4">
            <button
              class="btn btn-outline-primary w-100"
              @click="fetchDieuKiens"
            >
              <i class="bi bi-search me-1"></i> Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      <div class="col-md-4 text-end">
        <button class="btn btn-success me-2 fw-semibold" @click="goToAddForm">
          <i class="bi bi-plus-circle me-1"></i> Thêm mới
        </button>
        <button
          class="btn btn-danger fw-semibold"
          @click="removeAllDieuKiens"
          :disabled="dieuKiens.length === 0"
        >
          <i class="bi bi-trash me-1"></i> Xóa tất cả
        </button>
      </div>
    </div>

    <!-- Thông báo Alert -->
    <div
      v-if="message"
      class="alert alert-success alert-dismissible fade show"
      role="alert"
    >
      <i class="bi bi-check-circle-fill me-2"></i>{{ message }}
      <button type="button" class="btn-close" @click="message = ''"></button>
    </div>
    <div
      v-if="errorMessage"
      class="alert alert-danger alert-dismissible fade show"
      role="alert"
    >
      <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
      <button
        type="button"
        class="btn-close"
        @click="errorMessage = ''"
      ></button>
    </div>

    <!-- Bảng Danh Sách Điều Kiện Nhận Voucher -->
    <div class="card shadow-sm border-0">
      <div
        class="card-footer bg-white text-muted text-end py-2 fs-7"
        v-if="!isLoading"
      >
        Tổng số: <strong>{{ dieuKiens.length }}</strong> Điều kiện
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-dark">
              <tr>
                <th class="ps-3" style="width: 120px">MÃ DK</th>
                <th>Mốc Chi Tối Thiểu</th>
                <th>Số Lượng Nhận</th>
                <th>Mã Phiếu Giảm Giá</th>
                <th>Thông Tin Phiếu Giảm Giá</th>
                <th class="text-center" style="width: 120px">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <!-- Trạng thái Loading -->
              <tr v-if="isLoading">
                <td colspan="6" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Đang tải...</span>
                  </div>
                  <p class="mt-2 text-muted mb-0">
                    Đang lấy danh sách điều kiện...
                  </p>
                </td>
              </tr>

              <!-- Danh sách Trống -->
              <tr v-else-if="dieuKiens.length === 0">
                <td colspan="6" class="text-center py-4 text-muted">
                  Không tìm thấy Điều kiện nhận voucher nào.
                </td>
              </tr>

              <!-- Hiển thị Danh Sách -->
              <tr v-else v-for="dk in dieuKiens" :key="dk.id">
                <td class="ps-3 fw-bold text-primary">{{ dk.id }}</td>
                <td class="fw-bold text-success">
                  {{ formatCurrency(dk.mocchitoithieu) }}
                </td>
                <td>
                  <span class="badge bg-info text-dark fs-6">
                    {{ dk.soluongnhan }} Voucher
                  </span>
                </td>
                <td>
                  <span class="badge bg-secondary">{{
                    dk.maphieugiamgia
                  }}</span>
                </td>
                <td>
                  <div v-if="dk.phieugiamgia">
                    <small class="fw-bold d-block text-dark">
                      {{
                        dk.phieugiamgia.tenphieu ||
                        dk.phieugiamgia.mota ||
                        "Phiếu giảm giá"
                      }}
                    </small>
                    <small
                      class="text-muted"
                      v-if="dk.phieugiamgia.phantramgiam"
                    >
                      Giảm: {{ dk.phieugiamgia.phantramgiam }}%
                    </small>
                  </div>
                  <span v-else class="text-muted fst-italic"
                    >Không có thông tin</span
                  >
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm" role="group">
                    <button
                      class="btn btn-warning text-white"
                      title="Chỉnh sửa"
                      @click="goToEditForm(dk.id)"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      class="btn btn-danger"
                      title="Xóa"
                      @click="deleteDieuKien(dk)"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DieuKienNhanVoucherService from "@/services/dieukiennhanvoucher.service";
import VoucherProgressTracker from "@/components/VoucherProgressTracker.vue";

export default {
  name: "DieuKienNhanVoucherManager",
  components: {
    VoucherProgressTracker,
  },
  data() {
    return {
      dieuKiens: [],
      searchId: "",
      searchMaphieugiamgia: "",
      isLoading: false,
      message: "",
      errorMessage: "",
    };
  },
  watch: {
    searchId() {
      this.fetchDieuKiens();
    },
    searchMaphieugiamgia() {
      this.fetchDieuKiens();
    },
  },
  methods: {
    async fetchDieuKiens() {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        const params = {};
        if (this.searchId.trim()) params.id = this.searchId.trim();
        if (this.searchMaphieugiamgia.trim()) {
          params.maphieugiamgia = this.searchMaphieugiamgia.trim();
        }

        this.dieuKiens = await DieuKienNhanVoucherService.getAll(params);
      } catch (error) {
        console.error("Lỗi tải danh sách điều kiện nhận voucher:", error);
        this.errorMessage = "Không thể lấy danh sách điều kiện nhận voucher!";
      } finally {
        this.isLoading = false;
      }
    },

    async deleteDieuKien(dk) {
      const confirmMsg =
        `Bạn có chắc chắn muốn xóa điều kiện nhận voucher này?\n\n` +
        `• Mã điều kiện: ${dk.id}\n` +
        `• Mốc chi tối thiểu: ${this.formatCurrency(dk.mocchitoithieu)}\n` +
        `• Số lượng nhận: ${dk.soluongnhan}\n` +
        `• Mã phiếu giảm giá: ${dk.maphieugiamgia}`;

      if (confirm(confirmMsg)) {
        try {
          const res = await DieuKienNhanVoucherService.delete(dk.id);
          this.message =
            res.message || "Xóa điều kiện nhận voucher thành công!";
          this.fetchDieuKiens();
        } catch (error) {
          console.error("Lỗi khi xóa điều kiện nhận voucher:", error);
          this.errorMessage =
            error.response?.data?.message ||
            "Xóa điều kiện nhận voucher thất bại!";
        }
      }
    },

    async removeAllDieuKiens() {
      if (
        confirm(
          "⚠️ CẢNH BÁO: Bạn có chắc chắn muốn XÓA TẤT CẢ điều kiện nhận voucher? Hành động này không thể hoàn tác!",
        )
      ) {
        try {
          const res = await DieuKienNhanVoucherService.deleteAll();
          this.message = res.message;
          this.fetchDieuKiens();
        } catch (error) {
          console.error("Lỗi xóa tất cả điều kiện nhận voucher:", error);
          this.errorMessage =
            error.response?.data?.message ||
            "Không thể xóa tất cả điều kiện nhận voucher!";
        }
      }
    },

    formatCurrency(value) {
      if (!value && value !== 0) return "0 VNĐ";
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
    },

    goToAddForm() {
      this.$router.push({ name: "admin.dieukiennhanvoucher.add" });
    },

    goToEditForm(id) {
      this.$router.push({
        name: "admin.dieukiennhanvoucher.edit",
        params: { id },
      });
    },
  },
  mounted() {
    this.fetchDieuKiens();
  },
};
</script>

<style scoped>
.fs-7 {
  font-size: 0.85rem;
}
</style>
