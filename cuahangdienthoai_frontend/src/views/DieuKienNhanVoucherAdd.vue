<template>
  <div class="container py-4" style="max-width: 700px">
    <!-- Tiêu đề trang & Nút quay lại -->
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h3 class="fw-bold text-primary mb-0">
        <i class="bi bi-plus-circle me-2"></i>Thêm Mới Điều Kiện Nhận Voucher
      </h3>
      <button class="btn btn-outline-secondary btn-sm" @click="goBack">
        <i class="bi bi-arrow-left me-1"></i> Quay lại
      </button>
    </div>

    <!-- Thông báo lỗi nếu có -->
    <div
      v-if="errorMessage"
      class="alert alert-danger alert-dismissible fade show mb-4"
      role="alert"
    >
      <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
      <button
        type="button"
        class="btn-close"
        @click="errorMessage = ''"
      ></button>
    </div>

    <!-- Card Chứa Form -->
    <div class="card shadow-sm border-0">
      <div class="card-body p-4">
        <DieuKienNhanVoucherForm
          :dieuKien="dieuKien"
          :isEdit="false"
          :isLoading="isLoading"
          @submit:dieuKien="createDieuKien"
          @cancel="goBack"
        />
      </div>
    </div>
  </div>
</template>

<script>
import DieuKienNhanVoucherForm from "@/components/DieuKienNhanVoucherForm.vue";
import DieuKienNhanVoucherService from "@/services/dieukiennhanvoucher.service";

export default {
  name: "DieuKienNhanVoucherAdd",
  components: {
    DieuKienNhanVoucherForm,
  },
  data() {
    return {
      dieuKien: {
        mocchitoithieu: 0,
        soluongnhan: 1,
        maphieugiamgia: "",
      },
      isLoading: false,
      errorMessage: "",
    };
  },
  methods: {
    async createDieuKien(data) {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        await DieuKienNhanVoucherService.create(data);
        // Chuyển về trang danh sách sau khi tạo thành công
        this.$router.push({ name: "admin.dieukiennhanvoucher" });
      } catch (error) {
        console.error("Lỗi khi tạo điều kiện nhận voucher:", error);
        this.errorMessage =
          error.response?.data?.message ||
          "Đã xảy ra lỗi trong quá trình tạo điều kiện nhận voucher.";
      } finally {
        this.isLoading = false;
      }
    },
    goBack() {
      this.$router.push({ name: "admin.dieukiennhanvoucher" });
    },
  },
};
</script>
