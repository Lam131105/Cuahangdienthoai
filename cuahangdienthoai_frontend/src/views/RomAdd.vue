<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-success text-white fw-bold fs-5">
            <i class="bi bi-plus-circle me-2"></i>Thêm Dung Lượng ROM Mới
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
            <RomForm
              :rom="rom"
              :isLoading="isLoading"
              @submit:rom="createRom"
              @cancel="goBack"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RomForm from "@/components/RomForm.vue";
import RomService from "@/services/rom.service";

export default {
  name: "RomAdd",
  components: {
    RomForm,
  },
  data() {
    return {
      rom: {
        dungluongrom: "",
      },
      isLoading: false,
      errorMessage: "",
    };
  },
  methods: {
    async createRom(data) {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        await RomService.create(data);
        this.$router.push({ name: "admin.rom" });
      } catch (error) {
        console.error("Lỗi thêm ROM:", error);
        this.errorMessage =
          error.response?.data?.message ||
          "Đã xảy ra lỗi khi thêm dung lượng ROM mới!";
      } finally {
        this.isLoading = false;
      }
    },
    goBack() {
      this.$router.push({ name: "admin.rom" });
    },
  },
};
</script>
