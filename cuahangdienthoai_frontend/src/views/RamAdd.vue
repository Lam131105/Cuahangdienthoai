<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-success text-white fw-bold fs-5">
            <i class="bi bi-plus-circle me-2"></i>Thêm Dung Lượng RAM Mới
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
            <RamForm
              :ram="ram"
              :isLoading="isLoading"
              @submit:ram="createRam"
              @cancel="goBack"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RamForm from "@/components/RamForm.vue";
import RamService from "@/services/ram.service";

export default {
  name: "RamAdd",
  components: {
    RamForm,
  },
  data() {
    return {
      ram: {
        dungluongram: "",
      },
      isLoading: false,
      errorMessage: "",
    };
  },
  methods: {
    async createRam(data) {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        await RamService.create(data);
        this.$router.push({ name: "admin.ram" });
      } catch (error) {
        console.error("Lỗi thêm RAM:", error);
        this.errorMessage =
          error.response?.data?.message ||
          "Đã xảy ra lỗi khi thêm dung lượng RAM mới!";
      } finally {
        this.isLoading = false;
      }
    },
    goBack() {
      this.$router.push({ name: "admin.ram" });
    },
  },
};
</script>
