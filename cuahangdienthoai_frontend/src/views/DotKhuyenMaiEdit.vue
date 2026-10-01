<template>
  <div class="container py-4">
    <h3 class="fw-bold text-primary mb-4">
      Cập Nhật Đợt Khuyến Mãi: {{ $route.params.id }}
    </h3>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <DotKhuyenMaiForm
      v-else
      :initialData="dotKhuyenMaiData"
      :isEdit="true"
      :submitting="submitting"
      @submit-form="handleUpdate"
    />
  </div>
</template>

<script>
import DotKhuyenMaiForm from "@/components/DotKhuyenMaiForm.vue";
import DotKhuyenMaiService from "@/services/dotkhuyenmai.service";

export default {
  name: "DotKhuyenMaiEdit",
  components: { DotKhuyenMaiForm },
  props: {
    id: { type: String, required: true },
  },
  data() {
    return {
      dotKhuyenMaiData: {},
      loading: true,
      submitting: false,
    };
  },
  async created() {
    await this.fetchDetail();
  },
  methods: {
    async fetchDetail() {
      try {
        const id = this.id;
        this.dotKhuyenMaiData = await DotKhuyenMaiService.get(id);
      } catch (error) {
        alert("Không tìm thấy đợt khuyến mãi!");
        this.$router.push({ name: "dotkhuyenmai" });
      } finally {
        this.loading = false;
      }
    },
    async handleUpdate(formData) {
      this.submitting = true;
      try {
        const id = this.id;
        await DotKhuyenMaiService.update(id, formData);
        alert("Cập nhật thành công!");
        this.$router.push({ name: "dotkhuyenmai" });
      } catch (error) {
        alert(
          error.response?.data?.message || "Lỗi khi cập nhật đợt khuyến mãi!",
        );
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>
