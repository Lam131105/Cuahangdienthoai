<template>
  <div class="container my-4">
    <div class="card shadow-sm">
      <div class="card-header bg-warning text-dark">
        <h4 class="card-title mb-0">
          <i class="fas fa-edit me-2"></i>Chỉnh Sửa Phiếu Nhập Kho
        </h4>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center my-4">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2">Đang tải thông tin phiếu nhập...</p>
        </div>

        <PhieuNhapForm
          v-else-if="phieuNhap"
          :phieuNhapData="phieuNhap"
          :dsNhaCungCap="dsNhaCungCap"
          :isEdit="true"
          :submitting="submitting"
          @submit-phieunhap="handleUpdate"
        />

        <div v-else class="alert alert-danger">
          Không tìm thấy thông tin phiếu nhập cần chỉnh sửa.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PhieuNhapForm from "@/components/PhieuNhapForm.vue";
import PhieuNhapService from "@/services/phieunhap.service";
import NhaCungCapService from "@/services/nhacungcap.service";

export default {
  name: "PhieuNhapEdit",
  components: { PhieuNhapForm },
  props: {
    id: { type: String, required: true },
  },
  data() {
    return {
      phieuNhap: null,
      dsNhaCungCap: [],
      loading: true,
      submitting: false,
    };
  },
  async created() {
    await this.fetchNhaCungCap();
    await this.fetchPhieuNhapDetail();
  },
  methods: {
    async fetchNhaCungCap() {
      try {
        this.dsNhaCungCap = await NhaCungCapService.getAll();
      } catch (error) {
        console.error("Lỗi lấy danh sách nhà cung cấp:", error);
      }
    },
    async fetchPhieuNhapDetail() {
      this.loading = true;
      try {
        const id = this.id || this.id;
        this.phieuNhap = await PhieuNhapService.get(id);
      } catch (error) {
        console.error("Lỗi lấy chi tiết phiếu nhập:", error);
      } finally {
        this.loading = false;
      }
    },
    async handleUpdate(data) {
      this.submitting = true;
      try {
        const id = this.id || this.id;
        await PhieuNhapService.update(id, data);
        alert("Cập nhật phiếu nhập thành công!");
        this.$router.push({ name: "phieunhap" });
      } catch (error) {
        alert(
          error.response?.data?.message ||
            "Đã xảy ra lỗi khi cập nhật phiếu nhập",
        );
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>
