<template>
  <Form
    :validation-schema="schema"
    :initial-values="formData"
    @submit="handleSubmit"
  >
    <!-- Mã Phiếu Nhập (Chỉ hiển thị khi Sửa) -->
    <div v-if="isEdit" class="mb-3">
      <label class="form-label fw-semibold">Mã phiếu nhập</label>
      <input type="text" class="form-control" :value="formData.id" disabled />
    </div>

    <!-- Chọn Nhà Cung Cấp -->
    <div class="mb-3">
      <label class="form-label fw-semibold"
        >Nhà cung cấp <span class="text-danger">*</span></label
      >
      <Field name="manhacungcap" as="select" class="form-select">
        <option value="">-- Chọn nhà cung cấp --</option>
        <option v-for="ncc in dsNhaCungCap" :key="ncc.id" :value="ncc.id">
          {{ ncc.tenncc }} ({{ ncc.id }})
        </option>
      </Field>
      <ErrorMessage name="manhacungcap" class="text-danger small mt-1" />
    </div>

    <!-- Nhân viên phụ trách (Tự động lấy người đăng nhập) -->
    <div class="mb-3">
      <label class="form-label fw-semibold">Nhân viên lập phiếu</label>
      <input
        type="text"
        class="form-control"
        :value="
          currentUser
            ? `${currentUser.hoten} (${currentUser.id})`
            : 'Chưa xác định'
        "
        disabled
      />
      <small class="text-muted"
        >Mã NV sẽ tự động ghi nhận theo tài khoản đang đăng nhập.</small
      >
    </div>

    <!-- Ngày nhập kho -->
    <div class="mb-3">
      <label class="form-label fw-semibold"
        >Ngày nhập kho <span class="text-danger">*</span></label
      >
      <Field name="ngaynhap" type="datetime-local" class="form-control" />
      <ErrorMessage name="ngaynhap" class="text-danger small mt-1" />
    </div>

    <!-- Tổng tiền (Chỉ đọc nếu sửa, hoặc nhập nếu tạo) -->
    <div class="mb-3">
      <label class="form-label fw-semibold">Tổng tiền (VNĐ)</label>
      <Field
        name="tongtien"
        type="number"
        class="form-control"
        :disabled="isEdit"
      />
      <ErrorMessage name="tongtien" class="text-danger small mt-1" />
    </div>

    <!-- Nút thao tác -->
    <div class="d-flex gap-2 justify-content-end mt-4">
      <button
        type="button"
        class="btn btn-secondary"
        @click="$router.push({ name: 'phieunhap' })"
      >
        <i class="fas fa-arrow-left me-1"></i> Hủy / Quay lại
      </button>
      <button type="submit" class="btn btn-primary" :disabled="submitting">
        <i
          class="fas"
          :class="submitting ? 'fa-spinner fa-spin' : 'fa-save'"
        ></i>
        {{ isEdit ? " Cập nhật Phiếu Nhập" : " Tạo Phiếu Nhập" }}
      </button>
    </div>
  </Form>
</template>

<script>
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";

export default {
  name: "PhieuNhapForm",
  components: { Form, Field, ErrorMessage },
  props: {
    phieuNhapData: {
      type: Object,
      default: () => ({}),
    },
    dsNhaCungCap: {
      type: Array,
      default: () => [],
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    submitting: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["submit-phieunhap"],
  data() {
    return {
      currentUser: null,
      schema: yup.object().shape({
        manhacungcap: yup.string().required("Vui lòng chọn nhà cung cấp."),
        ngaynhap: yup.string().required("Vui lòng chọn ngày nhập kho."),
        tongtien: yup
          .number()
          .typeError("Tổng tiền phải là số")
          .min(0, "Mức tiền không hợp lệ"),
      }),
    };
  },
  computed: {
    formData() {
      // Định dạng Ngày về dạng YYYY-MM-DDTHH:mm cho datetime-local
      //   let dateVal = new Date().toISOString().slice(0, 16);
      //   if (this.phieuNhapData && this.phieuNhapData.ngaynhap) {
      //     dateVal = new Date(this.phieuNhapData.ngaynhap)
      //       .toISOString()
      //       .slice(0, 16);
      //   }

      return {
        id: this.phieuNhapData.id || "",
        manhacungcap: this.phieuNhapData.manhacungcap || "",
        ngaynhap: this.formatToLocalDatetime(
          this.phieuNhapData && this.phieuNhapData.ngaynhap,
        ),
        tongtien:
          this.phieuNhapData.tongtien !== undefined
            ? this.phieuNhapData.tongtien
            : 0,
      };
    },
  },
  created() {
    this.getCurrentUser();
  },
  methods: {
    formatToLocalDatetime(dateInput) {
      const d = dateInput ? new Date(dateInput) : new Date();
      // Bù trừ chênh lệch múi giờ của máy tính người dùng
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localISOTime = new Date(d.getTime() - tzOffset)
        .toISOString()
        .slice(0, 16);
      return localISOTime;
    },
    getCurrentUser() {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          this.currentUser = null;
          return null;
        }
        const parsedUser = JSON.parse(userStr);
        this.currentUser = {
          ...parsedUser,
          role: parsedUser.role || "khachhang",
        };
        return this.currentUser;
      } catch (e) {
        console.error("Lỗi trích xuất thông tin người dùng:", e);
        this.currentUser = null;
        localStorage.removeItem("user");
        return null;
      }
    },
    handleSubmit(values) {
      if (!this.currentUser || !this.currentUser.id) {
        alert("Không tìm thấy thông tin Nhân viên đang đăng nhập!");
        return;
      }

      // Đóng gói payload gửi ra ngoài
      const payload = {
        ...values,
        manhanvien: this.currentUser.id,
      };

      this.$emit("submit-phieunhap", payload);
    },
  },
};
</script>
