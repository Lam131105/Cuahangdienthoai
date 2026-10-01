<template>
  <div class="container py-4">
    <div class="card shadow-sm border-0 max-width-800 mx-auto">
      <div class="card-header bg-white py-3">
        <h5 class="mb-0 fw-bold text-primary">
          <i class="fas fa-plus-circle me-2"></i>Thêm Sản Phẩm Mới
        </h5>
      </div>

      <div class="card-body p-4">
        <div
          v-if="errorMessage"
          class="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          <i class="fas fa-exclamation-circle me-2"></i>{{ errorMessage }}
          <button
            type="button"
            class="btn-close"
            @click="errorMessage = ''"
          ></button>
        </div>

        <SanPhamForm :loading="isLoading" @submit-form="handleCreateSanPham" />
      </div>
    </div>
  </div>
</template>

<script>
import SanPhamForm from "@/components/SanPhamForm.vue";
import SanPhamService from "@/services/sanpham.service";

export default {
  name: "SanPhamAdd",
  components: { SanPhamForm },
  data() {
    return {
      isLoading: false,
      errorMessage: "",
    };
  },
  methods: {
    async handleCreateSanPham(formData) {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        await SanPhamService.create(formData);
        this.$router.push({
          path: "/admin/sanpham",
          query: { message: "Tạo sản phẩm thành công!" },
        });
      } catch (error) {
        console.error("Lỗi tạo sản phẩm:", error);
        this.errorMessage =
          error.response?.data?.message ||
          "Không thể tạo sản phẩm, vui lòng thử lại!";
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
