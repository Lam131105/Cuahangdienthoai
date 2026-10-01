<template>
  <div class="diachi-add-container">
    <div class="card shadow-sm border-0 p-4">
      <h4 class="mb-4 text-primary fw-bold">Thêm Địa Chỉ Mới</h4>

      <form @submit.prevent="handleSubmit">
        <!-- Gọi Component AddressSelector -->
        <AddressSelector @update:address="handleAddressUpdate" />

        <!-- Lựa chọn Đặt làm địa chỉ mặc định -->

        <!-- Thông báo lỗi (nếu có) -->
        <div v-if="errorMessage" class="alert alert-danger p-2 mb-3">
          {{ errorMessage }}
        </div>

        <!-- Các nút hành động -->
        <div class="d-flex justify-content-end gap-2">
          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="cancel"
            :disabled="isSubmitting"
          >
            Hủy
          </button>
          <button
            type="submit"
            class="btn btn-primary px-4"
            :disabled="isSubmitting"
          >
            <span
              v-if="isSubmitting"
              class="spinner-border spinner-border-sm me-1"
            ></span>
            Lưu Địa Chỉ
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import AddressSelector from "@/components/AddressSelector.vue"; // Điều chỉnh đường dẫn tới AddressSelector cho phù hợp

import DiaChiService from "@/services/diachi.service";

export default {
  name: "DiaChiAdd",
  components: {
    AddressSelector,
  },
  data() {
    return {
      currentUser: null,
      addressData: {},
      isSubmitting: false,
      errorMessage: "",
    };
  },
  mounted() {
    this.getCurrentUser();
  },
  methods: {
    // 🟢 Hàm lấy thông tin người dùng từ localStorage
    getCurrentUser() {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          this.currentUser = null;
          return null;
        }

        const parsedUser = JSON.parse(userStr);

        // Xử lý bọc lót (fallback): Nếu dữ liệu cũ lỡ bị bọc trong dạng { user: {...} }
        const userData = parsedUser;

        // Mặc định gán role là "khachhang" nếu thiếu role
        this.currentUser = {
          ...userData,
          role: userData.role || "khachhang",
        };

        return this.currentUser;
      } catch (e) {
        console.error("Lỗi trích xuất thông tin người dùng:", e);
        this.currentUser = null;
        // Nếu JSON hỏng, xóa luôn để tránh lỗi lặp lại
        localStorage.removeItem("user");
        return null;
      }
    },

    // Hứng dữ liệu phát ra từ AddressSelector.vue
    handleAddressUpdate(data) {
      this.addressData = data;
    },

    // Validate dữ liệu trước khi gửi lên Backend
    validateForm() {
      if (!this.currentUser?.id) {
        this.errorMessage =
          "Bạn chưa đăng nhập hoặc không tìm thấy thông tin tài khoản!";
        return false;
      }
      if (!this.addressData.tenNguoiNhan?.trim()) {
        this.errorMessage = "Vui lòng nhập tên người nhận!";
        return false;
      }
      if (!this.addressData.sdtNguoiNhan?.trim()) {
        this.errorMessage = "Vui lòng nhập số điện thoại người nhận!";
        return false;
      }
      if (!this.addressData.tinh_thanh_id) {
        this.errorMessage = "Vui lòng chọn Tỉnh / Thành phố!";
        return false;
      }
      if (!this.addressData.quan_huyen_id) {
        this.errorMessage = "Vui lòng chọn Quận / Huyện!";
        return false;
      }
      if (!this.addressData.phuong_xa_id) {
        this.errorMessage = "Vui lòng chọn Phường / Xã!";
        return false;
      }
      if (!this.addressData.diachichitiet?.trim()) {
        this.errorMessage =
          "Vui lòng nhập địa chỉ chi tiết (số nhà, tên đường)!";
        return false;
      }

      this.errorMessage = "";
      return true;
    },

    // 🟢 Submit tạo mới địa chỉ
    async handleSubmit() {
      if (!this.validateForm()) return;

      this.isSubmitting = true;

      // Khớp key payload với DiaChiService backend của bạn
      const payload = {
        makhachhang: this.currentUser.id,
        tennguoinhan: this.addressData.tenNguoiNhan,
        sdtnguoinhan: this.addressData.sdtNguoiNhan,
        diachichitiet: this.addressData.diachichitiet,
        tinhthanhid: String(this.addressData.tinh_thanh_id),
        tentinhthanh: this.addressData.tinh_thanh_ten,
        quanhuyenid: String(this.addressData.quan_huyen_id),
        tenquanhuyen: this.addressData.quan_huyen_ten,
        phuongxaid: String(this.addressData.phuong_xa_id),
        tenphuongxa: this.addressData.phuong_xa_ten,
        lamacdinh: Boolean(this.addressData.lamacdinh),
      };

      console.log("=== PAYLOAD GỬI LÊN BACKEND ===", payload);
      console.log(
        "Giá trị lamacdinh cụ thể:",
        payload.lamacdinh,
        " | Kiểu dữ liệu:",
        typeof payload.lamacdinh,
      );

      try {
        // Thay đổi URL API endpoint bên dưới cho đúng với router backend của bạn
        const response = await DiaChiService.create(payload);

        this.$router.push({
          name: "thongtintaikhoan",
          query: { tab: "ProfileAddress" }, // 🟢 Truyền tên tab muốn mở vào query
        });
        // VD: Nếu dùng vue-router có thể redirect lại danh sách địa chỉ
        // this.$router.push('/tai-khoan/diachi');
        alert("Thêm địa chỉ thành công!");
      } catch (error) {
        console.error("Lỗi thêm địa chỉ:", error);
        if (error.response?.data?.message === "KHACH_HANG_KHONG_TON_TAI") {
          this.errorMessage =
            "Tài khoản khách hàng không hợp lệ trên hệ thống!";
        } else {
          this.errorMessage =
            error.response?.data?.message || "Đã xảy ra lỗi khi thêm địa chỉ!";
        }
      } finally {
        this.isSubmitting = false;
      }
    },

    cancel() {
      this.$router.push({
        name: "thongtintaikhoan",
        query: { tab: "ProfileAddress" }, // 🟢 Truyền tên tab muốn mở vào query
      });
    },
  },
};
</script>

<style scoped>
.diachi-add-container {
  max-width: 600px;
  margin: 0 auto;
}
</style>
