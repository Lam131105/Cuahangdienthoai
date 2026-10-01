<template>
  <div class="container py-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-primary mb-1">
          <i class="far fa-bell me-2"></i>Thông Báo Của Tôi
        </h3>
        <p class="text-muted mb-0" v-if="currentUser">
          Tài khoản:
          <strong
            >{{ currentUser.hoten || currentUser.email || currentUser.id
            }}<!-- Badge đếm số thông báo chưa đọc -->
            <span class="badge bg-danger rounded-pill fs-6 p-2">
              {{ unreadCount }} chưa đọc
            </span></strong
          >
        </p>
      </div>
      <button class="btn btn-outline-secondary btn-sm" @click="fetchThongBao">
        <i class="bi bi-arrow-clockwise me-1"></i> Làm mới
      </button>
    </div>

    <!-- Khung hiển thị danh sách -->
    <div class="card shadow-sm border-0">
      <div class="card-body p-0">
        <!-- Loading -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2 text-muted">Đang tải thông báo...</p>
        </div>

        <!-- Chưa đăng nhập -->
        <div v-else-if="!currentUser" class="text-center py-5">
          <i class="fas fa-user-lock fa-3x text-secondary mb-3"></i>
          <h5>Vui lòng đăng nhập</h5>
          <p class="text-muted">Bạn cần đăng nhập để xem thông báo cá nhân.</p>
        </div>

        <!-- Không có thông báo -->
        <div v-else-if="dsThongBao.length === 0" class="text-center py-5">
          <i class="far fa-bell-slash fa-3x text-muted mb-3"></i>
          <h5>Không có thông báo nào</h5>
          <p class="text-muted">
            Bạn chưa nhận được thông báo nào từ hệ thống.
          </p>
        </div>

        <!-- Danh sách Thông báo -->
        <div v-else class="list-group list-group-flush">
          <div
            v-for="item in dsThongBao"
            :key="item.id"
            class="list-group-item list-group-item-action p-3 d-flex align-items-start justify-content-between cursor-pointer transition-all"
          >
            <!-- Biểu tượng icon theo loại thông báo -->
            <div class="d-flex me-3">
              <div class="me-3 fs-3">
                <i
                  v-if="item.loaithongbao === 'Đơn hàng'"
                  class="fas fa-shopping-bag text-success"
                ></i>
                <i
                  v-else-if="item.loaithongbao === 'Khuyến mãi'"
                  class="fas fa-tags text-warning"
                ></i>
                <i v-else class="fas fa-info-circle text-info"></i>
              </div>

              <div>
                <div class="d-flex align-items-center mb-1">
                  <h6
                    class="mb-0 me-2"
                    :class="{ 'fw-bold text-dark': !item.daxem }"
                  >
                    {{ item.tieude }}
                  </h6>
                  <span v-if="!item.daxem" class="badge bg-danger">Mới</span>
                </div>

                <p class="mb-1 text-secondary text-break font-weight-normal">
                  {{ item.noidung }}
                </p>

                <small class="text-muted">
                  <i class="far fa-clock me-1"></i>{{ formatDate(item.ngay) }}
                </small>
              </div>
            </div>

            <!-- Nút thao tác xóa / chuyển hướng -->
            <div class="d-flex align-items-center ms-2" @click.stop>
              <router-link
                v-if="item.duongdan"
                :to="item.duongdan"
                class="btn btn-sm btn-outline-primary me-2"
              >
                Xem
              </router-link>
              <button
                class="btn btn-sm btn-link text-danger p-0 ms-2"
                title="Xóa thông báo"
                @click="handleDelete(item.id)"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ThongBaoService from "@/services/thongbao.service";

export default {
  name: "ThongBaoKhachHang",
  data() {
    return {
      currentUser: null,
      dsThongBao: [],
      loading: false,
    };
  },
  computed: {
    // Đếm số thông báo chưa đọc (daxem === false)
    unreadCount() {
      return this.dsThongBao.filter((tb) => !tb.daxem).length;
    },
  },
  async created() {
    this.currentUser = this.getCurrentUser();
    if (this.currentUser && this.currentUser.id) {
      await this.fetchThongBao();
    }
  },
  methods: {
    // Hàm lấy ID người dùng từ localStorage theo đúng yêu cầu của bạn
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

    // Gọi API lấy toàn bộ thông báo của khách hàng đang đăng nhập
    async fetchThongBao() {
      this.loading = true;
      try {
        this.dsThongBao = await ThongBaoService.getByKhachHang(
          this.currentUser.id,
        );
      } catch (error) {
        console.error("Lỗi khi lấy danh sách thông báo:", error);
      } finally {
        this.loading = false;
      }
    },

    // Click vào thông báo để chuyển trạng thái thành "Đã xem" (daxem: true)
    async handleMarkSeen(item) {
      if (item.daxem) return; // Nếu đã xem rồi thì bỏ qua

      try {
        await ThongBaoService.updateSeen(item.id);
        item.daxem = true; // Cập nhật ngay trên UI mà không cần fetch lại toàn bộ
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái đã xem:", error);
      }
    },

    // Xóa 1 thông báo
    async handleDelete(id) {
      if (confirm("Bạn có chắc muốn xóa thông báo này?")) {
        try {
          await ThongBaoService.delete(id);
          this.dsThongBao = this.dsThongBao.filter((item) => item.id !== id);
        } catch (error) {
          alert("Lỗi khi xóa thông báo!");
        }
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return "";
      return new Date(dateStr).toLocaleString("vi-VN");
    },
  },
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.transition-all {
  transition: background-color 0.2s ease;
}
.list-group-item:hover {
  background-color: #f8f9fa;
}
</style>
