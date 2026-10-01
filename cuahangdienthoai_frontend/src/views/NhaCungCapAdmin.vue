<template>
  <div class="container-fluid py-4">
    <!-- Tiêu đề trang -->
    <h3 class="fw-bold text-primary mb-4">
      <i class="bi bi-tag-fill me-2"></i>Quản Lý Nhà Cung Cấp (Admin)
    </h3>

    <!-- Thanh Tìm Kiếm & Nút Thao Tác -->
    <div class="row g-3 align-items-center mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            placeholder="Nhập tên nhà cung cấp cần tìm..."
            v-model="searchText"
            @keyup.enter="fetchNhaCungCaps"
          />
          <button
            class="btn btn-outline-secondary"
            type="button"
            @click="fetchNhaCungCaps"
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
          @click="removeAllNhaCungCaps"
          :disabled="nhaCungCaps.length === 0"
        >
          <i class="bi bi-trash me-1"></i> Xóa tất cả
        </button>
      </div>
    </div>

    <!-- Thông báo Alert (Hiển thị nếu có) -->
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

    <!-- Bảng Danh Sách Nhà Cung Cấp -->
    <div class="card shadow-sm border-0">
      <div
        class="card-footer bg-white text-muted text-end py-2 fs-7"
        v-if="!isLoading"
      >
        Tổng số: <strong>{{ nhaCungCaps.length }}</strong> Nhà cung cấp
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-dark">
              <tr>
                <th class="ps-3" style="width: 120px">Mã NCC</th>
                <th style="width: 250px">Tên Nhà Cung Cấp</th>
                <th style="width: 180px">Số Điện Thoại</th>
                <th>Địa Chỉ</th>
                <th class="text-center" style="width: 120px">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading -->
              <tr v-if="isLoading">
                <td colspan="5" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Đang tải...</span>
                  </div>
                </td>
              </tr>

              <!-- Trống dữ liệu -->
              <tr v-else-if="nhaCungCaps.length === 0">
                <td colspan="5" class="text-center py-4 text-muted">
                  Không tìm thấy nhà cung cấp nào.
                </td>
              </tr>

              <!-- Dữ liệu -->
              <tr v-else v-for="ncc in nhaCungCaps" :key="ncc.id">
                <td class="ps-3 fw-bold">{{ ncc.id }}</td>
                <td class="fw-bold">{{ ncc.tenncc }}</td>
                <td>{{ ncc.sodienthoai || "---" }}</td>
                <td class="text-secondary">{{ ncc.diachi || "---" }}</td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm" role="group">
                    <button
                      class="btn btn-success"
                      title="Chỉnh sửa"
                      @click="goToEditForm(ncc.id)"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      class="btn btn-danger"
                      title="Xóa"
                      @click="deleteNhaCungCap(ncc)"
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
import NhaCungCapService from "@/services/nhacungcap.service";

export default {
  name: "NhaCungCapManager",
  data() {
    return {
      nhaCungCaps: [],
      searchText: "",
      isLoading: false,
      message: "",
      errorMessage: "",
    };
  },
  methods: {
    // 1. Lấy danh sách từ Backend (Có kết hợp lọc query name)
    async fetchNhaCungCaps() {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        const params = {};
        if (this.searchText.trim()) {
          // Backend chấp nhận req.query.name để lọc theo tên
          params.name = this.searchText.trim();
        }
        this.nhaCungCaps = await NhaCungCapService.getAll(params);
      } catch (error) {
        console.error("Lỗi lấy danh sách nhà cung cấp:", error);
        this.errorMessage = "Không thể tải danh sách nhà cung cấp!";
      } finally {
        this.isLoading = false;
      }
    },

    // 2. Làm mới ô tìm kiếm
    resetSearch() {
      this.searchText = "";
      this.fetchNhaCungCaps();
    },

    // 3. Xóa 1 nhà cung cấp theo Mã
    async deleteNhaCungCap(ncc) {
      if (
        confirm(
          `Bạn có chắc chắn muốn xóa nhà cung cấp "${ncc.tenncc}" (${ncc.id}) không?`,
        )
      ) {
        try {
          const res = await NhaCungCapService.delete(ncc.id);
          this.message = res.message;
          this.fetchNhaCungCaps(); // Nạp lại danh sách
        } catch (error) {
          console.error("Lỗi khi xóa nhà cung cấp:", error);
          this.errorMessage = error.response?.data?.message;
        }
      }
    },

    // 4. Xóa tất cả nhà cung cấp
    async removeAllNhaCungCaps() {
      if (
        confirm(
          "⚠️ CẢNH BÁO: Bạn có chắc chắn muốn XÓA SẠCH TẤT CẢ nhà cung cấp khỏi hệ thống? Action này không thể hoàn tác!",
        )
      ) {
        try {
          const res = await NhaCungCapService.deleteAll();
          this.message = res.message;
          this.fetchNhaCungCaps();
        } catch (error) {
          console.error("Lỗi khi xóa tất cả:", error);
          this.errorMessage = error.response?.data?.message;
        }
      }
    },

    // 5. Điều hướng tới Trang Thêm Mới (Sẽ làm ở bước sau)
    goToAddForm() {
      this.$router.push({ name: "admin.nhacungcap.add" });
    },

    // 6. Điều hướng tới Trang Chỉnh Sửa theo ID (Sẽ làm ở bước sau)
    goToEditForm(id) {
      this.$router.push({ name: "admin.nhacungcap.edit", params: { id } });
    },
  },
  mounted() {
    this.fetchNhaCungCaps();
  },
};
</script>

<style scoped>
/* Bo tròn góc bảng và các nút bấm theo đúng phong cách UI của bạn */
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
</style>
