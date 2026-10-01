<template>
  <div id="app">
    <!-- Thanh điều hướng Navbar -->
    <nav class="navbar navbar-expand navbar-dark bg-dark">
      <div class="container">
        <router-link to="/" class="navbar-brand"
          >📱 Cửa Hàng Điện Thoại</router-link
        >

        <div class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link :to="{ name: 'giohang' }" class="nav-link">
              <i class="fas fa-tags"></i> Giỏ hàng
            </router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'sanpham' }" class="nav-link">
              <i class="fas fa-tags"></i> Sản phẩm
            </router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'phieunhap' }" class="nav-link">
              <i class="fas fa-tags"></i> Phiếu nhập
            </router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'dotkhuyenmai' }" class="nav-link">
              <i class="fas fa-tags"></i> Đợt khuyến mãi
            </router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'admin.thuonghieu' }" class="nav-link">
              <i class="fas fa-tags"></i> Quản lý Thương Hiệu
            </router-link>
          </li>

          <li class="nav-item">
            <router-link :to="{ name: 'admin.theloai' }" class="nav-link">
              <i class="fas fa-tags"></i> Quản lý Thể loại
            </router-link>
          </li>

          <li class="nav-item">
            <router-link :to="{ name: 'admin.nhacungcap' }" class="nav-link">
              <i class="fas fa-tags"></i> Quản lý Nhà cung cấp
            </router-link>
          </li>

          <li class="nav-item">
            <router-link :to="{ name: 'admin.ram' }" class="nav-link">
              <i class="fas fa-tags"></i> Quản lý Ram
            </router-link>
          </li>

          <li class="nav-item">
            <router-link :to="{ name: 'admin.rom' }" class="nav-link">
              <i class="fas fa-tags"></i> Quản lý Rom
            </router-link>
          </li>

          <li class="nav-item">
            <router-link :to="{ name: 'admin.mausac' }" class="nav-link">
              <i class="fas fa-tags"></i> Quản lý Màu sắc
            </router-link>
          </li>

          <li class="nav-item">
            <router-link :to="{ name: 'admin.nhanvien' }" class="nav-link">
              <i class="fas fa-tags"></i> Quản lý Nhân viên
            </router-link>
          </li>

          <li class="nav-item">
            <router-link :to="{ name: 'admin.khachhang' }" class="nav-link">
              <i class="fas fa-tags"></i> Quản lý Khách hàng
            </router-link>
          </li>

          <li class="nav-item">
            <router-link :to="{ name: 'admin.phieugiamgia' }" class="nav-link">
              <i class="fas fa-tags"></i> Quản lý Phiếu giảm giá
            </router-link>
          </li>

          <li class="nav-item">
            <router-link
              :to="{ name: 'admin.dieukiennhanvoucher' }"
              class="nav-link"
            >
              <i class="fas fa-tags"></i> Điều kiện nhận voucher
            </router-link>
          </li>
        </div>

        <!-- Khu vực hiển thị Tài khoản / Đăng nhập / Đăng xuất -->
        <div class="navbar-nav ms-auto align-items-center">
          <!-- Trạng thái 1: ĐÃ ĐĂNG NHẬP -->
          <template v-if="currentUser">
            <!-- Icon Avatar người dùng -> Bấm vào để xem Thông tin chi tiết -->
            <li class="nav-item me-3">
              <router-link
                :to="{ name: 'thongtintaikhoan' }"
                class="d-flex align-items-center text-decoration-none"
                title="Xem thông tin chi tiết"
              >
                <img
                  :src="getAvatarUrl(currentUser.duongdananh)"
                  alt="Avatar"
                  class="rounded-circle border border-2 border-primary avatar-img"
                  referrerpolicy="no-referrer"
                  @error="onImageError"
                />
              </router-link>
            </li>

            <!-- Nút Đăng xuất -->
            <li class="nav-item">
              <button
                @click="handleLogout"
                class="btn btn-outline-danger btn-sm"
              >
                <i class="fas fa-sign-out-alt"></i> Đăng xuất
              </button>
            </li>
          </template>

          <!-- Trạng thái 2: CHƯA ĐĂNG NHẬP -->
          <template v-else>
            <li class="nav-item me-2">
              <router-link :to="{ name: 'dangnhap' }" class="nav-link">
                <i class="fas fa-sign-in-alt"></i> Đăng nhập
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                :to="{ name: 'dangki' }"
                class="btn btn-primary btn-sm"
              >
                <i class="fas fa-user-plus"></i> Đăng ký
              </router-link>
            </li>
          </template>
        </div>
      </div>
    </nav>

    <!-- Khung hiển thị nội dung các trang -->
    <main class="container mt-3">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      currentUser: null,
      // Ảnh đại diện mặc định nếu người dùng chưa có ảnh hoặc bị lỗi link
      defaultAvatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    };
  },
  created() {
    this.checkLoginStatus();
  },
  watch: {
    $route() {
      this.checkLoginStatus();
    },
  },
  methods: {
    // Hàm xử lý đường dẫn ảnh đại diện
    getAvatarUrl(fileName) {
      if (!fileName) return this.defaultAvatar;
      // Nếu đường dẫn lưu trong DB đã là link đầy đủ (http...) thì giữ nguyên
      if (fileName.startsWith("http")) return fileName;
      // Nối với URL server uploads của bạn
      return `http://localhost:5000${fileName}`;
    },

    // Xử lý khi ảnh bị lỗi không tải được
    onImageError(event) {
      event.target.src = this.defaultAvatar;
    },

    checkLoginStatus() {
      const userStorage = localStorage.getItem("user");

      if (!userStorage) {
        this.currentUser = null;
        return;
      }

      try {
        const parsedUser = JSON.parse(userStorage);

        // Bọc lót: Kiểm tra nếu data bị lồng dạng { user: {...} } do response Google/Facebook
        const userData = parsedUser;

        // Đảm bảo luôn có role ("khachhang" hoặc "nhanvien")
        this.currentUser = {
          ...userData,
          role: userData.role || "khachhang",
        };
      } catch (error) {
        console.error("Lỗi đọc trạng thái đăng nhập:", error);
        this.currentUser = null;
        // Xóa key hỏng để tránh bị lỗi lặp lại ở các trang khác
        localStorage.removeItem("user");
      }
    },

    handleLogout() {
      localStorage.removeItem("user");
      this.currentUser = null;
      this.$router.push({ name: "dangnhap" });
    },
  },
};
</script>

<style scoped>
/* CSS cho Avatar */
.avatar-img {
  width: 38px;
  height: 38px;
  object-fit: cover;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease;
  cursor: pointer;
}

.avatar-img:hover {
  transform: scale(1.1);
  border-color: #0d6efd !important;
}
</style>
