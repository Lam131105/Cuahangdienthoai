<script>
import * as yup from "yup";
import { Form, Field, ErrorMessage } from "vee-validate";

export default {
  components: { Form, Field, ErrorMessage },
  props: {
    thuongHieu: { type: Object, required: true },
    isEdit: { type: Boolean, default: false },
  },
  emits: ["submit:thuonghieu", "delete:thuonghieu"],
  data() {
    const thuongHieuFormSchema = yup.object().shape({
      tenthuonghieu: yup
        .string()
        .required("Tên thương hiệu không được để trống.")
        .min(2, "Tối thiểu 2 ký tự."),
      mota: yup.string().max(500, "Mô tả tối đa 500 ký tự."),
    });

    return {
      thuongHieuLocal: { ...this.thuongHieu },
      selectedFile: null,
      previewImage: null,
      thuongHieuFormSchema,
    };
  },
  methods: {
    // Xử lý khi chọn file ảnh từ máy tính
    onFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        // Tạo URL xem trước ảnh
        this.previewImage = URL.createObjectURL(file);
      }
    },
    submitThuongHieu() {
      // Chuyển dữ liệu sang FormData
      const formData = new FormData();
      formData.append(
        "tenthuonghieu",
        this.thuongHieuLocal.tenthuonghieu || "",
      );
      formData.append("mota", this.thuongHieuLocal.mota || "");

      // Nếu người dùng chọn file mới thì append file
      if (this.selectedFile) {
        formData.append("image", this.selectedFile);
      }

      this.$emit("submit:thuonghieu", formData);
    },
    deleteThuongHieu() {
      this.$emit("delete:thuonghieu", this.thuongHieuLocal.id);
    },
  },
};
</script>

<template>
  <Form @submit="submitThuongHieu" :validation-schema="thuongHieuFormSchema">
    <!-- Mã thương hiệu (Khi sửa) -->
    <div class="mb-3" v-if="isEdit">
      <label class="form-label font-weight-bold">Mã Thương Hiệu:</label>
      <input
        type="text"
        class="form-control bg-light"
        v-model="thuongHieuLocal.id"
        readonly
      />
    </div>

    <!-- Tên thương hiệu -->
    <div class="mb-3">
      <label class="form-label font-weight-bold">
        Tên Thương Hiệu <span class="text-danger">*</span>
      </label>
      <Field
        name="tenthuonghieu"
        type="text"
        class="form-control"
        v-model="thuongHieuLocal.tenthuonghieu"
      />
      <ErrorMessage
        name="tenthuonghieu"
        class="text-danger small mt-1 d-block"
      />
    </div>

    <!-- Chọn File Ảnh Upload -->
    <div class="mb-3">
      <label class="form-label font-weight-bold">
        Logo Thương Hiệu {{ isEdit ? "(Bỏ qua nếu không đổi)" : "*" }}
      </label>
      <input
        type="file"
        class="form-control"
        accept="image/*"
        @change="onFileChange"
      />

      <!-- Khung xem trước ảnh -->
      <div class="mt-2" v-if="previewImage || thuongHieuLocal.logothuonghieu">
        <p class="small text-muted mb-1">Xem trước Logo:</p>
        <img
          :src="
            previewImage ||
            `http://localhost:5000${thuongHieuLocal.logothuonghieu}`
          "
          alt="Logo Preview"
          class="img-thumbnail"
          style="max-height: 100px; object-fit: contain"
        />
      </div>
    </div>

    <!-- Mô tả -->
    <div class="mb-3">
      <label class="form-label font-weight-bold">Mô Tả:</label>
      <Field
        name="mota"
        as="textarea"
        rows="3"
        class="form-control"
        v-model="thuongHieuLocal.mota"
      />
      <ErrorMessage name="mota" class="text-danger small mt-1 d-block" />
    </div>

    <!-- Nút thao tác -->
    <div class="mb-3 d-flex gap-2">
      <button class="btn btn-primary" type="submit">
        <i class="fas fa-save"></i> {{ isEdit ? "Cập Nhật" : "Lưu Mới" }}
      </button>
      <button
        v-if="isEdit"
        type="button"
        class="btn btn-danger"
        @click="deleteThuongHieu"
      >
        <i class="fas fa-trash"></i> Xóa
      </button>
      <router-link :to="{ name: 'admin.thuonghieu' }" class="btn btn-secondary">
        <i class="fas fa-arrow-left"></i> Hủy
      </router-link>
    </div>
  </Form>
</template>
