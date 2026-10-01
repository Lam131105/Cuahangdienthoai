<template>
  <div class="container-fluid py-4">
    <!-- Tiêu đề trang -->
    <h3 class="fw-bold text-primary mb-4">
      <i class="bi bi-memory me-2"></i>Quản Lý Dung Lượng RAM (Admin)
    </h3>

    <!-- Thanh Tìm Kiếm & Nút Thao Tác -->
    <div class="row g-3 align-items-center mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            placeholder="Nhập dung lượng RAM cần tìm (VD: 8GB, 16GB)..."
            v-model="searchText"
            @keyup.enter="fetchRams"
          />
          <button
            class="btn btn-outline-secondary"
            type="button"
            @click="fetchRams"
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
          @click="removeAllRams"
          :disabled="rams.length === 0"
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

    <!-- Bảng Danh Sách Dung Lượng RAM -->
    <div class="card shadow-sm border-0">
      <div
        class="card-footer bg-white text-muted text-end py-2 fs-7"
        v-if="!isLoading"
      >
        Tổng số: <strong>{{ rams.length }}</strong> dung lượng RAM
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-dark">
              <tr>
                <th class="ps-3" style="width: 150px">Mã RAM</th>
                <th>Dung Lượng RAM</th>
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
              <tr v-else-if="rams.length === 0">
                <td colspan="3" class="text-center py-4 text-muted">
                  Không tìm thấy dung lượng RAM nào.
                </td>
              </tr>

              <!-- Hiển thị danh sách RAM -->
              <tr v-else v-for="ram in rams" :key="ram.id">
                <td class="ps-3 fw-bold">{{ ram.id }}</td>
                <td class="fw-bold text-dark fs-6">{{ ram.dungluongram }}</td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm" role="group">
                    <button
                      class="btn btn-success"
                      title="Chỉnh sửa"
                      @click="goToEditForm(ram.id)"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      class="btn btn-danger"
                      title="Xóa"
                      @click="deleteRam(ram)"
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
      <!-- Footer Bảng hiển thị số lượng -->
    </div>
  </div>
</template>

<script>
import RamService from "@/services/ram.service";

export default {
  name: "RamManager",
  data() {
    return {
      rams: [],
      searchText: "",
      isLoading: false,
      message: "",
      errorMessage: "",
    };
  },
  methods: {
    // 1. Lấy danh sách RAM từ API (có hỗ trợ lọc theo ?dungluongram=)
    async fetchRams() {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        const params = {};
        if (this.searchText.trim()) {
          params.dungluongram = this.searchText.trim();
        }
        this.rams = await RamService.getAll(params);
      } catch (error) {
        console.error("Lỗi lấy danh sách RAM:", error);
        this.errorMessage = "Không thể tải danh sách dung lượng RAM!";
      } finally {
        this.isLoading = false;
      }
    },

    // 2. Xóa 1 RAM
    async deleteRam(ram) {
      if (
        confirm(
          `Bạn có chắc chắn muốn xóa dung lượng RAM "${ram.dungluongram}" (${ram.id}) không?`,
        )
      ) {
        try {
          const res = await RamService.delete(ram.id);
          this.message = res.message || "Xóa dung lượng RAM thành công!";
          this.fetchRams();
        } catch (error) {
          console.error("Lỗi khi xóa RAM:", error);
          this.errorMessage =
            error.response?.data?.message || "Xóa dung lượng RAM thất bại!";
        }
      }
    },

    // 3. Xóa tất cả RAM
    async removeAllRams() {
      if (
        confirm(
          "⚠️ CẢNH BÁO: Bạn có chắc chắn muốn XÓA SẠCH TẤT CẢ dung lượng RAM? Action này không thể hoàn tác!",
        )
      ) {
        try {
          const res = await RamService.deleteAll();
          this.message = res.message;
          this.fetchRams();
        } catch (error) {
          console.error("Lỗi xóa tất cả RAM:", error);
          this.errorMessage =
            error.response?.data?.message ||
            "Không thể xóa tất cả dung lượng RAM!";
        }
      }
    },

    // 4. Điều hướng tới trang Thêm
    goToAddForm() {
      this.$router.push({ name: "admin.ram.add" });
    },

    // 5. Điều hướng tới trang Sửa
    goToEditForm(id) {
      this.$router.push({ name: "admin.ram.edit", params: { id } });
    },
  },
  mounted() {
    this.fetchRams();
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
