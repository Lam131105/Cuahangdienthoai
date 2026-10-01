<template>
  <div class="container my-4">
    <div class="card shadow-sm">
      <div class="card-header bg-primary text-white">
        <h4 class="card-title mb-0">
          <i class="fas fa-plus-circle me-2"></i>Tạo Phiếu Nhập Kho Mới
        </h4>
      </div>
      <div class="card-body">
        <PhieuNhapForm
          :dsNhaCungCap="dsNhaCungCap"
          :submitting="submitting"
          @submit-phieunhap="handleCreate"
        />
      </div>
    </div>
  </div>
</template>

<script>
import PhieuNhapForm from "@/components/PhieuNhapForm.vue";
import PhieuNhapService from "@/services/phieunhap.service";
import NhaCungCapService from "@/services/nhacungcap.service"; // Bạn tự tạo hoặc chỉnh theo service thực tế

export default {
  name: "PhieuNhapAdd",
  components: { PhieuNhapForm },
  data() {
    return {
      dsNhaCungCap: [],
      submitting: false,
    };
  },
  created() {
    this.fetchNhaCungCap();
  },
  methods: {
    async fetchNhaCungCap() {
      try {
        // Thay bằng hàm lấy danh sách Nhà Cung Cấp từ Service của bạn
        this.dsNhaCungCap = await NhaCungCapService.getAll();
      } catch (error) {
        console.error("Lỗi lấy danh sách nhà cung cấp:", error);
      }
    },
    async handleCreate(data) {
      this.submitting = true;
      try {
        await PhieuNhapService.create(data);
        alert("Khởi tạo phiếu nhập kho thành công!");
        this.$router.push({ name: "phieunhap" });
      } catch (error) {
        alert(
          error.response?.data?.message || "Đã xảy ra lỗi khi tạo phiếu nhập",
        );
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>
