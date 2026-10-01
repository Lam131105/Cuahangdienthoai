<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <!-- Card bọc Form -->
        <div class="card shadow-sm border-0">
          <div class="card-header bg-success text-white fw-bold fs-5">
            <i class="bi bi-plus-circle me-2"></i>Thêm Nhà Cung Cấp Mới
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
            <NhaCungCapForm
              :nhaCungCap="nhaCungCap"
              :isLoading="isLoading"
              @submit:nhaCungCap="createNhaCungCap"
              @cancel="goBack"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NhaCungCapForm from "@/components/NhaCungCapForm.vue";
import NhaCungCapService from "@/services/nhacungcap.service";

export default {
  name: "NhaCungCapAdd",
  components: {
    NhaCungCapForm,
  },
  data() {
    return {
      nhaCungCap: {
        tenncc: "",
        sodienthoai: "",
        diachi: "",
      },
      isLoading: false,
      errorMessage: "",
    };
  },
  methods: {
    async createNhaCungCap(data) {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        await NhaCungCapService.create(data);
        // Chuyển về trang danh sách sau khi thêm thành công
        this.$router.push({ name: "admin.nhacungcap" });
      } catch (error) {
        console.error("Lỗi thêm nhà cung cấp:", error);
        this.errorMessage =
          error.response?.data?.message ||
          "Đã xảy ra lỗi khi thêm nhà cung cấp mới!";
      } finally {
        this.isLoading = false;
      }
    },
    goBack() {
      this.$router.push({ name: "admin.nhacungcap" });
    },
  },
};
</script>
