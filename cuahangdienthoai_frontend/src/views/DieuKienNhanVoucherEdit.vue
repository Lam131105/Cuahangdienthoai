<template>
  <div class="container py-4" style="max-width: 700px">
    <!-- Tiêu đề trang & Nút quay lại -->
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h3 class="fw-bold text-primary mb-0">
        <i class="bi bi-pencil-square me-2"></i>Chỉnh Sửa Điều Kiện [{{ id }}]
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

    <!-- State Loading dữ liệu ban đầu -->
    <div v-if="isFetching" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
      <p class="mt-2 text-muted">
        Đang tải thông tin điều kiện nhận voucher...
      </p>
    </div>

    <!-- Card Chứa Form -->
    <div v-else class="card shadow-sm border-0">
      <div class="card-body p-4">
        <DieuKienNhanVoucherForm
          v-if="dieuKien"
          :dieuKien="dieuKien"
          :isEdit="true"
          :isLoading="isLoading"
          @submit:dieuKien="updateDieuKien"
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
  name: "DieuKienNhanVoucherEdit",
  components: {
    DieuKienNhanVoucherForm,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      dieuKien: null,
      isFetching: false,
      isLoading: false,
      errorMessage: "",
    };
  },
  methods: {
    async getDieuKien(id) {
      this.isFetching = true;
      this.errorMessage = "";
      try {
        this.dieuKien = await DieuKienNhanVoucherService.get(id);
      } catch (error) {
        console.error("Lỗi khi tải thông tin điều kiện:", error);
        this.errorMessage =
          error.response?.data?.message ||
          "Không tìm thấy thông tin điều kiện nhận voucher cần chỉnh sửa.";
      } finally {
        this.isFetching = false;
      }
    },

    async updateDieuKien(data) {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        await DieuKienNhanVoucherService.update(this.id, data);
        // Chuyển về trang danh sách sau khi cập nhật thành công
        this.$router.push({ name: "admin.dieukiennhanvoucher" });
      } catch (error) {
        console.error("Lỗi khi cập nhật điều kiện nhận voucher:", error);
        this.errorMessage =
          error.response?.data?.message ||
          "Đã xảy ra lỗi trong quá trình cập nhật điều kiện nhận voucher.";
      } finally {
        this.isLoading = false;
      }
    },

    goBack() {
      this.$router.push({ name: "admin.dieukiennhanvoucher" });
    },
  },
  created() {
    this.getDieuKien(this.id);
  },
};
</script>
