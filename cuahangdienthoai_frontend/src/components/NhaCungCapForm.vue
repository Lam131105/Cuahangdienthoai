<template>
  <Form @submit="submitNhaCungCap" :validation-schema="nhaCungCapFormSchema">
    <!-- Tên Nhà Cung Cấp -->
    <div class="mb-3">
      <label for="tenncc" class="form-label fw-bold">
        Tên Nhà Cung Cấp <span class="text-danger">*</span>
      </label>
      <Field
        name="tenncc"
        type="text"
        class="form-control"
        id="tenncc"
        v-model="nhaCungCapLocal.tenncc"
        placeholder="Nhập tên nhà cung cấp..."
      />
      <ErrorMessage
        name="tenncc"
        class="error-feedback text-danger small mt-1"
      />
    </div>

    <!-- Số Điện Thoại -->
    <div class="mb-3">
      <label for="sodienthoai" class="form-label fw-bold">Số Điện Thoại</label>
      <Field
        name="sodienthoai"
        type="text"
        class="form-control"
        id="sodienthoai"
        v-model="nhaCungCapLocal.sodienthoai"
        placeholder="Nhập số điện thoại (ví dụ: 0912345678)..."
      />
      <ErrorMessage
        name="sodienthoai"
        class="error-feedback text-danger small mt-1"
      />
    </div>

    <!-- Địa Chỉ -->
    <div class="mb-3">
      <label for="diachi" class="form-label fw-bold">Địa Chỉ</label>
      <Field
        name="diachi"
        as="textarea"
        rows="3"
        class="form-control"
        id="diachi"
        v-model="nhaCungCapLocal.diachi"
        placeholder="Nhập địa chỉ nhà cung cấp..."
      />
      <ErrorMessage
        name="diachi"
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
        Lưu Nhà Cung Cấp
      </button>
    </div>
  </Form>
</template>

<script>
import * as yup from "yup";
import { Form, Field, ErrorMessage } from "vee-validate";

export default {
  name: "NhaCungCapForm",
  components: {
    Form,
    Field,
    ErrorMessage,
  },
  props: {
    nhaCungCap: {
      type: Object,
      default: () => ({
        tenncc: "",
        sodienthoai: "",
        diachi: "",
      }),
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["submit:nhaCungCap", "cancel"],
  data() {
    // Regex kiểm tra số điện thoại Việt Nam (nếu có nhập)
    const phoneRegExp = /^(0[3|5|7|8|9])+([0-9]{8})$/;

    const nhaCungCapFormSchema = yup.object().shape({
      tenncc: yup
        .string()
        .required("Tên nhà cung cấp không được để trống.")
        .max(100, "Tên nhà cung cấp tối đa 100 ký tự."),
      sodienthoai: yup
        .string()
        .nullable()
        .notRequired()
        .test(
          "is-phone",
          "Số điện thoại không hợp lệ (VD: 0912345678)",
          (value) => {
            if (!value) return true; // Cho phép để trống
            return phoneRegExp.test(value);
          },
        ),
      diachi: yup.string().max(255, "Địa chỉ tối đa 255 ký tự."),
    });

    return {
      nhaCungCapLocal: { ...this.nhaCungCap },
      nhaCungCapFormSchema,
    };
  },
  watch: {
    nhaCungCap: {
      handler(newVal) {
        this.nhaCungCapLocal = { ...newVal };
      },
      deep: true,
    },
  },
  methods: {
    submitNhaCungCap() {
      this.$emit("submit:nhaCungCap", this.nhaCungCapLocal);
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
