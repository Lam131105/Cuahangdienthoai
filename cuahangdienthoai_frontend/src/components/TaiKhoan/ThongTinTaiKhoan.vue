<template>
  <div class="card shadow-sm border-0">
    <div
      class="card-header bg-white py-3 d-flex justify-content-between align-items-center"
    >
      <h5 class="mb-0 fw-bold text-primary">
        <i class="fas fa-user-edit me-2"></i>Thông Tin Chi Tiết
      </h5>
      <button
        v-if="!isEditing"
        @click="startEditing"
        class="btn btn-outline-primary btn-sm"
      >
        <i class="fas fa-pen me-1"></i>Chỉnh sửa
      </button>
    </div>

    <div class="card-body p-4">
      <!-- Thông báo thành công / thất bại -->
      <div
        v-if="successMessage"
        class="alert alert-success alert-dismissible fade show"
        role="alert"
      >
        <i class="fas fa-check-circle me-2"></i>{{ successMessage }}
      </div>
      <div
        v-if="errorMessage"
        class="alert alert-danger alert-dismissible fade show"
        role="alert"
      >
        <i class="fas fa-exclamation-circle me-2"></i>{{ errorMessage }}
      </div>

      <Form
        @submit="handleUpdateProfile"
        :validation-schema="profileFormSchema"
        :initial-values="user"
      >
        <!-- ================= KHU VỰC UPLOAD AVATAR ================= -->
        <div class="text-center mb-4">
          <div class="position-relative d-inline-block">
            <!-- Ảnh hiển thị: Ưu tiên ảnh preview tạm thời -> ảnh user -> ảnh mặc định -->
            <img
              :src="previewAvatarUrl || getAvatarUrl(user.duongdananh)"
              alt="Avatar"
              class="rounded-circle img-thumbnail shadow-sm avatar-preview"
              @error="onImageError"
            />

            <!-- Nút chọn ảnh (Chỉ xuất hiện khi đang ở chế độ Chỉnh sửa) -->
            <label
              v-if="isEditing"
              for="avatarInput"
              class="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 shadow upload-btn"
              title="Tải ảnh mới"
            >
              <i class="fas fa-camera"></i>
            </label>
            <input
              v-if="isEditing"
              id="avatarInput"
              type="file"
              accept="image/*"
              class="d-none"
              @change="onFileSelected"
            />
          </div>
          <p v-if="isEditing" class="text-muted small mt-2">
            Nhấp vào biểu tượng máy ảnh để thay đổi ảnh đại diện
          </p>
        </div>

        <!-- ================= CÁC TRƯỜNG THÔNG TIN ================= -->
        <!-- Họ và tên -->
        <div class="mb-3">
          <label class="form-label font-weight-bold">Họ và tên</label>
          <Field
            name="hoten"
            type="text"
            class="form-control"
            :readonly="!isEditing"
          />
          <ErrorMessage name="hoten" class="text-danger small mt-1 d-block" />
        </div>

        <!-- Email -->
        <div class="mb-3">
          <label class="form-label font-weight-bold"
            >Email (Không thể thay đổi)</label
          >
          <input
            type="email"
            class="form-control bg-light"
            :value="user.email"
            readonly
          />
        </div>

        <!-- Số điện thoại -->
        <div class="mb-3">
          <label class="form-label font-weight-bold">Số điện thoại</label>
          <Field
            name="sodienthoai"
            type="text"
            class="form-control"
            :readonly="!isEditing"
          />
          <ErrorMessage
            name="sodienthoai"
            class="text-danger small mt-1 d-block"
          />
        </div>

        <!-- Ngày sinh -->
        <div class="mb-3">
          <label class="form-label font-weight-bold">Ngày sinh</label>
          <Field
            name="ngaysinh"
            type="date"
            class="form-control"
            :readonly="!isEditing"
            :max="maxDateFor18"
          />
          <ErrorMessage
            name="ngaysinh"
            class="text-danger small mt-1 d-block"
          />
        </div>

        <!-- Nút thao tác -->
        <div v-if="isEditing" class="d-flex justify-content-end gap-2 mt-4">
          <button
            type="button"
            class="btn btn-secondary me-2"
            @click="cancelEditing"
          >
            Hủy
          </button>
          <button
            type="submit"
            class="btn btn-primary fw-bold"
            :disabled="isLoading"
          >
            <span
              v-if="isLoading"
              class="spinner-border spinner-border-sm me-1"
            ></span>
            Lưu thay đổi
          </button>
        </div>
      </Form>
    </div>
  </div>
</template>

<script>
import * as yup from "yup";
import { Form, Field, ErrorMessage } from "vee-validate";
import KhachHangService from "@/services/khachhang.service";
import NhanVienService from "@/services/nhanvien.service";

export default {
  name: "ProfileInfo",
  components: { Form, Field, ErrorMessage },
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  emits: ["update-user"],
  data() {
    const profileFormSchema = yup.object().shape({
      hoten: yup
        .string()
        .required("Họ và tên không được để trống.")
        .min(2, "Họ tên phải có ít nhất 2 ký tự."),
      sodienthoai: yup
        .string()
        .required("Số điện thoại không được để trống.")
        .matches(/^(0[3|5|7|8|9])+([0-9]{8})$/, "Số điện thoại không hợp lệ."),
      ngaysinh: yup
        .date()
        .nullable()
        .notRequired()
        .transform((curr, orig) => (orig === "" ? null : curr))
        .test("is-18", "Bạn phải đủ 18 tuổi", function (value) {
          if (!value) return true;
          const today = new Date();
          const birthDate = new Date(value);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }
          return age >= 18;
        }),
    });

    return {
      profileFormSchema,
      isEditing: false,
      isLoading: false,
      successMessage: "",
      errorMessage: "",
      selectedFile: null, // File ảnh được chọn từ máy tính
      previewAvatarUrl: null, // Link ảnh blob preview tạm thời
      defaultAvatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    };
  },
  computed: {
    maxDateFor18() {
      const today = new Date();
      today.setFullYear(today.getFullYear() - 18);
      return today.toISOString().split("T")[0];
    },
  },
  methods: {
    startEditing() {
      this.isEditing = true;
    },

    cancelEditing() {
      this.isEditing = false;
      this.selectedFile = null;
      this.previewAvatarUrl = null;
    },

    // Xử lý khi người dùng chọn 1 tệp ảnh từ máy
    onFileSelected(event) {
      const file = event.target.files[0];
      if (file) {
        if (!file.type.match("image.*")) {
          this.errorMessage = "Chỉ chấp nhận các tệp định dạng hình ảnh!";
          return;
        }
        this.selectedFile = file;
        // Tạo URL xem trước tạm thời
        this.previewAvatarUrl = URL.createObjectURL(file);
      }
    },

    async handleUpdateProfile(values) {
      this.isLoading = true;
      this.successMessage = "";
      this.errorMessage = "";

      try {
        // 1. Dùng FormData để gửi được cả Text và File
        const formData = new FormData();
        formData.append("hoten", values.hoten);
        formData.append("sodienthoai", values.sodienthoai);
        formData.append("ngaysinh", values.ngaysinh || "");

        if (this.selectedFile) {
          formData.append("image", this.selectedFile);
        }

        let response;

        // 2. Kiểm tra role của user đang đăng nhập
        if (this.user.role === "nhanvien") {
          // Nếu là Nhân viên -> Gọi Service Nhân viên
          response = await NhanVienService.update(this.user.id, formData);
        } else {
          // Mặc định hoặc Khách hàng -> Gọi Service Khách hàng
          response = await KhachHangService.update(this.user.id, formData);
        }

        // 3. Đảm bảo giữ lại thuộc tính role sau khi nhận response mới từ Backend
        const updatedUser = {
          ...(response.document || response),
          role: this.user.role || "khachhang",
        };

        // 4. Phát sự kiện cập nhật lại thông tin ở trang cha
        this.$emit("update-user", updatedUser);
        this.$emit("reload-user");

        this.successMessage = "Cập nhật thông tin cá nhân và ảnh thành công!";
        this.isEditing = false;
        this.selectedFile = null;
        this.previewAvatarUrl = null;
      } catch (error) {
        console.error("Lỗi cập nhật profile:", error);
        this.errorMessage =
          error.response?.data?.message || "Cập nhật thông tin thất bại!";
      } finally {
        this.isLoading = false;
      }
    },

    getAvatarUrl(fileName) {
      if (!fileName) return this.defaultAvatar;
      if (fileName.startsWith("http")) return fileName;
      return `http://localhost:5000${fileName}`;
    },

    onImageError(event) {
      event.target.src = this.defaultAvatar;
    },
  },
};
</script>

<style scoped>
.avatar-preview {
  width: 120px;
  height: 120px;
  object-fit: cover;
}

.upload-btn {
  cursor: pointer;
  transition: transform 0.2s ease;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-btn:hover {
  transform: scale(1.1);
}
</style>
