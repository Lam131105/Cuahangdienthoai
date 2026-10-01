<template>
  <Form @submit="submitRom" :validation-schema="romFormSchema">
    <!-- Dung lượng ROM (Số + Đơn vị) -->
    <div class="mb-3">
      <label for="dungluong" class="form-label fw-bold">
        Dung Lượng ROM <span class="text-danger">*</span>
      </label>
      <div class="input-group">
        <!-- Ô nhập số -->
        <Field
          name="dungluong"
          type="number"
          min="1"
          class="form-control"
          id="dungluong"
          v-model="dungluong"
          placeholder="Nhập số dung lượng (VD: 8, 16, 32...)"
        />

        <!-- Ô chọn đơn vị GB/TB -->
        <select class="form-select" style="max-width: 110px" v-model="donvi">
          <option value="GB">GB</option>
          <option value="TB">TB</option>
        </select>
      </div>

      <!-- Hiển thị lỗi validate cho số dung lượng -->
      <ErrorMessage
        name="dungluong"
        class="error-feedback text-danger small mt-1"
      />

      <!-- Hiển thị bản xem trước kết quả sẽ lưu -->
      <div class="form-text mt-1 text-muted" v-if="dungluong">
        Dữ liệu lưu vào hệ thống:
        <strong class="text-primary">{{ dungluong }} {{ donvi }}</strong>
      </div>
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
        Lưu ROM
      </button>
    </div>
  </Form>
</template>

<script>
import * as yup from "yup";
import { Form, Field, ErrorMessage } from "vee-validate";

export default {
  name: "RomForm",
  components: {
    Form,
    Field,
    ErrorMessage,
  },
  props: {
    rom: {
      type: Object,
      default: () => ({
        dungluongrom: "",
      }),
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["submit:rom", "cancel"],
  data() {
    // Validate ô nhập số dung lượng
    const romFormSchema = yup.object().shape({
      dungluong: yup
        .number()
        .typeError("Dung lượng ROM phải là chữ số.")
        .required("Dung lượng ROM không được để trống.")
        .positive("Dung lượng ROM phải lớn hơn 0.")
        .integer("Dung lượng ROM phải là số nguyên."),
    });

    return {
      dungluong: "",
      donvi: "GB", // Mặc định là GB
      romFormSchema,
    };
  },
  watch: {
    rom: {
      handler(newVal) {
        if (newVal && newVal.dungluongrom) {
          this.parseRomString(newVal.dungluongrom);
        }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    // Tách chuỗi từ DB (ví dụ "16 GB" hoặc "16GB" -> số: 16, đơn vị: GB)
    parseRomString(str) {
      if (!str) return;

      // Ví dụ str = "16 GB"
      const parts = str.split(" "); // Cắt chuỗi thành mảng: ["16", "GB"]

      this.dungluong = parts[0]; // Phần tử đầu tiên là Số: "16"
      this.donvi = parts[1] || "GB"; // Phần tử thứ 2 là Đơn vị: "GB" (nếu thiếu thì lấy "GB")
    },

    submitRom() {
      // Ghép số và đơn vị lại thành chuỗi chuẩn gửi về Backend
      const romData = {
        dungluongrom: `${this.dungluong} ${this.donvi}`,
      };
      this.$emit("submit:rom", romData);
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
