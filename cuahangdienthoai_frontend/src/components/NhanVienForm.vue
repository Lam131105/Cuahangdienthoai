<template>
  <Form @submit="submitNhanVien" :validation-schema="nhanVienFormSchema">
    <div class="row g-3">
      <!-- Họ và tên -->
      <div class="col-md-6">
        <label for="hoten" class="form-label fw-bold">
          Họ và tên <span class="text-danger">*</span>
        </label>
        <Field
          name="hoten"
          type="text"
          class="form-control"
          id="hoten"
          v-model="nhanVienLocal.hoten"
          placeholder="Nhập họ và tên..."
        />
        <ErrorMessage name="hoten" class="text-danger small mt-1 d-block" />
      </div>

      <!-- Email -->
      <div class="col-md-6">
        <label for="email" class="form-label fw-bold">
          Email <span class="text-danger">*</span>
        </label>
        <Field
          name="email"
          type="email"
          class="form-control"
          id="email"
          v-model="nhanVienLocal.email"
          placeholder="example@domain.com"
        />
        <ErrorMessage name="email" class="text-danger small mt-1 d-block" />
      </div>

      <!-- Mật khẩu (Bắt buộc khi Thêm, Tùy chọn khi Sửa) -->
      <div class="col-md-6" v-if="!isEdit">
        <label for="matkhau" class="form-label fw-bold">
          Mật khẩu <span class="text-danger">*</span>
        </label>
        <Field
          name="matkhau"
          type="password"
          class="form-control"
          id="matkhau"
          v-model="nhanVienLocal.matkhau"
          placeholder="Nhập mật khẩu..."
        />
        <ErrorMessage name="matkhau" class="text-danger small mt-1 d-block" />
      </div>

      <!-- Số điện thoại -->
      <div class="col-md-6">
        <label for="sodienthoai" class="form-label fw-bold">
          Số điện thoại <span class="text-danger">*</span>
        </label>
        <Field
          name="sodienthoai"
          type="text"
          class="form-control"
          id="sodienthoai"
          v-model="nhanVienLocal.sodienthoai"
          placeholder="VD: 0912345678"
        />
        <ErrorMessage
          name="sodienthoai"
          class="text-danger small mt-1 d-block"
        />
      </div>

      <!-- Ngày sinh -->
      <div class="col-md-6">
        <label for="ngaysinh" class="form-label fw-bold">Ngày sinh</label>
        <input
          type="date"
          class="form-control"
          id="ngaysinh"
          v-model="formattedNgaySinh"
        />
      </div>

      <!-- Mã Vai trò -->
      <div class="col-md-6">
        <label for="vaitroid" class="form-label fw-bold">
          Vai trò <span class="text-danger">*</span>
        </label>
        <Field
          name="vaitroid"
          as="select"
          class="form-select"
          id="vaitroid"
          v-model="nhanVienLocal.vaitroid"
        >
          <option value="" disabled>-- Chọn vai trò --</option>
          <option v-for="vt in dsVaiTro" :key="vt.id" :value="vt.id">
            {{ vt.tenvaitro }}
          </option>
        </Field>
        <ErrorMessage name="vaitroid" class="text-danger small mt-1 d-block" />
      </div>

      <!-- Trạng thái -->
      <div class="col-md-6">
        <label for="trangthai" class="form-label fw-bold">Trạng thái</label>
        <select
          class="form-select"
          id="trangthai"
          v-model="nhanVienLocal.trangthai"
          readonly
        >
          <option value="Hoạt động">Hoạt động</option>
          <option value="Khóa">Khóa</option>
        </select>
      </div>
    </div>

    <!-- Nút Thao Tác -->
    <div class="d-flex gap-2 justify-content-end mt-4">
      <button type="button" class="btn btn-secondary" @click="cancel">
        <i class="bi bi-x-circle me-1"></i> Hủy
      </button>
      <button
        type="submit"
        class="btn btn-primary fw-semibold"
        :disabled="isLoading"
      >
        <span
          v-if="isLoading"
          class="spinner-border spinner-border-sm me-1"
          role="status"
        ></span>
        <i v-else class="bi bi-check-circle me-1"></i>
        Lưu Nhân Viên
      </button>
    </div>
  </Form>
</template>

<script>
import * as yup from "yup";
import { Form, Field, ErrorMessage } from "vee-validate";
import VaiTroService from "@/services/vaitro.service";

export default {
  name: "NhanVienForm",
  components: {
    Form,
    Field,
    ErrorMessage,
  },
  props: {
    nhanVien: {
      type: Object,
      default: () => ({
        hoten: "",
        email: "",
        matkhau: "",
        sodienthoai: "",
        ngaysinh: "",
        vaitroid: "",
        trangthai: "Hoạt động",
        duongdananh: "",
      }),
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["submit:nhanVien", "cancel"],
  data() {
    // Định nghĩa Schema Validation
    const schemaShape = {
      hoten: yup.string().required("Họ tên không được để trống."),
      sodienthoai: yup
        .string()
        .required("Số điện thoại không được để trống.")
        .matches(/^[0-9]{10,11}$/, "Số điện thoại phải từ 10-11 chữ số."),
      vaitroid: yup.string().required("Vui lòng chọn vai trò cho nhân viên."),
      // 👇 KIỂM TRA ĐỦ 18 TUỔI (Không bắt buộc nhập, nhưng nếu nhập phải đủ 18 tuổi)
      ngaysinh: yup
        .date()
        .nullable()
        .notRequired()
        .transform((curr, orig) => (orig === "" ? null : curr)) // Xử lý nếu bấm xóa ngày
        .test(
          "is-18",
          "Bạn phải đủ 18 tuổi mới được đăng ký tài khoản",
          function (value) {
            if (!value) return true; // Nếu bỏ trống thì bỏ qua kiểm tra (vì không bắt buộc)

            const today = new Date();
            const birthDate = new Date(value);

            // Tính số tuổi
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            // Nếu chưa đến tháng sinh hoặc chưa đến ngày sinh trong tháng đó thì trừ đi 1 tuổi
            if (
              monthDiff < 0 ||
              (monthDiff === 0 && today.getDate() < birthDate.getDate())
            ) {
              age--;
            }

            return age >= 18; // Trả về true nếu tuổi >= 18
          },
        ),
    };

    // Khi Tạo mới thì bắt buộc có Mật khẩu
    if (!this.isEdit) {
      schemaShape.matkhau = yup
        .string()
        .required("Mật khẩu không được để trống.")
        .min(6, "Mật khẩu tối thiểu 6 ký tự.");
    }

    return {
      nhanVienLocal: { ...this.nhanVien },
      nhanVienFormSchema: yup.object().shape(schemaShape),
      dsVaiTro: [],
    };
  },
  computed: {
    // Chuyển đổi định dạng Date cho ô input[type="date"]
    formattedNgaySinh: {
      get() {
        if (!this.nhanVienLocal.ngaysinh) return "";
        const date = new Date(this.nhanVienLocal.ngaysinh);
        return date.toISOString().split("T")[0];
      },
      set(val) {
        this.nhanVienLocal.ngaysinh = val;
      },
    },
  },
  watch: {
    nhanVien: {
      handler(newVal) {
        this.nhanVienLocal = { ...newVal };
      },
      deep: true,
    },
  },
  methods: {
    async fetchDSVaiTro() {
      try {
        this.dsVaiTro = await VaiTroService.getAll();
      } catch (error) {
        console.error("Lỗi lấy danh sách vai trò:", error);
      }
    },
    submitNhanVien() {
      this.$emit("submit:nhanVien", {
        data: this.nhanVienLocal,
      });
    },
    cancel() {
      this.$emit("cancel");
    },
  },
  created() {
    this.fetchDSVaiTro(); // 🟢 Tự động tải danh sách vai trò ngay khi mở Form
  },
};
</script>
