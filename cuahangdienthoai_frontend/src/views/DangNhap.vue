<template>
  <div class="container my-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow-lg border-0 rounded-4 overflow-hidden">
          <!-- Header -->
          <div class="card-header bg-primary text-white text-center py-3">
            <h4 class="mb-0 fw-bold tracking-wide">ĐĂNG NHẬP</h4>
          </div>

          <div class="card-body p-4 p-sm-5">
            <!-- Thông báo lỗi đăng nhập -->
            <div
              v-if="errorMessage"
              class="alert alert-danger alert-dismissible fade show rounded-3 mb-4"
              role="alert"
            >
              <i class="fas fa-exclamation-circle me-2"></i> {{ errorMessage }}
            </div>

            <!-- Form Đăng nhập thường -->
            <Form @submit="handleLogin" :validation-schema="loginFormSchema">
              <!-- Email -->
              <div class="mb-3">
                <label class="form-label fw-semibold text-secondary"
                  >Email <span class="text-danger">*</span></label
                >
                <div class="input-group">
                  <span
                    class="input-group-text bg-light text-muted border-end-0"
                  >
                    <i class="fas fa-envelope"></i>
                  </span>
                  <Field
                    name="email"
                    type="email"
                    class="form-control border-start-0 ps-0"
                    placeholder="nhapemail@example.com"
                  />
                </div>
                <ErrorMessage
                  name="email"
                  class="text-danger small mt-1 d-block"
                />
              </div>

              <!-- Mật khẩu -->
              <div class="mb-3">
                <label class="form-label fw-semibold text-secondary"
                  >Mật khẩu <span class="text-danger">*</span></label
                >
                <div class="input-group">
                  <span
                    class="input-group-text bg-light text-muted border-end-0"
                  >
                    <i class="fas fa-lock"></i>
                  </span>
                  <Field
                    name="matkhau"
                    type="password"
                    class="form-control border-start-0 ps-0"
                    placeholder="Nhập mật khẩu"
                  />
                </div>
                <ErrorMessage
                  name="matkhau"
                  class="text-danger small mt-1 d-block"
                />
              </div>

              <!-- Nút Đăng nhập -->
              <div class="d-grid mt-4">
                <button
                  type="submit"
                  class="btn btn-primary py-2-5 fw-bold btn-login shadow-sm"
                  :disabled="isLoading"
                >
                  <span
                    v-if="isLoading"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  {{ isLoading ? "Đang xử lý..." : "ĐĂNG NHẬP" }}
                </button>
              </div>
            </Form>

            <!-- 🟢 Đường phân cách (Divider) -->
            <div class="divider my-4">
              <span>HOẶC ĐĂNG NHẬP BẰNG</span>
            </div>

            <!-- 🟢 Khối nút Social Login (Google & Facebook) -->
            <div class="social-login-container d-flex flex-column gap-3">
              <!-- Nút Google (Khung chứa Google SDK Render) -->
              <div id="google-btn" class="google-btn-wrapper"></div>

              <!-- Nút Facebook chuẩn thiết kế -->
              <button
                type="button"
                class="btn-social btn-facebook shadow-sm"
                @click="loginWithFacebook"
              >
                <div class="icon-wrapper">
                  <i class="fab fa-facebook-f"></i>
                </div>
                <span class="btn-text">Đăng nhập bằng Facebook</span>
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div class="card-footer text-center py-3 bg-light border-0">
            <span class="text-muted">Chưa có tài khoản? </span>
            <router-link
              :to="{ name: 'dangki' }"
              class="text-primary fw-bold text-decoration-none hover-underline"
            >
              Đăng ký ngay
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
import NhanVienService from "@/services/nhanvien.service";

export default {
  name: "LoginView",
  components: { Form, Field, ErrorMessage },
  mounted() {
    this.initGoogleLogin();
    this.initFacebookLogin();
  },
  data() {
    // Validation schema cho Form Đăng nhập
    const loginFormSchema = yup.object().shape({
      email: yup
        .string()
        .required("Vui lòng nhập Email.")
        .email("Email không hợp lệ."),
      matkhau: yup.string().required("Vui lòng nhập Mật khẩu."),
    });

    return {
      loginFormSchema,
      errorMessage: "",
      isLoading: false,
    };
  },
  methods: {
    async handleLogin(values) {
      this.isLoading = true;
      this.errorMessage = "";

      const credentials = {
        email: values.email,
        matkhau: values.matkhau,
      };

      try {
        // 1. Thử đăng nhập Khách hàng trước
        try {
          const responseKhachHang = await KhachHangService.login(credentials);

          if (responseKhachHang.user) {
            // Lưu user + đánh dấu role
            const userData = { ...responseKhachHang.user, role: "khachhang" };
            localStorage.setItem("user", JSON.stringify(userData));

            // Chuyển hướng về Trang chủ Khách hàng
            return this.$router.push("/");
          }
        } catch (errKhachHang) {
          // Nếu lỗi 401/404 (Không phải khách hàng), tiếp tục cho chạy xuống thử Nhân viên
          // Nếu lỗi khác (VD: Tài khoản bị khóa 403), ném lỗi ra ngoài luôn
          if (
            errKhachHang.response?.status !== 401 &&
            errKhachHang.response?.status !== 404
          ) {
            throw errKhachHang;
          }
        }

        // 2. Nếu không phải Khách hàng -> Thử đăng nhập Nhân viên
        const responseNhanVien = await NhanVienService.login(credentials);

        if (responseNhanVien.user) {
          // Lưu user + đánh dấu role
          const userData = { ...responseNhanVien.user, role: "nhanvien" };
          localStorage.setItem("user", JSON.stringify(userData));

          // Chuyển hướng về Trang Quản trị (Admin/Dashboard)
          return this.$router.push("/admin/thuonghieu");
        }
      } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        this.errorMessage =
          error.response?.data?.message ||
          "Email hoặc mật khẩu không chính xác!";
      } finally {
        this.isLoading = false;
      }
    },

    initGoogleLogin() {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id:
            "123250462571-d7bggil4n0be4kpp5pkgcor11mssntgc.apps.googleusercontent.com", // Đảm bảo đúng 100%
          callback: this.handleGoogleCallback,
          auto_select: false,
          ux_mode: "popup",
        });

        // Render nút đăng nhập chuẩn của Google vào div#google-btn
        window.google.accounts.id.renderButton(
          document.getElementById("google-btn"),
          {
            theme: "outline",
            size: "large",
            text: "signin_with",
          },
        );
      }
    },

    // Hàm nhận kết quả sau khi người dùng đăng nhập Google thành công
    async handleGoogleCallback(response) {
      try {
        const googleToken = response.credential;

        const res = await KhachHangService.loginWithGoogle({
          token: googleToken,
        });

        // Lấy object user linh hoạt (dù backend trả về { user } hay { data })
        const rawUser = res?.user;
        // Bổ sung role "khachhang" đồng nhất với đăng nhập thường
        const userData = { ...rawUser, role: "khachhang" };

        // Lưu vào localStorage và cập nhật state
        localStorage.setItem("user", JSON.stringify(userData));
        this.currentUser = userData;

        this.$router.push("/");
      } catch (error) {
        console.error("Lỗi đăng nhập Google:", error);
        alert(
          error.response?.data?.message || "Đăng nhập bằng Google thất bại!",
        );
      }
    },

    initFacebookLogin() {
      // 1. Khai báo hàm callback chạy sau khi SDK tải xong
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: "1487746406528992", // Thay App ID của bạn vào đây
          cookie: true,
          xfbml: true,
          version: "v19.0", // Dùng v19.0
        });
        console.log("Facebook SDK đã khởi tạo thành công!");
      };

      // 2. Tải Facebook SDK dynamically (nếu chưa có trong DOM)
      (function (d, s, id) {
        var js,
          fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        js.src = "https://connect.facebook.net/vi_VN/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      })(document, "script", "facebook-jssdk");
    },

    // --- HÀM BẤM NÚT ĐĂNG NHẬP FACEBOOK ---
    loginWithFacebook() {
      if (!window.FB) {
        alert("Facebook SDK chưa tải xong, vui lòng thử lại!");
        return;
      }

      // Mở Pop-up đăng nhập Facebook
      window.FB.login(
        (response) => {
          if (response.authResponse) {
            // Lấy accessToken từ Facebook
            const facebookToken = response.authResponse.accessToken;
            // Gửi Token lên Backend xác thực
            this.handleFacebookCallback(facebookToken);
          } else {
            console.log("Người dùng đã hủy đăng nhập Facebook.");
          }
        },
        { scope: "public_profile" }, // Xin quyền lấy thông tin cơ bản & email
      );
    },

    // --- XỬ LÝ KẾT QUẢ GỬI VỀ BACKEND ---
    async handleFacebookCallback(facebookToken) {
      try {
        const res = await KhachHangService.loginWithFacebook({
          token: facebookToken,
        });

        // 1. Kiểm tra chính xác đối tượng user từ Backend trả về
        const userFromBackend = res?.user;

        // 2. Kiểm tra an toàn: Bắt buộc phải có object user và có id
        if (!userFromBackend || !userFromBackend.id) {
          console.error(
            "Dữ liệu trả về từ backend thiếu thông tin user:",
            res.data,
          );
          throw new Error("Không lấy được thông tin tài khoản từ hệ thống!");
        }

        // 3. Chuẩn hóa phẳng dữ liệu lưu trữ
        const userData = {
          ...userFromBackend,
          role: "khachhang",
        };

        // 4. Lưu vào localStorage và cập nhật Vue state
        localStorage.setItem("user", JSON.stringify(userData));
        this.currentUser = userData;

        this.$router.push("/");
      } catch (error) {
        console.error("Lỗi đăng nhập Facebook:", error);
        alert(
          error.response?.data?.message ||
            error.message ||
            "Đăng nhập bằng Facebook thất bại!",
        );
      }
    },
  },
};
</script>

<style scoped>
/* Tùy chỉnh bo tròn Card */
.rounded-4 {
  border-radius: 1rem !important;
}

.tracking-wide {
  letter-spacing: 1px;
}

.py-2-5 {
  padding-top: 0.65rem;
  padding-bottom: 0.65rem;
}

/* --- ĐƯỜNG PHÂN CÁCH (DIVIDER) --- */
.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #8c98a4;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid #e7eaf3;
}

.divider:not(:empty)::before {
  margin-right: 1em;
}

.divider:not(:empty)::after {
  margin-left: 1em;
}

/* --- KHỐI SOCIAL LOGIN --- */
.social-login-container {
  width: 100%;
}

/* Đảm bảo nút Google của SDK mở rộng full width khớp với nút FB */
.google-btn-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

.google-btn-wrapper > div {
  width: 100% !important;
}

/* Nút Facebook Custom */
.btn-social {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 40px; /* Chiều cao khớp với chuẩn nút Google Large */
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
}

.btn-facebook {
  background-color: #1877f2;
  color: #ffffff;
}

.btn-facebook:hover {
  background-color: #166fe5;
  box-shadow: 0 4px 12px rgba(24, 119, 242, 0.3);
}

.btn-facebook .icon-wrapper {
  margin-right: 12px;
  font-size: 16px;
  display: flex;
  align-items: center;
}

.btn-facebook .btn-text {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
    sans-serif;
}

.hover-underline:hover {
  text-decoration: underline !important;
}
</style>
