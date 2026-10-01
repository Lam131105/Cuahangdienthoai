<template>
  <div class="diachi-list-container my-4">
    <div class="card shadow-sm border-0 p-4">
      <!-- Header tiêu đề & nút thêm mới -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="mb-0 text-primary fw-bold">Địa Chỉ Của Tôi</h4>
        <button class="btn btn-primary" @click="goToAddAddress">
          <i class="bi bi-plus-lg me-1"></i> Thêm Địa Chỉ Mới
        </button>
      </div>

      <!-- Trạng thái Loading -->
      <div v-if="isLoading" class="text-center my-5 py-3">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
        <p class="mt-2 text-muted">Đang tải danh sách địa chỉ...</p>
      </div>

      <!-- Trạng thái không có dữ liệu -->
      <div
        v-else-if="addresses.length === 0"
        class="text-center my-5 py-4 border rounded bg-light"
      >
        <p class="text-muted mb-3">Bạn chưa lưu địa chỉ giao hàng nào.</p>
        <button class="btn btn-outline-primary btn-sm" @click="goToAddAddress">
          Thêm địa chỉ ngay
        </button>
      </div>

      <!-- Danh sách địa chỉ -->
      <div v-else class="address-list d-flex flex-column gap-3">
        <div
          v-for="item in addresses"
          :key="item.id"
          class="address-item p-3 border rounded d-flex justify-content-between align-items-center"
          :class="{ 'border-primary bg-light-primary': item.lamacdinh }"
        >
          <!-- Thông tin địa chỉ -->
          <div class="address-info">
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="fw-bold fs-6">{{ item.tennguoinhan }}</span>
              <span class="text-muted">|</span>
              <span class="text-secondary">{{ item.sdtnguoinhan }}</span>

              <!-- Badge Mặc định -->
              <span v-if="item.lamacdinh" class="badge bg-danger ms-2">
                Mặc định
              </span>
            </div>

            <div class="text-dark mb-1">
              {{ item.diachichitiet }}
            </div>

            <div class="text-muted small">
              {{ item.tenphuongxa }}, {{ item.tenquanhuyen }},
              {{ item.tentinhthanh }}
            </div>
          </div>

          <!-- Các nút hành động -->
          <div class="address-actions d-flex gap-2">
            <!-- Nút Thiết lập mặc định (nếu chưa phải mặc định) -->
            <button
              v-if="!item.lamacdinh"
              class="btn btn-sm btn-outline-secondary"
              @click="setDefaultAddress(item)"
              :disabled="deletingId === item.id"
            >
              Thiết lập mặc định
            </button>

            <!-- Nút Xóa -->
            <button
              v-if="!item.lamacdinh"
              class="btn btn-sm btn-outline-danger"
              @click="confirmDelete(item)"
              :disabled="deletingId === item.id"
            >
              <span
                v-if="deletingId === item.id"
                class="spinner-border spinner-border-sm me-1"
              ></span>
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DiaChiService from "@/services/diachi.service.js"; // Đảm bảo đúng đường dẫn tới diachi.service.js của bạn

export default {
  name: "DiaChiList",
  data() {
    return {
      currentUser: null,
      addresses: [],
      isLoading: false,
      deletingId: null,
    };
  },
  mounted() {
    this.getCurrentUser();
    this.fetchAddresses();
  },
  methods: {
    // 🟢 Lấy thông tin user đăng nhập từ localStorage
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

    // 🟢 Gọi API lấy danh sách địa chỉ theo makhachhang
    async fetchAddresses() {
      if (!this.currentUser?.id) return;

      this.isLoading = true;
      try {
        // Truyền query param makhachhang đúng với filterData của backend
        const response = await DiaChiService.getAll({
          makhachhang: this.currentUser.id,
        });

        // Đưa địa chỉ mặc định lên đầu danh sách
        this.addresses = (response || []).sort(
          (a, b) => (b.lamacdinh ? 1 : 0) - (a.lamacdinh ? 1 : 0),
        );
      } catch (error) {
        console.error("Lỗi khi tải danh sách địa chỉ:", error);
      } finally {
        this.isLoading = false;
      }
    },

    // 🟢 Xóa 1 địa chỉ
    async confirmDelete(item) {
      const isConfirmed = confirm(
        `Bạn có chắc chắn muốn xóa địa chỉ này không?`,
      );
      if (!isConfirmed) return;

      this.deletingId = item.id;
      try {
        await DiaChiService.delete(item.id);

        // Cập nhật lại danh sách local sau khi xóa thành công
        this.addresses = this.addresses.filter((addr) => addr.id !== item.id);
        alert("Đã xóa địa chỉ thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa địa chỉ:", error);
        alert("Không thể xóa địa chỉ. Vui lòng thử lại sau!");
      } finally {
        this.deletingId = null;
      }
    },

    // 🟢 Thiết lập địa chỉ mặc định (Gọi hàm update)
    async setDefaultAddress(item) {
      try {
        await DiaChiService.update(item.id, {
          lamacdinh: true,
        });

        // Tải lại danh sách để cập nhật giao diện
        await this.fetchAddresses();
      } catch (error) {
        console.error("Lỗi khi đặt địa chỉ mặc định:", error);
        alert("Có lỗi xảy ra khi cập nhật địa chỉ mặc định!");
      }
    },

    // Điều hướng sang trang tạo mới địa chỉ
    goToAddAddress() {
      // Nếu dùng vue-router:
      this.$router.push({ name: "diachi.add" });
    },
  },
};
</script>

<style scoped>
.diachi-list-container {
  max-width: 800px;
  margin: 0 auto;
}
.address-item {
  transition: all 0.2s ease-in-out;
}
.address-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.bg-light-primary {
  background-color: #f8f9ff;
}
</style>
