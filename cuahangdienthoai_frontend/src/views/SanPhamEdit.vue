<template>
  <div class="container py-4">
    <div class="card shadow-sm border-0 max-width-800 mx-auto">
      <div class="card-header bg-white py-3">
        <h5 class="mb-0 fw-bold text-primary">
          <i class="fas fa-edit me-2"></i>Chỉnh Sửa Sản Phẩm ({{ sanPhamId }})
        </h5>
      </div>

      <div class="card-body p-4">
        <div v-if="loadingDetail" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2 text-muted">Đang tải thông tin sản phẩm...</p>
        </div>

        <div v-else-if="errorMessage" class="alert alert-danger" role="alert">
          <i class="fas fa-exclamation-circle me-2"></i>{{ errorMessage }}
        </div>

        <SanPhamForm
          v-else
          :san-pham-data="sanPhamData"
          :loading="isSubmitting"
          @submit-form="handleUpdateSanPham"
        />
      </div>
    </div>
  </div>
</template>

<script>
import SanPhamForm from "@/components/SanPhamForm.vue";
import SanPhamService from "@/services/sanpham.service";

export default {
  name: "SanPhamEdit",
  components: { SanPhamForm },
  props: {
    id: { type: String, required: true },
  },
  data() {
    return {
      sanPhamId: this.id,
      sanPhamData: null,
      loadingDetail: true,
      isSubmitting: false,
      errorMessage: "",
    };
  },
  async created() {
    await this.fetchSanPhamDetail();
  },
  methods: {
    async fetchSanPhamDetail() {
      this.loadingDetail = true;
      try {
        this.sanPhamData = await SanPhamService.get(this.sanPhamId);
      } catch (error) {
        console.error("Lỗi lấy chi tiết sản phẩm:", error);
        this.errorMessage =
          error.response?.data?.message ||
          "Không thể tải dữ liệu sản phẩm này!";
      } finally {
        this.loadingDetail = false;
      }
    },

    async handleUpdateSanPham(formData) {
      this.isSubmitting = true;
      this.errorMessage = "";
      try {
        await SanPhamService.update(this.sanPhamId, formData);
        this.$router.push({
          path: "/admin/sanpham",
          query: { message: "Cập nhật sản phẩm thành công!" },
        });
      } catch (error) {
        console.error("Lỗi cập nhật sản phẩm:", error);
        this.errorMessage =
          error.response?.data?.message ||
          "Không thể cập nhật thông tin sản phẩm!";
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>
