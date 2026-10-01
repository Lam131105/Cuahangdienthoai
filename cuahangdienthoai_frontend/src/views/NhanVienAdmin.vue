<template>
  <div class="container-fluid py-4">
    <!-- Tiêu đề trang -->
    <h3 class="fw-bold text-primary mb-4">
      <i class="bi bi-people-fill me-2"></i>Quản Lý Nhân Viên
    </h3>

    <!-- Thanh Tìm Kiếm & Nút Thao Tác -->
    <div class="row g-3 align-items-center mb-4">
      <div class="col-md-8">
        <div class="row g-2">
          <div class="col-md-4">
            <input
              type="text"
              class="form-control"
              placeholder="Tìm tên nhân viên..."
              v-model="searchName"
              @keyup.enter="fetchNhanViens"
            />
          </div>
          <div class="col-md-4">
            <input
              type="text"
              class="form-control"
              placeholder="Tìm email..."
              v-model="searchEmail"
              @keyup.enter="fetchNhanViens"
            />
          </div>
          <div class="col-md-4">
            <button
              class="btn btn-outline-primary w-100"
              @click="fetchNhanViens"
            >
              <i class="bi bi-search me-1"></i> Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      <div class="col-md-4 text-end">
        <button class="btn btn-success me-2 fw-semibold" @click="goToAddForm">
          <i class="bi bi-plus-circle me-1"></i> Thêm mới
        </button>
        <button
          class="btn btn-danger fw-semibold"
          @click="removeAllNhanViens"
          :disabled="nhanViens.length === 0"
        >
          <i class="bi bi-trash me-1"></i> Xóa tất cả
        </button>
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

    <!-- Bảng Danh Sách Nhân Viên -->
    <div class="card shadow-sm border-0">
      <div
        class="card-footer bg-white text-muted text-end py-2 fs-7"
        v-if="!isLoading"
      >
        Tổng số: <strong>{{ nhanViens.length }}</strong> Nhân viên
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
                <th>Mã Vai trò</th>
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
                    Đang lấy danh sách nhân viên...
                  </p>
                </td>
              </tr>

              <!-- Trống -->
              <tr v-else-if="nhanViens.length === 0">
                <td colspan="8" class="text-center py-4 text-muted">
                  Không tìm thấy Nhân viên nào.
                </td>
              </tr>

              <!-- Hiển thị Danh Sách -->
              <tr v-else v-for="nv in nhanViens" :key="nv.id">
                <td class="ps-3 fw-bold">{{ nv.id }}</td>
                <td>
                  <img
                    :src="getAvatarUrl(nv.duongdananh)"
                    alt="avatar"
                    class="rounded-circle object-fit-cover"
                    width="40"
                    height="40"
                  />
                </td>
                <td class="fw-semibold text-dark">{{ nv.hoten }}</td>
                <td>{{ nv.email }}</td>
                <td>{{ nv.sodienthoai }}</td>
                <td>
                  <span class="badge bg-secondary">{{
                    nv.vaitro.tenvaitro
                  }}</span>
                </td>
                <td>
                  <select
                    class="form-select form-select-sm"
                    :class="{
                      'text-success fw-bold': nv.trangthai === 'Hoạt động',
                      'text-danger fw-bold': nv.trangthai === 'Khóa',
                    }"
                    :value="nv.trangthai"
                    @change="thayDoiTrangThai(nv, $event.target.value)"
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
                      @click="goToEditForm(nv.id)"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      class="btn btn-danger"
                      title="Xóa"
                      @click="deleteNhanVien(nv)"
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
import NhanVienService from "@/services/nhanvien.service";

export default {
  name: "NhanVienManager",
  data() {
    return {
      nhanViens: [],
      searchName: "",
      searchEmail: "",
      isLoading: false,
      message: "",
      errorMessage: "",
      defaultAvatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    };
  },
  methods: {
    async thayDoiTrangThai(nv, trangThaiMoi) {
      const trangThaiCu = nv.trangthai;

      // 1. Nếu trạng thái mới không thay đổi so với trạng thái cũ thì không xử lý
      if (trangThaiMoi === trangThaiCu) return;

      // 2. Nội dung thông báo xác nhận đầy đủ thông tin
      const messageConfirm =
        `Bạn có chắc chắn muốn thay đổi trạng thái nhân viên này?\n\n` +
        `• Mã NV: ${nv.id}\n` +
        `• Tên nhân viên: ${nv.hoten}\n` +
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
        nv.trangthai = trangThaiMoi;

        // Gọi API cập nhật
        await NhanVienService.update(nv.id, { trangthai: trangThaiMoi });

        console.log(
          `Đã cập nhật trạng thái của ${nv.id} thành: ${trangThaiMoi}`,
        );
      } catch (error) {
        console.error("Lỗi cập nhật trạng thái:", error);
        alert("Không thể cập nhật trạng thái! Đã xảy ra lỗi.");

        // Khôi phục lại trạng thái cũ nếu API gặp lỗi
        nv.trangthai = trangThaiCu;
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
    async fetchNhanViens() {
      this.isLoading = true;
      this.errorMessage = "";
      try {
        const params = {};
        if (this.searchName.trim()) params.name = this.searchName.trim();
        if (this.searchEmail.trim()) params.email = this.searchEmail.trim();

        this.nhanViens = await NhanVienService.getAll(params);
      } catch (error) {
        console.error("Lỗi tải danh sách Nhân viên:", error);
        this.errorMessage = "Không thể lấy danh sách Nhân viên!";
      } finally {
        this.isLoading = false;
      }
    },

    async deleteNhanVien(nv) {
      if (
        confirm(
          `Bạn có chắc muốn xóa nhân viên "${nv.hoten}" (${nv.id}) không?`,
        )
      ) {
        try {
          const res = await NhanVienService.delete(nv.id);
          this.message = res.message || "Xóa nhân viên thành công!";
          this.fetchNhanViens();
        } catch (error) {
          console.error("Lỗi khi xóa Nhân viên:", error);
          this.errorMessage =
            error.response?.data?.message || "Xóa Nhân viên thất bại!";
        }
      }
    },

    async removeAllNhanViens() {
      if (
        confirm(
          "⚠️ CẢNH BÁO: Bạn có chắc chắn muốn XÓA TẤT CẢ nhân viên? Hành động này không thể hoàn tác!",
        )
      ) {
        try {
          const res = await NhanVienService.deleteAll();
          this.message = res.message;
          this.fetchNhanViens();
        } catch (error) {
          console.error("Lỗi xóa tất cả Nhân viên:", error);
          this.errorMessage =
            error.response?.data?.message || "Không thể xóa tất cả Nhân viên!";
        }
      }
    },

    goToAddForm() {
      this.$router.push({ name: "admin.nhanvien.add" });
    },

    goToEditForm(id) {
      this.$router.push({ name: "admin.nhanvien.edit", params: { id } });
    },
  },
  mounted() {
    this.fetchNhanViens();
  },
};
</script>

<style scoped>
.fs-7 {
  font-size: 0.85rem;
}
</style>
