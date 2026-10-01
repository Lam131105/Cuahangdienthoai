<template>
  <div class="container-fluid py-4">
    <!-- Tiêu đề trang -->
    <h3 class="fw-bold text-primary mb-4">
      <i class="bi bi-memory me-2"></i>Quản Lý Màu sắc (Admin)
    </h3>

    <!-- Thanh Tìm Kiếm & Nút Thao Tác -->
    <div class="row g-3 align-items-center mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            placeholder="Nhập Màu sắc cần tìm (VD: Đỏ, Xanh)..."
            v-model="searchText"
            @keyup.enter="fetchMauSacs"
          />
          <button
            class="btn btn-outline-secondary"
            type="button"
            @click="fetchMauSacs"
          >
            <i class="bi bi-search me-1"></i> Tìm kiếm
          </button>
        </div>
      </div>
      <div class="col-md-6 text-end">
        <button class="btn btn-success me-2 fw-semibold" @click="goToAddForm">
          <i class="bi bi-plus-circle me-1"></i> Thêm mới
        </button>
        <button
          class="btn btn-danger fw-semibold"
          @click="removeAllMauSacs"
          :disabled="mauSacs.length === 0"
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

    <!-- Bảng Danh Sách Màu sắc -->
    <div class="card shadow-sm border-0">
      <div
        class="card-footer bg-white text-muted text-end py-2 fs-7"
        v-if="!isLoading"
      >
        Tổng số: <strong>{{ mauSacs.length }}</strong> Màu sắc
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-dark">
              <tr>
                <th class="ps-3" style="width: 150px">Mã MÀU SẮC</th>
                <th>Màu sắc</th>
                <th class="text-center" style="width: 150px">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <!-- Trạng thái Loading -->
              <tr v-if="isLoading">
                <td colspan="3" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Đang tải...</span>
                  </div>
                  <p class="mt-2 text-muted mb-0">Đang lấy dữ liệu...</p>
                </td>
              </tr>

              <!-- Không tìm thấy dữ liệu -->
              <tr v-else-if="mauSacs.length === 0">
                <td colspan="3" class="text-center py-4 text-muted">
                  Không tìm thấy Màu sắc nào.
                </td>
              </tr>

              <!-- Hiển thị danh sách MÀU SẮC -->
              <tr v-else v-for="mauSac in mauSacs" :key="mauSac.id">
                <td class="ps-3 fw-bold">{{ mauSac.id }}</td>
                <td class="fw-bold text-dark fs-6">{{ mauSac.tenmau }}</td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm" role="group">
                    <button
                      class="btn btn-success"
                      title="Chỉnh sửa"
                      @click="goToEditForm(mauSac.id)"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      class="btn btn-danger"
                      title="Xóa"
                      @click="deleteMauSac(mauSac)"
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
import MauSacService from "@/services/mausac.service";

export default {
  name: "MauSacManager",
  data() {
    return {
      mauSacs: [],
      searchText: "",
      isLoading: false,
      message: "",
      errorMessage: "",
    };
  },
  methods: {
    // 1. Lấy danh sách MÀU SẮC từ API (có hỗ trợ lọc theo ?tenmau=)
    async fetchMauSacs() {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        const params = {};
        if (this.searchText.trim()) {
          params.tenmau = this.searchText.trim();
        }
        this.mauSacs = await MauSacService.getAll(params);
      } catch (error) {
        console.error("Lỗi lấy danh sách MÀU SẮC:", error);
        this.errorMessage = "Không thể tải danh sách Màu sắc!";
      } finally {
        this.isLoading = false;
      }
    },

    // 2. Xóa 1 MÀU SẮC
    async deleteMauSac(mauSac) {
      if (
        confirm(
          `Bạn có chắc chắn muốn xóa Màu sắc "${mauSac.tenmau}" (${mauSac.id}) không?`,
        )
      ) {
        try {
          const res = await MauSacService.delete(mauSac.id);
          this.message = res.message || "Xóa Màu sắc thành công!";
          this.fetchMauSacs();
        } catch (error) {
          console.error("Lỗi khi xóa MÀU SẮC:", error);
          this.errorMessage =
            error.response?.data?.message || "Xóa Màu sắc thất bại!";
        }
      }
    },

    // 3. Xóa tất cả MÀU SẮC
    async removeAllMauSacs() {
      if (
        confirm(
          "⚠️ CẢNH BÁO: Bạn có chắc chắn muốn XÓA SẠCH TẤT CẢ Màu sắc? Action này không thể hoàn tác!",
        )
      ) {
        try {
          const res = await MauSacService.deleteAll();
          this.message = res.message;
          this.fetchMauSacs();
        } catch (error) {
          console.error("Lỗi xóa tất cả MÀU SẮC:", error);
          this.errorMessage =
            error.response?.data?.message || "Không thể xóa tất cả Màu sắc!";
        }
      }
    },

    // 4. Điều hướng tới trang Thêm
    goToAddForm() {
      this.$router.push({ name: "admin.mausac.add" });
    },

    // 5. Điều hướng tới trang Sửa
    goToEditForm(id) {
      this.$router.push({ name: "admin.mausac.edit", params: { id } });
    },
  },
  mounted() {
    this.fetchMauSacs();
  },
};
</script>

<style scoped>
.card {
  border-radius: 6px;
  overflow: hidden;
}

.table thead th {
  font-weight: 600;
  padding-top: 12px;
  padding-bottom: 12px;
}

.table tbody tr:nth-of-type(even) {
  background-color: rgba(0, 0, 0, 0.02);
}

.btn-group .btn {
  padding: 0.25rem 0.5rem;
}

.fs-7 {
  font-size: 0.85rem;
}
</style>
