<template>
  <div class="container my-4" v-if="user">
    <div class="row">
      <!-- CỘT TRÁI: Avatar & Menu chuyển Tab -->
      <div class="col-md-4 mb-4">
        <!-- Thẻ Avatar -->
        <div class="card shadow-sm border-0 text-center p-4 mb-3">
          <div class="position-relative d-inline-block mx-auto mb-3">
            <img
              :src="getAvatarUrl(user.duongdananh)"
              alt="Avatar"
              class="rounded-circle img-thumbnail shadow-sm avatar-profile"
              @error="onImageError"
            />
          </div>
          <h5 class="fw-bold mb-1">{{ user.hoten }}</h5>
          <p class="text-muted small mb-2">
            <i class="fas fa-envelope me-1"></i>{{ user.email }}
          </p>
          <span class="badge bg-success w-50 mx-auto py-2"
            >Tài khoản hoạt động</span
          >
        </div>

        <!-- Sidebar Danh mục quản lý -->
        <div class="list-group shadow-sm border-0 rounded-3">
          <router-link
            :to="{ path: '/thongtintaikhoan', query: { tab: 'ProfileInfo' } }"
            class="nav-link"
          >
            <button
              class="list-group-item list-group-item-action d-flex align-items-center py-3"
              :class="{ active: currentTab === 'ProfileInfo' }"
            >
              <i class="fas fa-user-circle me-3 fa-lg"></i> Thông tin tài khoản
            </button>
          </router-link>

          <router-link
            :to="{
              path: '/thongtintaikhoan',
              query: { tab: 'ProfileVouchers' },
            }"
            class="nav-link"
          >
            <!-- Nút phiếu giảm giá (Ví dụ mở rộng) -->
            <button
              class="list-group-item list-group-item-action d-flex align-items-center py-3"
              :class="{ active: currentTab === 'ProfileVouchers' }"
            >
              <i class="fas fa-ticket-alt me-3 fa-lg text-warning"></i> Kho
              Voucher / Ưu đãi
            </button>
          </router-link>

          <router-link
            :to="{
              path: '/thongtintaikhoan',
              query: { tab: 'ProfileNotice' },
            }"
            class="nav-link"
          >
            <button
              class="list-group-item list-group-item-action d-flex align-items-center py-3"
              :class="{ active: currentTab === 'ProfileNotice' }"
            >
              <i class="fas fa-ticket-alt me-3 fa-lg text-warning"></i>
              Thông báo của bạn
            </button>
          </router-link>

          <router-link
            :to="{
              path: '/thongtintaikhoan',
              query: { tab: 'ProfileAddress' },
            }"
            class="nav-link"
          >
            <button
              class="list-group-item list-group-item-action d-flex align-items-center py-3"
              :class="{ active: currentTab === 'ProfileAddress' }"
            >
              <i class="fas fa-shopping-bag me-3 fa-lg text-info"></i> Thông tin
              địa chỉ
            </button>
          </router-link>

          <router-link
            :to="{
              path: '/thongtintaikhoan',
              query: { tab: 'ProfileOrders' },
            }"
            class="nav-link"
          >
            <!-- Nút Đơn hàng (Ví dụ mở rộng) -->
            <button
              class="list-group-item list-group-item-action d-flex align-items-center py-3"
              :class="{ active: currentTab === 'ProfileOrders' }"
            >
              <i class="fas fa-shopping-bag me-3 fa-lg text-info"></i> Quản lý
              đơn hàng
            </button>
          </router-link>
        </div>
      </div>

      <!-- CỘT PHẢI: Hiển thị Tab được chọn (Dynamic Component) -->
      <div class="col-md-8">
        <component
          :is="currentTab"
          :user="user"
          @reload-user="loadUserData"
          @update-user="onUserUpdated"
        />
      </div>
    </div>
  </div>
</template>

<script>
import KhachHangService from "@/services/khachhang.service";
import NhanVienService from "@/services/nhanvien.service";
import ProfileInfo from "@/components/TaiKhoan/ThongTinTaiKhoan.vue";
import ProfileVouchers from "@/components/TaiKhoan/PhieuGiamGia.vue";
import ProfileOrders from "@/components/TaiKhoan/LichSu.vue";
import ProfileAddress from "@/components/TaiKhoan/ThongTinDiaChi.vue";
import ProfileNotice from "@/components/TaiKhoan/ThongBao.vue";

export default {
  name: "ProfileView",
  components: {
    ProfileInfo,
    ProfileVouchers,
    ProfileOrders,
    ProfileAddress,
    ProfileNotice,
  },
  data() {
    return {
      user: null,
      currentTab: this.$route.query.tab || "ProfileInfo", // Tab mặc định
      defaultAvatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    };
  },

  watch: {
    "$route.query.tab"(newTab) {
      if (newTab) {
        this.currentTab = newTab;
      }
    },
  },

  created() {
    this.loadUserData();
  },
  methods: {
    async loadUserData() {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        this.$router.push({ name: "login" });
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);

        // Bọc lót lấy đúng object user và xác định role
        const localUser = parsedUser;
        const currentRole = localUser.role || "khachhang";

        this.user = { ...localUser, role: currentRole };

        // 1. Khai báo biến freshData ở ngoài phạm vi khối if/else
        let freshData = null;

        // 2. Gọi API tương ứng theo role
        if (currentRole === "nhanvien") {
          freshData = await NhanVienService.get(localUser.id);
        } else {
          freshData = await KhachHangService.get(localUser.id);
        }

        // 3. Nếu lấy dữ liệu mới từ Server thành công -> Cập nhật lại state & localStorage
        if (freshData) {
          if (freshData.ngaysinh) {
            freshData.ngaysinh = new Date(freshData.ngaysinh)
              .toISOString()
              .split("T")[0];
          }

          // Giữ lại trường role khi lưu dữ liệu mới từ server về
          const updatedUser = { ...freshData, role: currentRole };

          this.user = updatedUser;
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin user từ server:", error);
      }
    },

    // Hàm nhận sự kiện update từ component con để đồng bộ lại user
    onUserUpdated(updatedData) {
      this.user = { ...this.user, ...updatedData };
      localStorage.setItem("user", JSON.stringify(this.user));
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
.avatar-profile {
  width: 130px;
  height: 130px;
  object-fit: cover;
}

.list-group-item.active {
  background-color: #0d6efd;
  border-color: #0d6efd;
  font-weight: bold;
}
</style>
