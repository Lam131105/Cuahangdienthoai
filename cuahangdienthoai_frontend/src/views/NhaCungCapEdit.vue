<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-warning text-dark fw-bold fs-5">
            <i class="bi bi-pencil-square me-2"></i>Hiệu Chỉnh Nhà Cung Cấp:
            {{ id }}
          </div>

          <div class="card-body p-4">
            <!-- Trạng thái đang tải dữ liệu ban đầu -->
            <div v-if="isFetching" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải dữ liệu...</span>
              </div>
              <p class="mt-2 text-muted">Đang lấy thông tin nhà cung cấp...</p>
            </div>

            <!-- Form sau khi đã tải xong dữ liệu -->
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

              <NhaCungCapForm
                :nhaCungCap="nhaCungCap"
                :isLoading="isLoading"
                @submit:nhaCungCap="updateNhaCungCap"
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
import NhaCungCapForm from "@/components/NhaCungCapForm.vue";
import NhaCungCapService from "@/services/nhacungcap.service";

export default {
  name: "NhaCungCapEdit",
  components: {
    NhaCungCapForm,
  },
  props: {
    id: { type: String, required: true },
  },
  data() {
    return {
      nhaCungCap: null,
      isFetching: true,
      isLoading: false,
      errorMessage: "",
    };
  },
  methods: {
    async getNhaCungCap(id) {
      this.isFetching = true;
      try {
        this.nhaCungCap = await NhaCungCapService.get(id);
      } catch (error) {
        console.error("Lỗi lấy thông tin nhà cung cấp:", error);
        // Nếu không tìm thấy ID thì chuyển hướng về danh sách
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

    async updateNhaCungCap(data) {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        await NhaCungCapService.update(this.id, data);
        // Chuyển về trang danh sách sau khi cập nhật thành công
        this.$router.push({ name: "nhacungcap" });
      } catch (error) {
        console.error("Lỗi cập nhật nhà cung cấp:", error);
        this.errorMessage =
          error.response?.data?.message ||
          "Đã xảy ra lỗi khi cập nhật nhà cung cấp!";
      } finally {
        this.isLoading = false;
      }
    },

    goBack() {
      this.$router.push({ name: "nhacungcap" });
    },
  },
  created() {
    this.getNhaCungCap(this.id);
  },
};
</script>
