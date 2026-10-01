<template>
  <div class="container py-4">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-warning text-dark fw-bold fs-5">
            <i class="bi bi-pencil-square me-2"></i>Hiệu Chỉnh Dung Lượng ROM:
            {{ id }}
          </div>

          <div class="card-body p-4">
            <!-- Loading ban đầu -->
            <div v-if="isFetching" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải dữ liệu...</span>
              </div>
              <p class="mt-2 text-muted">
                Đang lấy thông tin dung lượng ROM...
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
              <RomForm
                :rom="rom"
                :isLoading="isLoading"
                @submit:rom="updateRom"
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
import RomForm from "@/components/RomForm.vue";
import RomService from "@/services/rom.service";

export default {
  name: "RomEdit",
  components: {
    RomForm,
  },
  props: {
    id: { type: String, required: true },
  },
  data() {
    return {
      rom: null,
      isFetching: true,
      isLoading: false,
      errorMessage: "",
    };
  },
  methods: {
    async getRom(id) {
      this.isFetching = true;
      try {
        this.rom = await RomService.get(id);
      } catch (error) {
        console.error("Lỗi lấy thông tin ROM:", error);
        this.$router.push({
          name: "notfound",
          paroms: { pathMatch: this.$route.path.split("/").slice(1) },
          query: this.$route.query,
          hash: this.$route.hash,
        });
      } finally {
        this.isFetching = false;
      }
    },

    async updateRom(data) {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        await RomService.update(this.id, data);
        this.$router.push({ name: "admin.rom" });
      } catch (error) {
        console.error("Lỗi cập nhật ROM:", error);
        this.errorMessage =
          error.response?.data?.message ||
          "Đã xảy ra lỗi khi cập nhật dung lượng ROM!";
      } finally {
        this.isLoading = false;
      }
    },

    goBack() {
      this.$router.push({ name: "admin.rom" });
    },
  },
  created() {
    this.getRom(this.id);
  },
};
</script>
