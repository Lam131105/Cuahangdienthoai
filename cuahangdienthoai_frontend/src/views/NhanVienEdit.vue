<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-warning text-dark fw-bold fs-5">
            <i class="bi bi-pencil-square me-2"></i>Cập Nhật Thông Tin Nhân
            Viên: {{ id }}
          </div>

          <div class="card-body p-4">
            <!-- Spinner Tải thông tin -->
            <div v-if="isFetching" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải...</span>
              </div>
              <p class="mt-2 text-muted">Đang lấy dữ liệu Nhân viên...</p>
            </div>

            <template v-else>
              <!-- Thông báo Lỗi -->
              <div
                v-if="errorMessage"
                class="alert alert-danger alert-dismissible fade show"
                role="alert"
              >
                <i class="bi bi-exclamation-triangle-fill me-2"></i
                >{{ errorMessage }}
                <button
                  type="button"
                  class="btn-close"
                  @click="errorMessage = ''"
                ></button>
              </div>

              <!-- Form -->
              <NhanVienForm
                :nhanVien="nhanVien"
                :isEdit="true"
                :isLoading="isLoading"
                @submit:nhanVien="updateNhanVien"
                @cancel="goBack"
              />
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NhanVienForm from "@/components/NhanVienForm.vue";
import NhanVienService from "@/services/nhanvien.service";

export default {
  name: "NhanVienEdit",
  components: {
    NhanVienForm,
  },
  props: {
    id: { type: String, required: true },
  },
  data() {
    return {
      nhanVien: null,
      isFetching: true,
      isLoading: false,
      errorMessage: "",
    };
  },
  methods: {
    async getNhanVien(id) {
      this.isFetching = true;
      try {
        this.nhanVien = await NhanVienService.get(id);
      } catch (error) {
        console.error("Lỗi lấy chi tiết Nhân viên:", error);
        this.$router.push({ name: "admin.nhanvien" });
      } finally {
        this.isFetching = false;
      }
    },

    async updateNhanVien({ data }) {
      this.isLoading = true;
      this.errorMessage = "";

      try {
        // Khởi tạo FormData để gửi cả thông tin chuỗi + file ảnh
        const formData = new FormData();
        if (data.hoten) formData.append("hoten", data.hoten);
        if (data.email) formData.append("email", data.email);
        if (data.sodienthoai) formData.append("sodienthoai", data.sodienthoai);
        if (data.ngaysinh) formData.append("ngaysinh", data.ngaysinh);
        if (data.vaitroid) formData.append("vaitroid", data.vaitroid);
        if (data.trangthai) formData.append("trangthai", data.trangthai);

        await NhanVienService.update(this.id, formData);
        this.$router.push({ name: "admin.nhanvien" });
      } catch (error) {
        console.error("Lỗi cập nhật Nhân viên:", error);
        this.errorMessage =
          error.response?.data?.message || "Đã xảy ra lỗi khi cập nhật!";
      } finally {
        this.isLoading = false;
      }
    },

    goBack() {
      this.$router.push({ name: "admin.nhanvien" });
    },
  },
  created() {
    this.getNhanVien(this.id);
  },
};
</script>
