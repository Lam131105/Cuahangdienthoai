<template>
  <Form @submit="submitMauSac" :validation-schema="mauSacFormSchema">
    <!-- Tên Màu Sắc -->
    <div class="mb-3">
      <label for="tenmau" class="form-label fw-bold">
        Tên Màu Sắc <span class="text-danger">*</span>
      </label>
      <Field
        name="tenmau"
        type="text"
        class="form-control"
        id="tenmau"
        v-model="mauSacLocal.tenmau"
        placeholder="Nhập tên màu sắc (VD: Đen, Trắng, Xanh Titanium, Vàng Gold)..."
      />
      <ErrorMessage
        name="tenmau"
        class="error-feedback text-danger small mt-1"
      />
    </div>

    <!-- Nút hành động -->
    <div class="d-flex gap-2 justify-content-end mt-4">
      <button type="button" class="btn btn-secondary" @click="cancel">
        <i class="bi bi-x-circle me-1"></i> Hủy
      </button>
      <button
        type="submit"
        class="btn btn-success fw-semibold"
        :disabled="isLoading"
      >
        <span
          v-if="isLoading"
          class="spinner-border spinner-border-sm me-1"
          role="status"
        ></span>
        <i v-else class="bi bi-check-circle me-1"></i>
        Lưu Màu Sắc
      </button>
    </div>
  </Form>
</template>

<script>
import * as yup from "yup";
import { Form, Field, ErrorMessage } from "vee-validate";

export default {
  name: "MauSacForm",
  components: {
    Form,
    Field,
    ErrorMessage,
  },
  props: {
    mauSac: {
      type: Object,
      default: () => ({
        tenmau: "",
      }),
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["submit:mauSac", "cancel"],
  data() {
    const mauSacFormSchema = yup.object().shape({
      tenmau: yup
        .string()
        .required("Tên màu sắc không được để trống.")
        .max(50, "Tên màu sắc tối đa 50 ký tự."),
    });

    return {
      mauSacLocal: { ...this.mauSac },
      mauSacFormSchema,
    };
  },
  watch: {
    mauSac: {
      handler(newVal) {
        this.mauSacLocal = { ...newVal };
      },
      deep: true,
    },
  },
  methods: {
    submitMauSac() {
      this.$emit("submit:mauSac", this.mauSacLocal);
    },
    cancel() {
      this.$emit("cancel");
    },
  },
};
</script>

<style scoped>
.error-feedback {
  display: block;
}
</style>
