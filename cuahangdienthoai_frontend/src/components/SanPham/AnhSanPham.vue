<template>
  <div class="row g-4">
    <!-- Form Thêm Ảnh Mới -->
    <div class="col-lg-4">
      <div class="card border-0 shadow-sm rounded-3">
        <div class="card-header bg-white py-3">
          <h6 class="mb-0 fw-bold">
            <i class="fas fa-upload me-2 text-primary"></i>Thêm Ảnh Mới
          </h6>
        </div>
        <div class="card-body">
          <form @submit.prevent="handleUploadImage">
            <div class="mb-3">
              <label class="form-label small fw-semibold">Chọn file ảnh</label>
              <input
                type="file"
                class="form-control"
                accept="image/*"
                ref="fileInput"
                @change="handleFileChange"
                required
              />
            </div>

            <!-- Preview Ảnh -->
            <div v-if="previewUrl" class="mb-3 text-center">
              <img
                :src="previewUrl"
                class="img-thumbnail"
                style="max-height: 180px"
              />
            </div>

            <div class="form-check form-switch mb-3">
              <input
                class="form-check-input"
                type="checkbox"
                id="laAnhChinh"
                v-model="isPrimaryImage"
              />
              <label
                class="form-check-label small fw-semibold"
                for="laAnhChinh"
              >
                Đặt làm ảnh đại diện chính
              </label>
            </div>

            <button
              type="submit"
              class="btn btn-primary w-100 fw-bold"
              :disabled="uploading"
            >
              <span
                v-if="uploading"
                class="spinner-border spinner-border-sm me-1"
              ></span>
              <i v-else class="fas fa-cloud-upload-alt me-1"></i> Tải ảnh lên
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Danh Sách Ảnh -->
    <div class="col-lg-8">
      <div class="card border-0 shadow-sm rounded-3">
        <div
          class="card-header bg-white py-3 d-flex justify-content-between align-items-center"
        >
          <h6 class="mb-0 fw-bold">
            <i class="fas fa-layer-group me-2 text-primary"></i>Thư Viện Ảnh ({{
              dsAnh.length
            }})
          </h6>
        </div>
        <div class="card-body">
          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status"></div>
          </div>

          <div
            v-else-if="dsAnh.length === 0"
            class="text-center text-muted py-5"
          >
            <i class="fas fa-image fa-3x mb-3 text-secondary opacity-50"></i>
            <p class="mb-0">Sản phẩm này chưa có hình ảnh nào.</p>
          </div>

          <div v-else class="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
            <div v-for="anh in dsAnh" :key="anh.id" class="col">
              <div class="card h-100 border position-relative image-card">
                <span
                  v-if="anh.laanhchinh"
                  class="badge bg-success position-absolute top-0 start-0 m-2 shadow-sm"
                >
                  <i class="fas fa-star me-1"></i>Ảnh chính
                </span>

                <img
                  :src="getImageUrl(anh.duongdananh)"
                  class="card-img-top p-2"
                  style="height: 160px; object-fit: contain"
                  alt="Sản phẩm"
                />

                <div
                  class="card-footer bg-light border-0 d-flex justify-content-between p-2"
                >
                  <button
                    v-if="!anh.laanhchinh"
                    class="btn btn-outline-primary btn-sm fs-7"
                    title="Đặt làm ảnh chính"
                    @click="setAsPrimary(anh.id)"
                  >
                    <i class="fas fa-check"></i>
                  </button>

                  <button
                    v-if="!anh.laanhchinh"
                    class="btn btn-outline-danger btn-sm fs-7 ms-auto"
                    title="Xóa ảnh"
                    @click="deleteImage(anh.id)"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AnhSanPhamService from "@/services/anhsanpham.service";

export default {
  name: "AnhSanPhamTab",
  props: {
    masanpham: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      dsAnh: [],
      selectedFile: null,
      previewUrl: null,
      isPrimaryImage: false,
      loading: false,
      uploading: false,
    };
  },
  async created() {
    await this.fetchImages();
  },
  methods: {
    async fetchImages() {
      this.loading = true;
      try {
        const res = await AnhSanPhamService.getBySanPham(this.masanpham);
        this.dsAnh = res || [];
      } catch (error) {
        console.error("Lỗi tải danh sách ảnh:", error);
      } finally {
        this.loading = false;
      }
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        this.previewUrl = URL.createObjectURL(file);
      }
    },
    async handleUploadImage() {
      if (!this.selectedFile) return;

      this.uploading = true;
      try {
        const formData = new FormData();
        formData.append("image", this.selectedFile);
        formData.append("masanpham", this.masanpham);
        formData.append("laanhchinh", this.isPrimaryImage);

        await AnhSanPhamService.create(formData);

        this.selectedFile = null;
        this.previewUrl = null;
        this.isPrimaryImage = false;
        if (this.$refs.fileInput) this.$refs.fileInput.value = "";

        await this.fetchImages();
      } catch (error) {
        alert("Lỗi khi tải ảnh lên!");
      } finally {
        this.uploading = false;
      }
    },
    async setAsPrimary(anhId) {
      try {
        const formData = new FormData();
        formData.append("laanhchinh", true);
        formData.append("masanpham", this.masanpham);

        await AnhSanPhamService.update(anhId, formData);
        await this.fetchImages();
      } catch (error) {
        alert("Lỗi khi cập nhật ảnh chính!");
      }
    },
    async deleteImage(anhId) {
      if (!confirm("Bạn có chắc chắn muốn xóa ảnh này?")) return;
      try {
        await AnhSanPhamService.delete(anhId);
        await this.fetchImages();
      } catch (error) {
        alert("Không thể xóa ảnh này!");
      }
    },
    getImageUrl(fileName) {
      if (!fileName) return "";
      if (fileName.startsWith("http")) return fileName;
      return `http://localhost:5000${fileName}`;
    },
  },
};
</script>

<style scoped>
.image-card:hover {
  border-color: #0d6efd !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
}
.fs-7 {
  font-size: 0.8rem;
}
</style>
