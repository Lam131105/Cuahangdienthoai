<template>
  <div class="container my-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2><i class="fas fa-boxes me-2"></i>Quản Lý Phiếu Nhập Kho</h2>
      <router-link :to="{ name: 'phieunhap.add' }" class="btn btn-success">
        <i class="fas fa-plus me-1"></i> Tạo Phiếu Nhập
      </router-link>
    </div>

    <!-- Thanh tìm kiếm & bộ lọc -->
    <div class="card mb-3 shadow-sm">
      <div class="card-body">
        <div class="row g-2">
          <div class="col-md-3">
            <input
              v-model="filters.id"
              type="text"
              class="form-control"
              placeholder="Mã phiếu (PN0001)..."
            />
          </div>
          <!-- 3. Nhà cung cấp -->
          <div class="col-6 col-sm-6 col-lg-2">
            <select
              class="form-select form-select-sm"
              v-model="filters.manhacungcap"
            >
              <option value="">Tất cả nhà cung cấp</option>
              <option
                v-for="item in dsNhaCungCap"
                :key="item.id"
                :value="item.id"
              >
                {{ item.tenncc || item.id }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <input
              v-model="filters.from"
              type="date"
              class="form-control"
              title="Từ ngày"
            />
          </div>
          <div class="col-md-2">
            <input
              v-model="filters.to"
              type="date"
              class="form-control"
              title="Đến ngày"
            />
          </div>
          <div class="col-md-2 d-flex gap-1">
            <button class="btn btn-primary w-100" @click="fetchPhieuNhaps">
              <i class="fas fa-search"></i> Lọc
            </button>
            <button class="btn btn-outline-secondary" @click="resetFilter">
              <i class="fas fa-sync"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bảng danh sách phiếu nhập -->
    <div class="table-responsive shadow-sm rounded">
      <table class="table table-hover align-middle mb-0 bg-white">
        <thead class="table-dark">
          <tr>
            <th>Mã PN</th>
            <th>Nhà Cung Cấp</th>
            <th>Nhân Viên Tạo</th>
            <th>Ngày Nhập</th>
            <th>Tổng Tiền</th>
            <th class="text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="text-center py-4">
              <div class="spinner-border text-primary" role="status"></div>
            </td>
          </tr>
          <tr v-else-if="dsPhieuNhap.length === 0">
            <td colspan="6" class="text-center py-4 text-muted">
              Chưa có dữ liệu phiếu nhập.
            </td>
          </tr>
          <tr v-else v-for="item in dsPhieuNhap" :key="item.id">
            <td class="fw-bold text-primary">{{ item.id }}</td>
            <td>
              {{ item.nhacungcap?.tenncc }}
            </td>
            <td>
              {{ item.nhanvien?.hoten }}
              <small class="text-muted">({{ item.manhanvien }})</small>
            </td>
            <td>{{ formatDate(item.ngaynhap) }}</td>
            <td class="fw-bold text-danger">
              {{ formatCurrency(item.tongtien) }}
            </td>
            <td class="text-center">
              <router-link
                :to="{ name: 'phieunhap.edit', params: { id: item.id } }"
                class="btn btn-sm btn-warning me-2"
                title="Sửa"
              >
                <i class="fas fa-edit"></i>
              </router-link>
              <router-link
                :to="{
                  name: 'chitietnhap',
                  params: { maphieunhap: item.id },
                }"
                class="btn btn-sm btn-info text-white me-2"
                title="Xem chi tiết hàng nhập"
              >
                <i class="fas fa-list-ul"></i> Chi tiết
              </router-link>
              <button
                class="btn btn-sm btn-danger"
                @click="deletePhieuNhap(item.id)"
                title="Xóa"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import PhieuNhapService from "@/services/phieunhap.service";
import NhaCungCapService from "@/services/nhacungcap.service";

export default {
  name: "PhieuNhapAdmin",
  data() {
    return {
      dsPhieuNhap: [],
      dsNhaCungCap: [],
      loading: false,
      filters: {
        id: "",
        manhacungcap: "",
        from: "",
        to: "",
      },
    };
  },
  created() {
    this.fetchPhieuNhaps();
    this.fetchNhaCungCaps();
  },
  methods: {
    async fetchPhieuNhaps() {
      this.loading = true;
      try {
        this.dsPhieuNhap = await PhieuNhapService.getAll(this.filters);
      } catch (error) {
        console.error("Lỗi lấy danh sách phiếu nhập:", error);
      } finally {
        this.loading = false;
      }
    },

    async fetchNhaCungCaps() {
      try {
        this.dsNhaCungCap = await NhaCungCapService.getAll();
      } catch (e) {}
    },
    resetFilter() {
      this.filters = { id: "", manhacungcap: "", from: "", to: "" };
      this.fetchPhieuNhaps();
    },
    async deletePhieuNhap(id) {
      if (confirm(`Bạn có chắc chắn muốn xóa Phiếu Nhập ${id} không?`)) {
        try {
          await PhieuNhapService.delete(id);
          alert("Đã xóa phiếu nhập thành công!");
          this.fetchPhieuNhaps();
        } catch (error) {
          alert(
            error.response?.data?.message || "Không thể xóa phiếu nhập này.",
          );
        }
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return "";
      return new Date(dateStr).toLocaleString("vi-VN");
    },
    formatCurrency(val) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(val || 0);
    },
  },
};
</script>
