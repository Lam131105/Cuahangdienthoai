<template>
  <div class="container my-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow-sm border-0 rounded-lg">
          <div class="card-header bg-primary text-white text-center py-3">
            <h4 class="mb-0 font-weight-bold">ĐĂNG KÝ TÀI KHOẢN</h4>
          </div>
          <div class="card-body p-4">
            <!-- Thông báo Lỗi -->
            <div
              v-if="errorMessage"
              class="alert alert-danger alert-dismissible fade show"
              role="alert"
            >
              <i class="fas fa-exclamation-triangle me-2"></i>
              {{ errorMessage }}
            </div>

            <!-- Thông báo Thành công -->
            <div
              v-if="successMessage"
              class="alert alert-success fade show"
              role="alert"
            >
              <i class="fas fa-check-circle me-2"></i> {{ successMessage }}
            </div>

            <Form
              @submit="handleRegister"
              :validation-schema="registerFormSchema"
            >
              <!-- Họ và Tên -->
              <div class="mb-3">
                <label class="form-label font-weight-bold"
                  >Họ và Tên <span class="text-danger">*</span></label
                >
                <Field
                  name="hoten"
                  type="text"
                  class="form-control"
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
                <ErrorMessage
                  name="hoten"
                  class="text-danger small mt-1 d-block"
                />
              </div>

              <!-- Email -->
              <div class="mb-3">
                <label class="form-label font-weight-bold"
                  >Địa chỉ Email <span class="text-danger">*</span></label
                >
                <Field
                  name="email"
                  type="email"
                  class="form-control"
                  placeholder="name@example.com"
                />
                <ErrorMessage
                  name="email"
                  class="text-danger small mt-1 d-block"
                />
              </div>

              <!-- Số điện thoại -->
              <div class="mb-3">
                <label class="form-label font-weight-bold"
                  >Số điện thoại <span class="text-danger">*</span></label
                >
                <Field
                  name="sodienthoai"
                  type="text"
                  class="form-control"
                  placeholder="0901234567"
                />
                <ErrorMessage
                  name="sodienthoai"
                  class="text-danger small mt-1 d-block"
                />
              </div>
              <!-- 👇 Ngày sinh (Tùy chọn) -->
              <div class="mb-3">
                <label class="form-label font-weight-bold">Ngày sinh</label>
                <Field name="ngaysinh" type="date" class="form-control" />
                <ErrorMessage
                  name="ngaysinh"
                  class="text-danger small mt-1 d-block"
                />
              </div>

              <!-- Mật khẩu -->
              <div class="mb-3">
                <label class="form-label font-weight-bold"
                  >Mật khẩu <span class="text-danger">*</span></label
                >
                <Field
                  name="matkhau"
                  type="password"
                  class="form-control"
                  placeholder="Tối thiểu 6 ký tự"
                />
                <ErrorMessage
                  name="matkhau"
                  class="text-danger small mt-1 d-block"
                />
              </div>

              <!-- Nhập lại Mật khẩu -->
              <div class="mb-3">
                <label class="form-label font-weight-bold"
                  >Xác nhận mật khẩu <span class="text-danger">*</span></label
                >
                <Field
                  name="nhaplaiMatkhau"
                  type="password"
                  class="form-control"
                  placeholder="Nhập lại mật khẩu ở trên"
                />
                <ErrorMessage
                  name="nhaplaiMatkhau"
                  class="text-danger small mt-1 d-block"
                />
              </div>

              <!-- Địa chỉ giao hàng (Tùy chọn) -->
              <div class="mb-3">
                <label class="form-label font-weight-bold"
                  >Địa chỉ giao hàng (Tùy chọn)</label
                >
                <Field
                  name="diachi"
                  as="textarea"
                  rows="2"
                  class="form-control"
                  placeholder="Số nhà, đường, phường/xã..."
                />
                <ErrorMessage
                  name="diachi"
                  class="text-danger small mt-1 d-block"
                />
              </div>

              <!-- Nút Đăng ký -->
              <div class="d-grid mt-4">
                <button
                  type="submit"
                  class="btn btn-primary btn-block py-2 fw-bold"
                  :disabled="isLoading"
                >
                  <span
                    v-if="isLoading"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  {{ isLoading ? "Đang xử lý..." : "ĐĂNG KÝ NGAY" }}
                </button>
              </div>
            </Form>
          </div>
          <div class="card-footer text-center py-3 bg-light">
            <span class="text-muted">Đã có tài khoản? </span>
            <router-link
              :to="{ name: 'dangnhap' }"
              class="text-primary font-weight-bold text-decoration-none"
            >
              Đăng nhập tại đây
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as yup from "yup";
import { Form, Field, ErrorMessage } from "vee-validate";
import KhachHangService from "@/services/khachhang.service";

export default {
  name: "RegisterView",
  components: { Form, Field, ErrorMessage },
  data() {
    const registerFormSchema = yup.object().shape({
      hoten: yup
        .string()
        .required("Họ và tên không được để trống.")
        .min(2, "Họ tên phải có ít nhất 2 ký tự."),
      email: yup
        .string()
        .required("Email không được để trống.")
        .email("Email không đúng định dạng."),
      sodienthoai: yup
        .string()
        .required("Số điện thoại không được để trống.")
        .matches(
          /^(0[3|5|7|8|9])+([0-9]{8})$/,
          "Số điện thoại không hợp lệ (10 số).",
        ),

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

      matkhau: yup
        .string()
        .required("Mật khẩu không được để trống.")
        .min(6, "Mật khẩu phải chứa ít nhất 6 ký tự."),
      nhaplaiMatkhau: yup
        .string()
        .required("Vui lòng xác nhận lại mật khẩu.")
        .oneOf([yup.ref("matkhau")], "Mật khẩu nhập lại không khớp."),
      diachi: yup.string().nullable(),
    });
    return {
      user: {
        hoten: "",
        email: "",
        sodienthoai: "",
        ngaysinh: "", // 👈 Thêm biến ngaysinh
        matkhau: "",
        nhaplaiMatkhau: "",
        diachi: "",
      },
      registerFormSchema,
      errorMessage: "",
      successMessage: "",
      isLoading: false,
    };
  },
  methods: {
    async handleRegister(values) {
      this.isLoading = true;
      this.errorMessage = "";
      this.successMessage = "";

      try {
        // Đẩy dữ liệu lên Backend (kèm ngaysinh)
        await KhachHangService.register({
          hoten: values.hoten,
          email: values.email,
          sodienthoai: values.sodienthoai,
          ngaysinh: values.ngaysinh || null, // 👈 Gửi ngaysinh (hoặc null nếu để trống)
          matkhau: values.matkhau,
          diachi: values.diachi || "",
        });

        this.successMessage =
          "Đăng ký tài khoản thành công! Đang chuyển hướng đến trang Đăng nhập...";

        setTimeout(() => {
          this.$router.push("/dangnhap");
        }, 2000);
      } catch (error) {
        console.error("Lỗi đăng ký:", error);
        this.errorMessage =
          error.response?.data?.message ||
          "Đã xảy ra lỗi trong quá trình đăng ký.";
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
