<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-primary text-white fw-bold fs-5">
            <i class="bi bi-person-plus-fill me-2"></i>Thêm Mới Phiếu giảm giá
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
            <PhieuGiamGiaForm
              :phieuGiamGia="phieuGiamGia"
              :isEdit="false"
              :isLoading="isLoading"
              @submit:phieugiamgia="createPhieuGiamGia"
              @cancel="goBack"
            />
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
  name: "PhieuGiamGiaAdd",
  components: {
    PhieuGiamGiaForm,
  },
  data() {
    return {
      phieuGiamGia: {
        tenphieu: "",
        loaigiamgia: "",
        giatrigiam: "",
        thoihan: "",
        giamtoida: "",
        dongiatoithieu: "",
        duongdananh: "",
      },
      isLoading: false,
      errorMessage: "",
    };
  },
  methods: {
    async createPhieuGiamGia(data) {
      this.message = "";
      this.errorMessage = "";
      try {
        const response = await PhieuGiamGiaService.create(data);
        this.message = response.message || "Thêm Phiếu giảm giá thành công!";
        setTimeout(() => {
          this.$router.push({ name: "admin.phieugiamgia" });
        }, 1000);
      } catch (error) {
        console.error(error);
        this.errorMessage =
          error.response?.data?.message ||
          "Đã xảy ra lỗi khi thêm mới thương hiệu.";
      }
    },
    goBack() {
      this.$router.push({ name: "admin.phieugiamgia" });
    },
  },
};
</script>
