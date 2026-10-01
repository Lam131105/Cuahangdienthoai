<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-warning text-dark fw-bold fs-5">
            <i class="bi bi-pencil-square me-2"></i>Hiệu Chỉnh Dung Lượng RAM:
            {{ id }}
          </div>

          <div class="card-body p-4">
            <!-- Loading ban đầu -->
            <div v-if="isFetching" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải dữ liệu...</span>
              </div>
              <p class="mt-2 text-muted">
                Đang lấy thông tin dung lượng RAM...
              </p>
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
              <RamForm
                :ram="ram"
                :isLoading="isLoading"
                @submit:ram="updateRam"
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
import RamForm from "@/components/RamForm.vue";
import RamService from "@/services/ram.service";

export default {
  name: "RamEdit",
  components: {
    RamForm,
  },
  props: {
    id: { type: String, required: true },
  },
  data() {
    return {
      ram: null,
      isFetching: true,
      isLoading: false,
      errorMessage: "",
    };
  },
  methods: {
    async getRam(id) {
      this.isFetching = true;
      try {
        this.ram = await RamService.get(id);
      } catch (error) {
        console.error("Lỗi lấy thông tin RAM:", error);
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

    async updateRam(data) {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        await RamService.update(this.id, data);
        this.$router.push({ name: "admin.ram" });
      } catch (error) {
        console.error("Lỗi cập nhật RAM:", error);
        this.errorMessage =
          error.response?.data?.message ||
          "Đã xảy ra lỗi khi cập nhật dung lượng RAM!";
      } finally {
        this.isLoading = false;
      }
    },

    goBack() {
      this.$router.push({ name: "admin.ram" });
    },
  },
  created() {
    this.getRam(this.id);
  },
};
</script>
