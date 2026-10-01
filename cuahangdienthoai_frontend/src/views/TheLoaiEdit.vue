<template>
  <div class="container mt-4" style="max-width: 600px">
    <h3 class="mb-4 text-warning">
      <i class="fas fa-edit"></i> Chỉnh Sửa Danh mục
    </h3>

    <div v-if="message" class="alert alert-success">{{ message }}</div>
    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

    <div class="card shadow-sm" v-if="theLoai">
      <div class="card-body">
        <TheLoaiForm
          :theLoai="theLoai"
          :isEdit="true"
          @submit:theloai="updateTheLoai"
          @delete:theloai="deleteTheLoai"
        />
      </div>
    </div>
  </div>
</template>

<script>
import TheLoaiForm from "@/components/TheLoaiForm.vue";
import TheLoaiService from "@/services/theloai.service";

export default {
  components: {
    TheLoaiForm,
  },
  props: {
    id: { type: String, required: true },
  },
  data() {
    return {
      theLoai: null,
      message: "",
      errorMessage: "",
    };
  },
  methods: {
    async getTheLoai(id) {
      try {
        this.theLoai = await TheLoaiService.get(id);
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
    async updateTheLoai(data) {
      this.message = "";
      this.errorMessage = "";
      try {
        const response = await TheLoaiService.update(this.id, data);
        this.message = response.message || "Cập nhật thành công!";
        setTimeout(() => {
          this.$router.push({ name: "admin.theloai" });
        }, 1000);
      } catch (error) {
        console.error(error);
        this.errorMessage =
          error.response?.data?.message ||
          "Đã xảy ra lỗi khi cập nhật Danh mục.";
      }
    },
    async deleteTheLoai() {
      if (confirm("Bạn có chắc chắn muốn xóa Danh mục này không?")) {
        try {
          await TheLoaiService.delete(this.id);
          this.$router.push({ name: "admin.theloai" });
        } catch (error) {
          console.error(error);
          const errorMessage =
            error.response?.data?.message || "Lỗi khi xóa Danh mục.";
          alert(errorMessage);
        }
      }
    },
  },
  created() {
    this.getTheLoai(this.id);
  },
};
</script>
