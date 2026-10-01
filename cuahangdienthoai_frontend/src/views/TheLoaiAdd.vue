<script>
import TheLoaiForm from "@/components/TheLoaiForm.vue";
import TheLoaiService from "@/services/theloai.service";

export default {
  components: {
    TheLoaiForm,
  },
  data() {
    return {
      theLoai: {
        tentheloai: "",
        mota: "",
      },
      message: "",
      errorMessage: "",
    };
  },
  methods: {
    async addTheLoai(data) {
      this.message = "";
      this.errorMessage = "";
      try {
        const response = await TheLoaiService.create(data);
        this.message = response.message || "Thêm thể loại thành công!";
        setTimeout(() => {
          this.$router.push({ name: "admin.theloai" });
        }, 1000);
      } catch (error) {
        console.error(error);
        this.errorMessage =
          error.response?.data?.message ||
          "Đã xảy ra lỗi khi thêm mới thể loại.";
      }
    },
  },
};
</script>

<template>
  <div class="container mt-4" style="max-width: 600px">
    <h3 class="mb-4 text-success">
      <i class="fas fa-plus-circle"></i> Thêm Danh mục Mới
    </h3>

    <div v-if="message" class="alert alert-success">{{ message }}</div>
    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

    <div class="card shadow-sm">
      <div class="card-body">
        <TheLoaiForm
          :theLoai="theLoai"
          :isEdit="false"
          @submit:theloai="addTheLoai"
        />
      </div>
    </div>
  </div>
</template>
