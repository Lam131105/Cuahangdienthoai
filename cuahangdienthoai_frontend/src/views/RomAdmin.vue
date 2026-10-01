<template>
  <div class="container-fluid py-4">
    <!-- Tiêu đề trang -->
    <h3 class="fw-bold text-primary mb-4">
      <i class="bi bi-memory me-2"></i>Quản Lý Dung Lượng ROM (Admin)
    </h3>

    <!-- Thanh Tìm Kiếm & Nút Thao Tác -->
    <div class="row g-3 align-items-center mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            placeholder="Nhập dung lượng ROM cần tìm (VD: 8GB, 16GB)..."
            v-model="searchText"
            @keyup.enter="fetchRoms"
          />
          <button
            class="btn btn-outline-secondary"
            type="button"
            @click="fetchRoms"
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
          @click="removeAllRoms"
          :disabled="roms.length === 0"
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

    <!-- Bảng Danh Sách Dung Lượng ROM -->
    <div class="card shadow-sm border-0">
      <div
        class="card-footer bg-white text-muted text-end py-2 fs-7"
        v-if="!isLoading"
      >
        Tổng số: <strong>{{ roms.length }}</strong> dung lượng ROM
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-dark">
              <tr>
                <th class="ps-3" style="width: 150px">Mã ROM</th>
                <th>Dung Lượng ROM</th>
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
              <tr v-else-if="roms.length === 0">
                <td colspan="3" class="text-center py-4 text-muted">
                  Không tìm thấy dung lượng ROM nào.
                </td>
              </tr>

              <!-- Hiển thị danh sách ROM -->
              <tr v-else v-for="rom in roms" :key="rom.id">
                <td class="ps-3 fw-bold">{{ rom.id }}</td>
                <td class="fw-bold text-dark fs-6">{{ rom.dungluongrom }}</td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm" role="group">
                    <button
                      class="btn btn-success"
                      title="Chỉnh sửa"
                      @click="goToEditForm(rom.id)"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      class="btn btn-danger"
                      title="Xóa"
                      @click="deleteRom(rom)"
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
import RomService from "@/services/rom.service";

export default {
  name: "RomManager",
  data() {
    return {
      roms: [],
      searchText: "",
      isLoading: false,
      message: "",
      errorMessage: "",
    };
  },
  methods: {
    // 1. Lấy danh sách ROM từ API (có hỗ trợ lọc theo ?dungluongrom=)
    async fetchRoms() {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        const params = {};
        if (this.searchText.trim()) {
          params.dungluongrom = this.searchText.trim();
        }
        this.roms = await RomService.getAll(params);
      } catch (error) {
        console.error("Lỗi lấy danh sách ROM:", error);
        this.errorMessage = "Không thể tải danh sách dung lượng ROM!";
      } finally {
        this.isLoading = false;
      }
    },

    // 2. Xóa 1 ROM
    async deleteRom(rom) {
      if (
        confirm(
          `Bạn có chắc chắn muốn xóa dung lượng ROM "${rom.dungluongrom}" (${rom.id}) không?`,
        )
      ) {
        try {
          const res = await RomService.delete(rom.id);
          this.message = res.message || "Xóa dung lượng ROM thành công!";
          this.fetchRoms();
        } catch (error) {
          console.error("Lỗi khi xóa ROM:", error);
          this.errorMessage =
            error.response?.data?.message || "Xóa dung lượng ROM thất bại!";
        }
      }
    },

    // 3. Xóa tất cả ROM
    async removeAllRoms() {
      if (
        confirm(
          "⚠️ CẢNH BÁO: Bạn có chắc chắn muốn XÓA SẠCH TẤT CẢ dung lượng ROM? Action này không thể hoàn tác!",
        )
      ) {
        try {
          const res = await RomService.deleteAll();
          this.message = res.message;
          this.fetchRoms();
        } catch (error) {
          console.error("Lỗi xóa tất cả ROM:", error);
          this.errorMessage =
            error.response?.data?.message ||
            "Không thể xóa tất cả dung lượng ROM!";
        }
      }
    },

    // 4. Điều hướng tới trang Thêm
    goToAddForm() {
      this.$router.push({ name: "admin.rom.add" });
    },

    // 5. Điều hướng tới trang Sửa
    goToEditForm(id) {
      this.$router.push({ name: "admin.rom.edit", params: { id } });
    },
  },
  mounted() {
    this.fetchRoms();
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
