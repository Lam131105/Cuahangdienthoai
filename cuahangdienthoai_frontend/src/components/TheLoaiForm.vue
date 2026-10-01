<script>
import * as yup from "yup";
import { Form, Field, ErrorMessage } from "vee-validate";

export default {
  components: { Form, Field, ErrorMessage },
  props: {
    theLoai: { type: Object, required: true },
    isEdit: { type: Boolean, default: false },
  },
  emits: ["submit:theloai", "delete:theloai"],
  data() {
    const theLoaiFormSchema = yup.object().shape({
      tentheloai: yup
        .string()
        .required("Tên danh mục không được để trống.")
        .min(2, "Tối thiểu 2 ký tự."),
      mota: yup.string().max(500, "Mô tả tối đa 500 ký tự."),
    });

    return {
      theLoaiLocal: { ...this.theLoai },
      selectedFile: null,
      previewImage: null,
      theLoaiFormSchema,
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
    submitTheLoai() {
      // Chuyển dữ liệu sang FormData
      const formData = new FormData();
      formData.append("tentheloai", this.theLoaiLocal.tentheloai || "");
      formData.append("mota", this.theLoaiLocal.mota || "");

      // Nếu người dùng chọn file mới thì append file
      if (this.selectedFile) {
        formData.append("image", this.selectedFile);
      }

      this.$emit("submit:theloai", formData);
    },
    deleteTheLoai() {
      this.$emit("delete:theloai", this.theLoaiLocal.id);
    },
  },
};
</script>

<template>
  <Form @submit="submitTheLoai" :validation-schema="theLoaiFormSchema">
    <!-- Mã danh mục (Khi sửa) -->
    <div class="mb-3" v-if="isEdit">
      <label class="form-label font-weight-bold">Mã danh mục:</label>
      <input
        type="text"
        class="form-control bg-light"
        v-model="theLoaiLocal.id"
        readonly
      />
    </div>

    <!-- Tên danh mục -->
    <div class="mb-3">
      <label class="form-label font-weight-bold">
        Tên danh mục <span class="text-danger">*</span>
      </label>
      <Field
        name="tentheloai"
        type="text"
        class="form-control"
        v-model="theLoaiLocal.tentheloai"
      />
      <ErrorMessage name="tentheloai" class="text-danger small mt-1 d-block" />
    </div>

    <!-- Mô tả -->
    <div class="mb-3">
      <label class="form-label font-weight-bold">Mô Tả:</label>
      <Field
        name="mota"
        as="textarea"
        rows="3"
        class="form-control"
        v-model="theLoaiLocal.mota"
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
        @click="deleteTheLoai"
      >
        <i class="fas fa-trash"></i> Xóa
      </button>
      <router-link :to="{ name: 'admin.theloai' }" class="btn btn-secondary">
        <i class="fas fa-arrow-left"></i> Hủy
      </router-link>
    </div>
  </Form>
</template>
