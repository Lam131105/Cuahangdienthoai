<template>
  <div class="container-fluid py-4">
    <!-- Tiêu đề trang -->
    <h3 class="fw-bold text-primary mb-4">
      <i class="bi bi-people-fill me-2"></i>Quản Lý Phiếu giảm giá
    </h3>

    <!-- Thanh Tìm Kiếm & Nút Thao Tác -->
    <div class="row g-3 align-items-center mb-4">
      <div class="col-md-8">
        <div class="row g-2">
          <!-- 1. Lọc theo tên phiếu -->
          <div class="col-md-4">
            <input
              type="text"
              class="form-control"
              placeholder="Tìm tên Phiếu giảm giá..."
              v-model="searchName"
              @keyup.enter="fetchPhieuGiamGias"
            />
          </div>

          <!-- 2. Lọc theo Loại Giảm Giá (Mới thêm) -->
          <div class="col-md-4">
            <select
              class="form-select"
              v-model="searchLoaiGiamGia"
              @change="fetchPhieuGiamGias"
            >
              <option value="">-- Tất cả loại giảm giá --</option>
              <option value="Phần trăm">Giảm theo phần trăm (%)</option>
              <option value="Tiền cố định">Giảm tiền cố định (VNĐ)</option>
            </select>
          </div>

          <!-- 3. Nút Tìm kiếm -->
          <div class="col-md-4">
            <button
              class="btn btn-outline-primary w-100"
              @click="fetchPhieuGiamGias"
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
          @click="removeAllPhieuGiamGias"
          :disabled="phieuGiamGias.length === 0"
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

    <!-- Bảng Danh Sách Phiếu giảm giá -->
    <div class="card shadow-sm border-0">
      <div
        class="card-footer bg-white text-muted text-end py-2 fs-7"
        v-if="!isLoading"
      >
        Tổng số: <strong>{{ phieuGiamGias.length }}</strong> Phiếu giảm giá
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-dark">
              <tr>
                <th class="ps-3" style="width: 100px">MÃ PGG</th>
                <th>Ảnh</th>
                <th>Tên phiếu</th>
                <th>Loại giảm giá</th>
                <th>Giá trị giảm</th>
                <th>Đơn giá tối thiểu</th>
                <th>Giảm tối đa</th>
                <th>Thời hạn</th>
                <th class="text-center" style="width: 120px">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <!-- Trạng thái Loading -->
              <tr v-if="isLoading">
                <td colspan="8" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Đang tải...</span>
                  </div>
                  <p class="mt-2 text-muted mb-0">
                    Đang lấy danh sách Phiếu giảm giá...
                  </p>
                </td>
              </tr>

              <!-- Trống -->
              <tr v-else-if="phieuGiamGias.length === 0">
                <td colspan="8" class="text-center py-4 text-muted">
                  Không tìm thấy Phiếu giảm giá nào.
                </td>
              </tr>

              <!-- Hiển thị Danh Sách -->
              <tr v-else v-for="pgg in phieuGiamGias" :key="pgg.id">
                <td class="ps-3 fw-bold">{{ pgg.id }}</td>
                <td>
                  <img
                    :src="getImageUrl(pgg.duongdananh)"
                    alt="image"
                    width="40"
                    height="40"
                  />
                </td>
                <td class="fw-semibold text-dark">{{ pgg.tenphieu }}</td>
                <td>{{ pgg.loaigiamgia }}</td>
                <td>{{ pgg.giatrigiam }}</td>
                <td>{{ pgg.dongiatoithieu }}</td>
                <td>{{ pgg.giamtoida }}</td>
                <td>{{ pgg.thoihan }}</td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm" role="group">
                    <button
                      class="btn btn-warning text-white"
                      title="Chỉnh sửa"
                      @click="goToEditForm(pgg.id)"
                    >
                      <i class="fas fa-edit"></i>
                    </button>

                    <button
                      class="btn btn-danger"
                      title="Xóa"
                      @click="deletePhieuGiamGia(pgg)"
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
import PhieuGiamGiaService from "@/services/phieugiamgia.service";

export default {
  name: "PhieuGiamGiaManager",
  data() {
    return {
      phieuGiamGias: [],
      searchName: "",
      searchLoaiGiamGia: "",
      //  searchEmail: "",
      isLoading: false,
      message: "",
      errorMessage: "",
      defaultImage: "http://localhost:5000phieugiamgia.png",
    };
  },
  methods: {
    getImageUrl(fileName) {
      if (!fileName) return this.defaultImage;
      // Nếu đường dẫn lưu trong DB đã là link đầy đủ (http...) thì giữ nguyên
      if (fileName.startsWith("http")) return fileName;
      // Nối với URL server uploads của bạn
      return `http://localhost:5000${fileName}`;
    },
    async fetchPhieuGiamGias() {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        const params = {};
        if (this.searchName.trim()) params.tenphieu = this.searchName.trim();
        if (this.searchLoaiGiamGia) {
          params.loaigiamgia = this.searchLoaiGiamGia;
        }

        this.phieuGiamGias = await PhieuGiamGiaService.getAll(params);
      } catch (error) {
        console.error("Lỗi tải danh sách Phiếu giảm giá:", error);
        this.errorMessage = "Không thể lấy danh sách Phiếu giảm giá!";
      } finally {
        this.isLoading = false;
      }
    },

    async deletePhieuGiamGia(pgg) {
      if (
        confirm(
          `Bạn có chắc muốn xóa Phiếu giảm giá "${pgg.tenphieu}" (${pgg.id}) không?`,
        )
      ) {
        try {
          const res = await PhieuGiamGiaService.delete(pgg.id);
          this.message = res.message || "Xóa Phiếu giảm giá thành công!";
          this.fetchPhieuGiamGias();
        } catch (error) {
          console.error("Lỗi khi xóa Phiếu giảm giá:", error);
          this.errorMessage =
            error.response?.data?.message || "Xóa Phiếu giảm giá thất bại!";
        }
      }
    },

    async removeAllPhieuGiamGias() {
      if (
        confirm(
          "⚠️ CẢNH BÁO: Bạn có chắc chắn muốn XÓA TẤT CẢ Phiếu giảm giá? Hành động này không thể hoàn tác!",
        )
      ) {
        try {
          const res = await PhieuGiamGiaService.deleteAll();
          this.message = res.message;
          this.fetchPhieuGiamGias();
        } catch (error) {
          console.error("Lỗi xóa tất cả Phiếu giảm giá:", error);
          this.errorMessage =
            error.response?.data?.message ||
            "Không thể xóa tất cả Phiếu giảm giá!";
        }
      }
    },

    goToAddForm() {
      this.$router.push({ name: "admin.phieugiamgia.add" });
    },

    goToEditForm(id) {
      this.$router.push({ name: "admin.phieugiamgia.edit", params: { id } });
    },
  },
  mounted() {
    this.fetchPhieuGiamGias();
  },
};
</script>

<style scoped>
.fs-7 {
  font-size: 0.85rem;
}
</style>
