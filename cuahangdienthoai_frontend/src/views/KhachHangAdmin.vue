<template>
  <div class="container-fluid py-4">
    <!-- Tiêu đề trang -->
    <h3 class="fw-bold text-primary mb-4">
      <i class="bi bi-people-fill me-2"></i>Quản Lý Khách Hàng
    </h3>

    <!-- Thanh Tìm Kiếm & Nút Thao Tác -->
    <div class="row g-3 align-items-center mb-4">
      <div class="col-md-8">
        <div class="row g-2">
          <div class="col-md-4">
            <input
              type="text"
              class="form-control"
              placeholder="Tìm tên khách hàng..."
              v-model="searchName"
              @keyup.enter="fetchKhachHangs"
            />
          </div>
          <div class="col-md-4">
            <input
              type="text"
              class="form-control"
              placeholder="Tìm email..."
              v-model="searchEmail"
              @keyup.enter="fetchKhachHangs"
            />
          </div>
          <div class="col-md-4">
            <button
              class="btn btn-outline-primary w-100"
              @click="fetchKhachHangs"
            >
              <i class="bi bi-search me-1"></i> Tìm kiếm
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Thông báo Alert -->
    <div
      v-if="message"
      class="alert alert-success alert-dismissible fade show"
      role="alert"
    >
      <i class="bi bi-check-circle-fill me-2"></i>{{ message }}
      <button type="button" class="btn-close" @click="message = ''"></button>
    </div>
    <div
      v-if="errorMessage"
      class="alert alert-danger alert-dismissible fade show"
      role="alert"
    >
      <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
      <button
        type="button"
        class="btn-close"
        @click="errorMessage = ''"
      ></button>
    </div>

    <!-- Bảng Danh Sách Khách Hàng -->
    <div class="card shadow-sm border-0">
      <div
        class="card-footer bg-white text-muted text-end py-2 fs-7"
        v-if="!isLoading"
      >
        Tổng số: <strong>{{ khachHangs.length }}</strong> Khách hàng
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-dark">
              <tr>
                <th class="ps-3" style="width: 100px">MÃ NV</th>
                <th>Ảnh</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Trạng thái</th>
                <th class="text-center" style="width: 120px">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <!-- Trạng thái Loading -->
              <tr v-if="isLoading">
                <td colspan="8" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Đang tải...</span>
                  </div>
                  <p class="mt-2 text-muted mb-0">
                    Đang lấy danh sách khách hàng...
                  </p>
                </td>
              </tr>

              <!-- Trống -->
              <tr v-else-if="khachHangs.length === 0">
                <td colspan="8" class="text-center py-4 text-muted">
                  Không tìm thấy Khách hàng nào.
                </td>
              </tr>

              <!-- Hiển thị Danh Sách -->
              <tr v-else v-for="kh in khachHangs" :key="kh.id">
                <td class="ps-3 fw-bold">{{ kh.id }}</td>
                <td>
                  <img
                    :src="getAvatarUrl(kh.duongdananh)"
                    alt="avatar"
                    class="rounded-circle object-fit-cover"
                    width="40"
                    height="40"
                  />
                  <!-- {{ getAvatarUrl(kh.duongdananh) }} -->
                </td>
                <td class="fw-semibold text-dark">{{ kh.hoten }}</td>
                <td>{{ kh.email }}</td>
                <td>{{ kh.sodienthoai }}</td>
                <td>
                  <select
                    class="form-select form-select-sm"
                    :class="{
                      'text-success fw-bold': kh.trangthai === 'Hoạt động',
                      'text-danger fw-bold': kh.trangthai === 'Khóa',
                    }"
                    :value="kh.trangthai"
                    @change="thayDoiTrangThai(kh, $event.target.value)"
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Khóa">Khóa</option>
                  </select>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm" role="group">
                    <button
                      class="btn btn-warning text-white"
                      title="Chỉnh sửa"
                      @click="goToEditForm(kh.id)"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      class="btn btn-danger"
                      title="Xóa"
                      @click="deleteKhachHang(kh)"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import KhachHangService from "@/services/khachhang.service";

export default {
  name: "KhachHangManager",
  data() {
    return {
      khachHangs: [],
      searchName: "",
      searchEmail: "",
      isLoading: false,
      message: "",
      errorMessage: "",
      defaultAvatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    };
  },
  methods: {
    async thayDoiTrangThai(kh, trangThaiMoi) {
      const trangThaiCu = kh.trangthai;

      // 1. Nếu trạng thái mới không thay đổi so với trạng thái cũ thì không xử lý
      if (trangThaiMoi === trangThaiCu) return;

      // 2. Nội dung thông báo xác nhận đầy đủ thông tin
      const messageConfirm =
        `Bạn có chắc chắn muốn thay đổi trạng thái khách hàng này?\n\n` +
        `• Mã KH: ${kh.id}\n` +
        `• Tên khách hàng: ${kh.hoten}\n` +
        `• Trạng thái cũ: ${trangThaiCu}\n` +
        `• Trạng thái mới: ${trangThaiMoi}`;

      // 3. Hiển thị hộp thoại Alert xác nhận (OK / Cancel)
      const isConfirmed = confirm(messageConfirm);

      // Nếu người dùng nhấn "Hủy" (Cancel)
      if (!isConfirmed) {
        // Ép giao diện vẽ lại trạng thái cũ bằng cách gán lại mảng hoặc ép cập nhật
        this.$forceUpdate();
        return;
      }

      // Nếu người dùng nhấn "OK" -> Tiến hành cập nhật
      try {
        // Cập nhật trạng thái trên giao diện ngay
        kh.trangthai = trangThaiMoi;

        // Gọi API cập nhật
        await KhachHangService.update(kh.id, { trangthai: trangThaiMoi });

        console.log(
          `Đã cập nhật trạng thái của ${kh.id} thành: ${trangThaiMoi}`,
        );
      } catch (error) {
        console.error("Lỗi cập nhật trạng thái:", error);
        alert("Không thể cập nhật trạng thái! Đã xảy ra lỗi.");

        // Khôi phục lại trạng thái cũ nếu API gặp lỗi
        kh.trangthai = trangThaiCu;
        this.$forceUpdate();
      }
    },
    getAvatarUrl(fileName) {
      if (!fileName) return this.defaultAvatar;
      // Nếu đường dẫn lưu trong DB đã là link đầy đủ (http...) thì giữ nguyên
      if (fileName.startsWith("http")) return fileName;
      // Nối với URL server uploads của bạn
      return `http://localhost:5000${fileName}`;
    },
    async fetchKhachHangs() {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        const params = {};
        if (this.searchName.trim()) params.name = this.searchName.trim();
        if (this.searchEmail.trim()) params.email = this.searchEmail.trim();

        this.khachHangs = await KhachHangService.getAll(params);
      } catch (error) {
        console.error("Lỗi tải danh sách Khách hàng:", error);
        this.errorMessage = "Không thể lấy danh sách Khách hàng!";
      } finally {
        this.isLoading = false;
      }
    },

    async deleteKhachHang(kh) {
      if (
        confirm(
          `Bạn có chắc muốn xóa khách hàng "${kh.hoten}" (${kh.id}) không?`,
        )
      ) {
        try {
          const res = await KhachHangService.delete(kh.id);
          this.message = res.message || "Xóa khách hàng thành công!";
          this.fetchKhachHangs();
        } catch (error) {
          console.error("Lỗi khi xóa Khách hàng:", error);
          this.errorMessage =
            error.response?.data?.message || "Xóa Khách hàng thất bại!";
        }
      }
    },

    goToEditForm(id) {
      this.$router.push({ name: "admin.khachhang.edit", params: { id } });
    },
  },
  mounted() {
    this.fetchKhachHangs();
  },
};
</script>

<style scoped>
.fs-7 {
  font-size: 0.85rem;
}
</style>
