<template>
  <div class="container py-4">
    <h3 class="fw-bold text-primary mb-4">Thêm Đợt Khuyến Mãi Mới</h3>
    <DotKhuyenMaiForm :submitting="submitting" @submit-form="handleCreate" />
  </div>
</template>

<script>
import DotKhuyenMaiForm from "@/components/DotKhuyenMaiForm.vue";
import DotKhuyenMaiService from "@/services/dotkhuyenmai.service";

export default {
  name: "DotKhuyenMaiAdd",
  components: { DotKhuyenMaiForm },
  data() {
    return {
      submitting: false,
    };
  },
  methods: {
    async handleCreate(formData) {
      this.submitting = true;
      try {
        await DotKhuyenMaiService.create(formData);
        alert("Tạo đợt khuyến mãi thành công!");
        this.$router.push({ name: "dotkhuyenmai" });
      } catch (error) {
        alert(
          error.response?.data?.message ||
            "Đã xảy ra lỗi khi tạo đợt khuyến mãi",
        );
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>
