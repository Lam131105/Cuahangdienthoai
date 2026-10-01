<script>
import ThuongHieuForm from "@/components/ThuongHieuForm.vue";
import ThuongHieuService from "@/services/thuonghieu.service";

export default {
  components: {
    ThuongHieuForm,
  },
  data() {
    return {
      thuongHieu: {
        tenthuonghieu: "",
        logothuonghieu: "",
        mota: "",
      },
      message: "",
      errorMessage: "",
    };
  },
  methods: {
    async addThuongHieu(data) {
      this.message = "";
      this.errorMessage = "";
      try {
        const response = await ThuongHieuService.create(data);
        this.message = response.message || "Thêm thương hiệu thành công!";
        setTimeout(() => {
          this.$router.push({ name: "admin.thuonghieu" });
        }, 1000);
      } catch (error) {
        console.error(error);
        this.errorMessage =
          error.response?.data?.message ||
          "Đã xảy ra lỗi khi thêm mới thương hiệu.";
      }
    },
  },
};
</script>

<template>
  <div class="container mt-4" style="max-width: 600px">
    <h3 class="mb-4 text-success">
      <i class="fas fa-plus-circle"></i> Thêm Thương Hiệu Mới
    </h3>

    <div v-if="message" class="alert alert-success">{{ message }}</div>
    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

    <div class="card shadow-sm">
      <div class="card-body">
        <ThuongHieuForm
          :thuongHieu="thuongHieu"
          :isEdit="false"
          @submit:thuonghieu="addThuongHieu"
        />
      </div>
    </div>
  </div>
</template>
