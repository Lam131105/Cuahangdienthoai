<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-warning text-dark fw-bold fs-5">
            <i class="bi bi-pencil-square me-2"></i>Hiệu Chỉnh Màu Sắc: {{ id }}
          </div>

          <div class="card-body p-4">
            <!-- Loading ban đầu -->
            <div v-if="isFetching" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải dữ liệu...</span>
              </div>
              <p class="mt-2 text-muted">Đang lấy thông tin màu sắc...</p>
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
              <MauSacForm
                :mauSac="mauSac"
                :isLoading="isLoading"
                @submit:mauSac="updateMauSac"
                @cancel="goBack"
              />
            </template>
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
  name: "MauSacEdit",
  components: {
    MauSacForm,
  },
  props: {
    id: { type: String, required: true },
  },
  data() {
    return {
      mauSac: null,
      isFetching: true,
      isLoading: false,
      errorMessage: "",
    };
  },
  methods: {
    async getMauSac(id) {
      this.isFetching = true;
      try {
        this.mauSac = await MauSacService.get(id);
      } catch (error) {
        console.error("Lỗi lấy thông tin màu sắc:", error);
        this.$router.push({
          name: "notfound",
          params: { pathMatch: this.$route.path.split("/").slice(1) },
          query: this.$route.query,
          hash: this.$route.hash,
        });
      } finally {
        this.isFetching = false;
      }
    },

    async updateMauSac(data) {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        await MauSacService.update(this.id, data);
        this.$router.push({ name: "admin.mausac" });
      } catch (error) {
        console.error("Lỗi cập nhật màu sắc:", error);
        this.errorMessage =
          error.response?.data?.message ||
          "Đã xảy ra lỗi khi cập nhật màu sắc!";
      } finally {
        this.isLoading = false;
      }
    },

    goBack() {
      this.$router.push({ name: "admin.mausac" });
    },
  },
  created() {
    this.getMauSac(this.id);
  },
};
</script>
