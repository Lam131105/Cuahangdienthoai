<template>
  <div class="container mt-4">
    <h3 class="mb-4 text-primary">
      <i class="fas fa-tags"></i> Quản Lý Danh mục (Admin)
    </h3>

    <!-- Thanh Tìm kiếm và Nút Thêm/Xóa tất cả -->
    <div class="row mb-3 align-items-center">
      <div class="col-md-6 mb-2">
        <div class="input-group">
          <input
            type="text"
            class="form-control"
            placeholder="Nhập tên danh mục cần tìm..."
            v-model="searchText"
            @keyup.enter="retrieveTheLoais"
          />
          <button
            class="btn btn-outline-secondary"
            type="button"
            @click="retrieveTheLoais"
          >
            <i class="fas fa-search"></i> Tìm kiếm
          </button>
        </div>
      </div>

      <div class="col-md-6 mb-2 text-md-end">
        <router-link
          :to="{ name: 'admin.theloai.add' }"
          class="btn btn-success me-2"
        >
          <i class="fas fa-plus-circle"></i> Thêm mới
        </router-link>
        <button class="btn btn-danger" @click="deleteAllTheLoai">
          <i class="fas fa-trash-alt"></i> Xóa tất cả
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

    <!-- Bảng hiển thị Danh sách Danh mục -->
    <div class="card shadow-sm">
      <div
        class="card-footer bg-white text-muted text-end py-2 fs-7"
        v-if="!isLoading"
      >
        Tổng số: <strong>{{ theLoais.length }}</strong> Danh mục
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover table-striped mb-0 align-middle">
            <thead class="table-dark">
              <tr>
                <th style="width: 10%">Mã TL</th>
                <th style="width: 25%">Tên Danh mục</th>
                <th style="width: 35%">Mô tả</th>
                <th style="width: 15%; text-align: center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <!-- Hiển thị dữ liệu khi có danh mục -->
              <tr v-for="item in theLoais" :key="item.id">
                <td>
                  <strong>{{ item.id }}</strong>
                </td>
                <td>
                  <strong class="text-dark">{{ item.tentheloai }}</strong>
                </td>
                <td>{{ item.mota || "Không có mô tả" }}</td>
                <td class="text-center">
                  <router-link
                    :to="{
                      name: 'admin.theloai.edit',
                      params: { id: item.id },
                    }"
                    class="btn btn-sm btn-success"
                  >
                    <i class="fas fa-edit"></i>
                  </router-link>
                  <button
                    class="btn btn-sm btn-danger"
                    title="Xóa danh mục"
                    @click="deleteSingleTheLoai(item.id, item.tentheloai)"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>

              <!-- Dòng thông báo khi không có dữ liệu -->
              <tr v-if="theLoais.length === 0">
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
import TheLoaiService from "@/services/theloai.service";

export default {
  data() {
    return {
      theLoais: [],
      searchText: "",
      message: "",
      errorMessage: "",
    };
  },
  methods: {
    // Gọi API lấy danh sách danh mục từ Backend
    async retrieveTheLoais() {
      try {
        const params = {};
        if (this.searchText.trim()) {
          params.name = this.searchText.trim();
        }
        this.theLoais = await TheLoaiService.getAll(params);
        if (this.theLoais.length === 0) {
          this.message = "Không tìm thấy danh mục nào.";
        }
      } catch (error) {
        console.error(error);
        this.message = "Lỗi xảy ra khi kết nối tới Server Backend!";
      }
    },

    async deleteSingleTheLoai(id, name) {
      if (confirm(`Bạn có muốn xóa danh mục "${name}" không?`)) {
        try {
          const res = await TheLoaiService.delete(id);
          this.message = res.message;
          this.retrieveTheLoais(); // Tải lại danh sách
        } catch (error) {
          console.error(error);
          // Lấy thông báo lỗi trả về từ Backend (ApiError)
          this.errorMessage = error.response?.data?.message;
        }
      }
    },

    async deleteAllTheLoai() {
      if (confirm("Bạn có chắc chắn muốn xóa TẤT CẢ danh mục không?")) {
        try {
          await TheLoaiService.deleteAll();
          alert("Đã xóa tất cả danh mục thành công!");
          this.retrieveTheLoais();
        } catch (error) {
          console.error(error);
          this.errorMessage = error.response?.data?.message;
        }
      }
    },

    // Xử lý nút Tìm kiếm
    handleSearch() {
      this.retrieveTheLoais();
    },
  },
  mounted() {
    this.retrieveTheLoais();
  },
};
</script>
