<template>
  <div class="container mt-4">
    <h3 class="mb-4 text-primary">
      <i class="fas fa-tags"></i> Quản Lý Thương Hiệu (Admin)
    </h3>

    <!-- Thanh Tìm kiếm và Nút Thêm/Xóa tất cả -->
    <div class="row mb-3 align-items-center">
      <div class="col-md-6 mb-2">
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            placeholder="Nhập tên thương hiệu cần tìm..."
            v-model="searchText"
            @keyup.enter="retrieveThuongHieus"
          />
          <button
            class="btn btn-outline-secondary"
            type="button"
            @click="retrieveThuongHieus"
          >
            <i class="fas fa-search"></i> Tìm kiếm
          </button>
        </div>
      </div>

      <div class="col-md-6 mb-2 text-md-end">
        <router-link
          :to="{ name: 'admin.thuonghieu.add' }"
          class="btn btn-success me-2"
        >
          <i class="fas fa-plus-circle"></i> Thêm mới
        </router-link>
        <button class="btn btn-danger" @click="deleteAllThuongHieu">
          <i class="fas fa-trash-alt"></i> Xóa tất cả
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

    <!-- Bảng hiển thị Danh sách Thương hiệu -->
    <div class="card shadow-sm">
      <div
        class="card-footer bg-white text-muted text-end py-2 fs-7"
        v-if="!isLoading"
      >
        Tổng số: <strong>{{ thuongHieus.length }}</strong> Thương hiệu
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover table-striped mb-0 align-middle">
            <thead class="table-dark">
              <tr>
                <th style="width: 10%">Mã TH</th>
                <th style="width: 15%">Logo</th>
                <th style="width: 25%">Tên Thương Hiệu</th>
                <th style="width: 35%">Mô tả</th>
                <th style="width: 15%; text-align: center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <!-- Hiển thị dữ liệu khi có thương hiệu -->
              <tr v-for="item in thuongHieus" :key="item.id">
                <td>
                  <strong>{{ item.id }}</strong>
                </td>
                <td>
                  <img
                    :src="getLogoUrl(item.logothuonghieu)"
                    :alt="item.tenthuonghieu"
                    class="img-thumbnail"
                    style="
                      max-width: 70px;
                      max-height: 50px;
                      object-fit: contain;
                    "
                  />
                </td>
                <td>
                  <strong class="text-dark">{{ item.tenthuonghieu }}</strong>
                </td>
                <td>{{ item.mota || "Không có mô tả" }}</td>
                <td class="text-center">
                  <router-link
                    :to="{
                      name: 'admin.thuonghieu.edit',
                      params: { id: item.id },
                    }"
                    class="btn btn-sm btn-success"
                  >
                    <i class="fas fa-edit"></i>
                  </router-link>
                  <button
                    class="btn btn-sm btn-danger"
                    title="Xóa thương hiệu"
                    @click="deleteSingleThuongHieu(item.id, item.tenthuonghieu)"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>

              <!-- Dòng thông báo khi không có dữ liệu -->
              <tr v-if="thuongHieus.length === 0">
                <td colspan="5" class="text-center text-muted py-4">
                  {{ message }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table td,
.table th {
  vertical-align: middle;
}
</style>

<script>
import ThuongHieuService from "@/services/thuonghieu.service";

export default {
  data() {
    return {
      thuongHieus: [],
      searchText: "",
      message: "",
      errorMessage: "",
    };
  },
  methods: {
    // Gọi API lấy danh sách thương hiệu từ Backend
    async retrieveThuongHieus() {
      try {
        const params = {};
        if (this.searchText.trim()) {
          params.name = this.searchText.trim();
        }
        this.thuongHieus = await ThuongHieuService.getAll(params);
        if (this.thuongHieus.length === 0) {
          this.message = "Không tìm thấy thương hiệu nào.";
        }
      } catch (error) {
        console.error(error);
        this.message = "Lỗi xảy ra khi kết nối tới Server Backend!";
      }
    },

    async deleteSingleThuongHieu(id, name) {
      if (confirm(`Bạn có muốn xóa thương hiệu "${name}" không?`)) {
        try {
          const res = await ThuongHieuService.delete(id);
          this.message = res.message;
          this.retrieveThuongHieus(); // Tải lại danh sách
        } catch (error) {
          console.error(error);
          // Lấy thông báo lỗi trả về từ Backend (ApiError)
          this.errorMessage = error.response?.data?.message;
        }
      }
    },

    async deleteAllThuongHieu() {
      if (confirm("Bạn có chắc chắn muốn xóa TẤT CẢ thương hiệu không?")) {
        try {
          await ThuongHieuService.deleteAll();
          alert("Đã xóa tất cả thương hiệu thành công!");
          this.retrieveThuongHieus();
        } catch (error) {
          console.error(error);
          this.errorMessage = error.response?.data?.message;
        }
      }
    },

    // Xử lý nút Tìm kiếm
    handleSearch() {
      this.retrieveThuongHieus();
    },

    // Hàm xử lý đường dẫn Logo
    getLogoUrl(filename) {
      if (!filename) return "https://via.placeholder.com/80?text=No+Logo";
      // Lấy hình ảnh động từ thư mục src/assets/Thuonghieu/
      try {
        return `http://localhost:5000${filename}`;
      } catch (e) {
        return "https://via.placeholder.com/80?text=Error";
      }
    },
  },
  mounted() {
    this.retrieveThuongHieus();
  },
};
</script>
