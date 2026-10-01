<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-warning text-dark fw-bold fs-5">
            <i class="bi bi-pencil-square me-2"></i>Cập Nhật Thông Tin Phiếu
            giảm giá: {{ id }}
          </div>

          <div class="card-body p-4">
            <!-- Spinner Tải thông tin -->
            <div v-if="isFetching" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải...</span>
              </div>
              <p class="mt-2 text-muted">Đang lấy dữ liệu Phiếu giảm giá...</p>
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
              <PhieuGiamGiaForm
                :phieuGiamGia="phieuGiamGia"
                :isEdit="true"
                :isLoading="isLoading"
                @submit:phieugiamgia="updatePhieuGiamGia"
                @delete:phieugiamgia="deletePhieuGiamGia"
              />
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PhieuGiamGiaForm from "@/components/PhieuGiamGiaForm.vue";
import PhieuGiamGiaService from "@/services/phieugiamgia.service";

export default {
  name: "PhieuGiamGiaEdit",
  components: {
    PhieuGiamGiaForm,
  },
  props: {
    id: { type: String, required: true },
  },
  data() {
    return {
      phieuGiamGia: null,
      isFetching: true,
      isLoading: false,
      errorMessage: "",
    };
  },
  methods: {
    async getPhieuGiamGia(id) {
      this.isFetching = true;
      try {
        this.phieuGiamGia = await PhieuGiamGiaService.get(id);
      } catch (error) {
        console.error("Lỗi lấy chi tiết Phiếu giảm giá:", error);
        this.$router.push({ name: "admin.phieugiamgia" });
      } finally {
        this.isFetching = false;
      }
    },

    async updatePhieuGiamGia(data) {
      this.message = "";
      this.errorMessage = "";
      try {
        const response = await PhieuGiamGiaService.update(this.id, data);
        this.message = response.message || "Cập nhật thành công!";
        setTimeout(() => {
          this.$router.push({ name: "admin.phieugiamgia" });
        }, 1000);
      } catch (error) {
        console.error(error);
        this.errorMessage =
          error.response?.data?.message ||
          "Đã xảy ra lỗi khi cập nhật thương hiệu.";
      }
    },
    async deletePhieuGiamGia() {
      if (confirm("Bạn có chắc chắn muốn xóa Thương hiệu này không?")) {
        try {
          await PhieuGiamGiaService.delete(this.id);
          this.$router.push({ name: "admin.phieugiamgia" });
        } catch (error) {
          console.error(error);
          const errorMessage =
            error.response?.data?.message || "Lỗi khi xóa thương hiệu.";
          alert(errorMessage);
        }
      }
    },
  },
  created() {
    this.getPhieuGiamGia(this.id);
  },
};
</script>
