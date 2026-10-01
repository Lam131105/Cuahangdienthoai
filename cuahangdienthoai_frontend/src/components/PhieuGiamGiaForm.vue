<script>
import * as yup from "yup";
import { Form, Field, ErrorMessage } from "vee-validate";

export default {
  components: { Form, Field, ErrorMessage },
  props: {
    phieuGiamGia: { type: Object, required: true },
    isEdit: { type: Boolean, default: false },
  },
  emits: ["submit:phieugiamgia", "delete:phieugiamgia"],
  data() {
    const phieuGiamGiaFormSchema = yup.object().shape({
      tenphieu: yup
        .string()
        .required("Tên phiếu giảm giá không được để trống.")
        .max(30, "Mã tối đa 30 ký tự."),
      giatrigiam: yup
        .number()
        .transform((value, originalValue) =>
          originalValue === "" ? null : value,
        )
        .required("Giá trị giảm không được để trống.")
        .min(0, "Giá trị giảm phải lớn hơn hoặc bằng 0."),
      // dongiatoithieu: yup
      //   .number()
      //   .transform((value, originalValue) => (originalValue === "" ? null : value))
      //   .required("Đơn giá tối thiểu không được để trống.")
      //   .min(0, "Đơn giá tối thiểu phải lớn hơn hoặc bằng 0."),
      giamtoida: yup
        .number()
        .transform((value, originalValue) =>
          originalValue === "" ? null : value,
        )
        .nullable()
        .min(0, "Giảm tối đa phải lớn hơn hoặc bằng 0."),
      thoihan: yup
        .number()
        .transform((value, originalValue) =>
          originalValue === "" ? null : value,
        )
        .required("Thời hạn sử dụng không được để trống.")
        .integer("Thời hạn phải là số nguyên (ngày).")
        .min(1, "Thời hạn tối thiểu 1 ngày."),
      loaigiamgia: yup
        .string()
        .required("Vui lòng chọn hoặc nhập loại giảm giá.")
        .max(128, "Tối đa 128 ký tự."),
    });

    return {
      phieuGiamGiaLocal: { ...this.phieuGiamGia },
      selectedFile: null,
      previewImage: null,
      phieuGiamGiaFormSchema,
    };
  },
  watch: {
    phieuGiamGia: {
      deep: true,
      handler(val) {
        this.phieuGiamGiaLocal = { ...val };
      },
    },
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
    submitPhieuGiamGia() {
      // Chuyển dữ liệu sang FormData để gửi API (hỗ trợ multipart/form-data)
      const formData = new FormData();
      formData.append("tenphieu", this.phieuGiamGiaLocal.tenphieu || "");
      formData.append("giatrigiam", this.phieuGiamGiaLocal.giatrigiam ?? 0);
      formData.append(
        "dongiatoithieu",
        this.phieuGiamGiaLocal.dongiatoithieu ?? 0,
      );

      if (
        this.phieuGiamGiaLocal.giamtoida !== null &&
        this.phieuGiamGiaLocal.giamtoida !== undefined
      ) {
        formData.append("giamtoida", this.phieuGiamGiaLocal.giamtoida);
      }

      formData.append("thoihan", this.phieuGiamGiaLocal.thoihan ?? 1);
      formData.append("loaigiamgia", this.phieuGiamGiaLocal.loaigiamgia || "");

      // Nếu người dùng chọn file ảnh mới
      if (this.selectedFile) {
        formData.append("image", this.selectedFile);
      }

      this.$emit("submit:phieugiamgia", formData);
    },
    deletePhieuGiamGia() {
      this.$emit("delete:phieugiamgia", this.phieuGiamGiaLocal.id);
    },
  },
};
</script>

<template>
  <Form
    @submit="submitPhieuGiamGia"
    :validation-schema="phieuGiamGiaFormSchema"
  >
    <!-- Tên phiếu giảm giá -->
    <div class="mb-3">
      <label class="form-label font-weight-bold">
        Tên Phiếu Giảm Giá <span class="text-danger">*</span>
      </label>
      <Field
        name="tenphieu"
        type="text"
        class="form-control"
        v-model="phieuGiamGiaLocal.tenphieu"
        placeholder="VD: Giảm 50k đơn từ 200k"
      />
      <ErrorMessage name="tenphieu" class="text-danger small mt-1 d-block" />
    </div>

    <!-- Loại giảm giá & Giá trị giảm -->
    <div class="row mb-3">
      <div class="col-md-6">
        <label class="form-label font-weight-bold">
          Loại Giảm Giá <span class="text-danger">*</span>
        </label>
        <Field
          name="loaigiamgia"
          as="select"
          class="form-select"
          v-model="phieuGiamGiaLocal.loaigiamgia"
        >
          <option value="">-- Chọn loại giảm giá --</option>
          <option value="Phần trăm">Giảm theo phần trăm (%)</option>
          <option value="Tiền cố định">Giảm tiền cố định (VNĐ)</option>
        </Field>
        <ErrorMessage
          name="loaigiamgia"
          class="text-danger small mt-1 d-block"
        />
      </div>

      <div class="col-md-6">
        <label class="form-label font-weight-bold">
          Giá Trị Giảm (đơn vị
          <span>
            {{
              phieuGiamGiaLocal.loaigiamgia === "Phần trăm" ? "%" : "VNĐ"
            }} </span
          >) <span class="text-danger">*</span>
        </label>
        <Field
          name="giatrigiam"
          type="number"
          step="0.01"
          class="form-control"
          v-model="phieuGiamGiaLocal.giatrigiam"
          placeholder="Nhập % hoặc số tiền"
        />

        <ErrorMessage
          name="giatrigiam"
          class="text-danger small mt-1 d-block"
        />
      </div>
    </div>

    <!-- Đơn giá tối thiểu & Giảm tối đa -->
    <div class="row mb-3">
      <div class="col-md-6">
        <label class="form-label font-weight-bold">
          Đơn Giá Tối Thiểu <span class="text-danger">*</span>
        </label>
        <Field
          name="dongiatoithieu"
          type="number"
          step="0.01"
          class="form-control"
          v-model="phieuGiamGiaLocal.dongiatoithieu"
          placeholder="Điều kiện áp dụng (VNĐ)"
        />
        <ErrorMessage
          name="dongiatoithieu"
          class="text-danger small mt-1 d-block"
        />
      </div>

      <div class="col-md-6">
        <label class="form-label font-weight-bold">Giảm Tối Đa (VNĐ):</label>
        <Field
          name="giamtoida"
          type="number"
          step="0.01"
          class="form-control"
          v-model="phieuGiamGiaLocal.giamtoida"
          placeholder="Bỏ trống nếu không giới hạn"
        />
        <ErrorMessage name="giamtoida" class="text-danger small mt-1 d-block" />
      </div>
    </div>

    <!-- Thời hạn (số ngày) -->
    <div class="mb-3">
      <label class="form-label font-weight-bold">
        Thời Hạn Sử Dụng (Số ngày) <span class="text-danger">*</span>
      </label>
      <Field
        name="thoihan"
        type="number"
        class="form-control"
        v-model="phieuGiamGiaLocal.thoihan"
        placeholder="VD: 30 (có hiệu lực 30 ngày)"
      />
      <ErrorMessage name="thoihan" class="text-danger small mt-1 d-block" />
    </div>

    <!-- Chọn File Ảnh Upload (duongdananh) -->
    <div class="mb-3">
      <label class="form-label font-weight-bold">
        Ảnh Banner/Icon Voucher {{ isEdit ? "(Bỏ qua nếu không đổi)" : "" }}
      </label>
      <input
        type="file"
        class="form-control"
        accept="image/*"
        @change="onFileChange"
      />

      <!-- Khung xem trước ảnh -->
      <div class="mt-2" v-if="previewImage || phieuGiamGiaLocal.duongdananh">
        <p class="small text-muted mb-1">Xem trước hình ảnh:</p>
        <img
          :src="
            previewImage ||
            `http://localhost:5000${phieuGiamGiaLocal.duongdananh}`
          "
          alt="Voucher Preview"
          class="img-thumbnail"
          style="max-height: 120px; object-fit: contain"
        />
      </div>
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
        @click="deletePhieuGiamGia"
      >
        <i class="fas fa-trash"></i> Xóa
      </button>
      <router-link
        :to="{ name: 'admin.phieugiamgia' }"
        class="btn btn-secondary"
      >
        <i class="fas fa-arrow-left"></i> Hủy
      </router-link>
    </div>
  </Form>
</template>
