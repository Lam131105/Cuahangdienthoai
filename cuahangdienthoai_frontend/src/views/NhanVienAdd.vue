<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-primary text-white fw-bold fs-5">
            <i class="bi bi-person-plus-fill me-2"></i>Thêm Mới Nhân Viên
          </div>

          <div class="card-body p-4">
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
              :isEdit="false"
              :isLoading="isLoading"
              @submit:nhanVien="createNhanVien"
              @cancel="goBack"
            />
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
  name: "NhanVienAdd",
  components: {
    NhanVienForm,
  },
  data() {
    return {
      nhanVien: {
        hoten: "",
        email: "",
        matkhau: "",
        sodienthoai: "",
        ngaysinh: "",
        vaitroid: "VT0001",
        trangthai: "Hoạt động",
      },
      isLoading: false,
      errorMessage: "",
    };
  },
  methods: {
    async createNhanVien({ data }) {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        await NhanVienService.register(data);
        this.$router.push({ name: "admin.nhanvien" });
      } catch (error) {
        console.error("Lỗi thêm Nhân viên:", error);
        this.errorMessage =
          error.response?.data?.message ||
          "Đã xảy ra lỗi khi thêm Nhân viên mới!";
      } finally {
        this.isLoading = false;
      }
    },
    goBack() {
      this.$router.push({ name: "admin.nhanvien" });
    },
  },
};
</script>
