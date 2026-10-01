<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3 class="fw-bold text-primary m-0">Quản Lý Đợt Khuyến Mãi</h3>
      <router-link :to="{ name: 'dotkhuyenmai.add' }" class="btn btn-primary">
        <i class="fas fa-plus-circle me-1"></i> Thêm Đợt Khuyến Mãi
      </router-link>
    </div>

    <!-- Bộ Lọc -->
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <input
              v-model="filters.tendot"
              type="text"
              class="form-control"
              placeholder="Tìm theo tên đợt..."
              @keyup.enter="fetchData"
            />
          </div>
          <div class="col-md-4">
            <select
              v-model="filters.loaigiamgia"
              class="form-select"
              @change="fetchData"
            >
              <option value="">-- Tất cả loại giảm giá --</option>
              <option value="Phần trăm">Phần trăm</option>
              <option value="Số tiền">Số tiền</option>
            </select>
          </div>
          <div class="col-md-4 d-flex gap-2">
            <button class="btn btn-outline-primary w-100" @click="fetchData">
              <i class="fas fa-search me-1"></i> Tìm kiếm
            </button>
            <button
              class="btn btn-outline-secondary w-100"
              @click="resetFilter"
            >
              <i class="fas fa-sync me-1"></i> Làm mới
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bảng Danh Sách -->
    <div class="card shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Mã ĐKM</th>
                <th>Tên Đợt</th>
                <th>Mức Giảm</th>
                <th>Thời Gian</th>
                <th>Trạng Thái</th>
                <th class="text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status"></div>
                </td>
              </tr>
              <tr v-else-if="dsKhuyenMai.length === 0">
                <td colspan="6" class="text-center py-4 text-muted">
                  Chưa có đợt khuyến mãi nào.
                </td>
              </tr>
              <tr v-else v-for="item in dsKhuyenMai" :key="item.id">
                <td>
                  <strong>{{ item.id }}</strong>
                </td>
                <td class="fw-semibold">{{ item.tendot }}</td>
                <td>
                  <span class="badge bg-success fs-6">
                    -{{ item.giatrigiam }}
                    {{ item.loaigiamgia === "Phần trăm" ? "%" : "VNĐ" }}
                  </span>
                </td>
                <td class="small">
                  <div>
                    <i class="far fa-clock text-success me-1"></i
                    >{{ formatDate(item.ngaybatdau) }}
                  </div>
                  <div>
                    <i class="far fa-clock text-danger me-1"></i
                    >{{ formatDate(item.ngayketthuc) }}
                  </div>
                </td>
                <td>
                  <span
                    :class="
                      getStatusBadge(item.ngaybatdau, item.ngayketthuc).class
                    "
                  >
                    {{ getStatusBadge(item.ngaybatdau, item.ngayketthuc).text }}
                  </span>
                </td>
                <td class="text-center">
                  <router-link
                    :to="{ name: 'dotkhuyenmai.edit', params: { id: item.id } }"
                    class="btn btn-sm btn-outline-warning me-2"
                  >
                    <i class="fas fa-edit"></i>
                  </router-link>

                  <router-link
                    :to="{
                      name: 'chitietdotkhuyenmai',
                      params: { id: item.id },
                    }"
                    class="btn btn-sm btn-outline-info me-2"
                    title="Xem danh sách sản phẩm áp dụng"
                  >
                    <i class="fas fa-list"></i> Chi tiết
                  </router-link>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="handleDelete(item.id)"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
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
import DotKhuyenMaiService from "@/services/dotkhuyenmai.service";

export default {
  name: "DotKhuyenMai",
  data() {
    return {
      dsKhuyenMai: [],
      loading: false,
      filters: {
        tendot: "",
        loaigiamgia: "",
      },
    };
  },
  async created() {
    await this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        this.dsKhuyenMai = await DotKhuyenMaiService.getAll(this.filters);
      } catch (error) {
        console.error("Lỗi tải danh sách:", error);
      } finally {
        this.loading = false;
      }
    },
    resetFilter() {
      this.filters = { tendot: "", loaigiamgia: "" };
      this.fetchData();
    },
    async handleDelete(id) {
      if (confirm(`Bạn có chắc chắn muốn xóa đợt khuyến mãi ${id}?`)) {
        try {
          await DotKhuyenMaiService.delete(id);
          alert("Đã xóa đợt khuyến mãi thành công");
          await this.fetchData();
        } catch (error) {
          alert(error.response?.data?.message || "Lỗi khi xóa đợt khuyến mãi!");
        }
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return "";
      return new Date(dateStr).toLocaleString("vi-VN");
    },
    getStatusBadge(start, end) {
      const now = new Date();
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (now < startDate) {
        return { class: "badge bg-info text-dark", text: "Sắp diễn ra" };
      } else if (now >= startDate && now <= endDate) {
        return { class: "badge bg-primary", text: "Đang diễn ra" };
      } else {
        return { class: "badge bg-secondary", text: "Đã kết thúc" };
      }
    },
  },
};
</script>
