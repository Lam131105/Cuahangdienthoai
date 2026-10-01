<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-success text-white fw-bold fs-5">
            <i class="bi bi-plus-circle me-2"></i>Thêm Màu Sắc Mới
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
            <MauSacForm
              :mauSac="mauSac"
              :isLoading="isLoading"
              @submit:mauSac="createMauSac"
              @cancel="goBack"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MauSacForm from "@/components/MauSacForm.vue";
import MauSacService from "@/services/mausac.service";

export default {
  name: "MauSacAdd",
  components: {
    MauSacForm,
  },
  data() {
    return {
      mauSac: {
        tenmau: "",
      },
      isLoading: false,
      errorMessage: "",
    };
  },
  methods: {
    async createMauSac(data) {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        await MauSacService.create(data);
        this.$router.push({ name: "admin.mausac" });
      } catch (error) {
        console.error("Lỗi thêm Màu sắc:", error);
        this.errorMessage =
          error.response?.data?.message ||
          "Đã xảy ra lỗi khi thêm màu sắc mới!";
      } finally {
        this.isLoading = false;
      }
    },
    goBack() {
      this.$router.push({ name: "admin.mausac" });
    },
  },
};
</script>
