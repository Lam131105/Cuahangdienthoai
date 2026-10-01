<template>
  <div class="container mt-4" style="max-width: 600px">
    <h3 class="mb-4 text-warning">
      <i class="fas fa-edit"></i> Chỉnh Sửa Thương Hiệu
    </h3>

    <div v-if="message" class="alert alert-success">{{ message }}</div>
    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

    <div class="card shadow-sm" v-if="thuongHieu">
      <div class="card-body">
        <ThuongHieuForm
          :thuongHieu="thuongHieu"
          :isEdit="true"
          @submit:thuonghieu="updateThuongHieu"
          @delete:thuonghieu="deleteThuongHieu"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ThuongHieuForm from "@/components/ThuongHieuForm.vue";
import ThuongHieuService from "@/services/thuonghieu.service";

export default {
  components: {
    ThuongHieuForm,
  },
  props: {
    id: { type: String, required: true },
  },
  data() {
    return {
      thuongHieu: null,
      message: "",
      errorMessage: "",
    };
  },
  methods: {
    async getThuongHieu(id) {
      try {
        this.thuongHieu = await ThuongHieuService.get(id);
      } catch (error) {
        console.error(error);
        this.$router.push({
          name: "notFound",
          params: { pathMatch: this.$route.path.split("/").slice(1) },
          query: this.$route.query,
          hash: this.$route.hash,
        });
      }
    },
    async updateThuongHieu(data) {
      this.message = "";
      this.errorMessage = "";
      try {
        const response = await ThuongHieuService.update(this.id, data);
        this.message = response.message || "Cập nhật thành công!";
        setTimeout(() => {
          this.$router.push({ name: "admin.thuonghieu" });
        }, 1000);
      } catch (error) {
        console.error(error);
        this.errorMessage =
          error.response?.data?.message ||
          "Đã xảy ra lỗi khi cập nhật thương hiệu.";
      }
    },
    async deleteThuongHieu() {
      if (confirm("Bạn có chắc chắn muốn xóa Thương hiệu này không?")) {
        try {
          await ThuongHieuService.delete(this.id);
          this.$router.push({ name: "admin.thuonghieu" });
        } catch (error) {
          console.error(error);
          const errorMessage =
            error.response?.data?.message || "Lỗi khi xóa thương hiệu.";
          alert(errorMessage);
        }
      }
    },
  },
  created() {
    this.getThuongHieu(this.id);
  },
};
</script>
