<template>
  <div class="container-fluid py-4">
    <div class="card shadow-sm border-0">
      <!-- Header -->

      <div
        class="card-header bg-white py-3 d-flex justify-content-between align-items-center"
      >
        <h5 class="mb-0 fw-bold text-primary">
          <i class="fas fa-boxes me-2"></i>Danh sách Sản Phẩm
        </h5>

        <router-link
          to="/admin/sanpham/add"
          class="btn btn-primary btn-sm fw-bold"
        >
          <i class="fas fa-plus me-1"></i>Thêm Sản Phẩm Mới
        </router-link>
      </div>

      <div class="card-body p-4">
        <!-- Alert thông báo -->
        <div
          v-if="message"
          class="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          <i class="fas fa-check-circle me-2"></i>{{ message }}
          <button
            type="button"
            class="btn-close"
            @click="message = ''"
          ></button>
        </div>

        <!-- Bộ lọc tìm kiếm -->
        <BoLocSanPham @filter-change="fetchSanPhams" />

        <!-- Bảng danh sách -->
        <div class="table-responsive">
          <table class="table table-hover align-middle border">
            <thead class="table-light">
              <tr>
                <th width="10%">Mã SP</th>
                <th width="20%">Tên sản phẩm</th>
                <th width="10%">Thương hiệu</th>
                <th width="10%">Thể loại</th>

                <th width="10%">Số lượng biến thể</th>
                <th width="10%">Số lượng ảnh</th>
                <th width="15%">Giá đại diện</th>
                <th width="10%">Trạng thái</th>
                <th width="10%" class="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="7" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status"></div>
                </td>
              </tr>

              <tr v-else-if="sanPhams.length === 0">
                <td colspan="7" class="text-center py-4 text-muted">
                  Không tìm thấy sản phẩm nào.
                </td>
              </tr>

              <tr v-else v-for="sp in sanPhams" :key="sp.id">
                <td class="fw-bold text-secondary">{{ sp.id }}</td>
                <td>
                  <span class="fw-semibold text-dark">{{ sp.tensanpham }}</span>
                </td>
                <td>{{ sp.thuonghieu?.tenthuonghieu || sp.mathuonghieu }}</td>
                <td>{{ sp.theloai?.tentheloai || sp.matheloai }}</td>

                <td>{{ sp.tongso_bienthe_phuhop }}</td>

                <td>{{ sp.danhsach_anh.length }}</td>

                <td>
                  <span
                    v-if="sp.bienthe_daidien.gia"
                    class="text-danger fw-bold"
                  >
                    <span class="fw-semibold text-primary">
                      {{ formatCurrency(sp.bienthe_daidien.gia) }}
                    </span>
                    <div v-if="sp.dakhuyenmai" class="small text-danger">
                      <i class="fas fa-tag me-1"></i>
                      Còn: {{ formatCurrency(sp.bienthe_daidien.giasaugiam) }}
                    </div>
                  </span>
                  <span v-else class="text-muted small">Chưa có biến thể</span>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="sp.trangthai ? 'bg-success' : 'bg-secondary'"
                  >
                    {{ sp.trangthai ? "Đang bán" : "Ngừng bán" }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="btn-group">
                    <router-link
                      :to="`/admin/sanpham/edit/${sp.id}`"
                      class="btn btn-outline-primary btn-sm"
                      title="Chỉnh sửa"
                    >
                      <i class="fas fa-edit"></i>
                    </router-link>

                    <!-- NÚT CHI TIẾT SẢN PHẨM -->
                    <button
                      class="btn btn-outline-info"
                      title="Chi tiết & Quản lý ảnh"
                      @click="$router.push(`/admin/sanpham/${sp.id}`)"
                    >
                      <i class="fas fa-eye me-1"></i>
                    </button>
                    <button
                      class="btn btn-outline-danger btn-sm"
                      @click="confirmDelete(sp)"
                      title="Xóa"
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
import SanPhamService from "@/services/sanpham.service";
import BoLocSanPham from "@/components/BoLocSanPham.vue";

export default {
  name: "SanPhamAdmin",
  components: { BoLocSanPham },
  data() {
    return {
      sanPhams: [],
      loading: false,
      message: "",
    };
  },
  created() {
    this.fetchSanPhams();
  },
  methods: {
    async fetchSanPhams(filterParams) {
      this.loading = true;
      try {
        this.sanPhams = await SanPhamService.getAll(filterParams);
      } catch (error) {
        console.error("Lỗi khi tải danh sách sản phẩm:", error);
      } finally {
        this.loading = false;
      }
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    },

    async confirmDelete(sp) {
      if (
        confirm(
          `Bạn có chắc chắn muốn xóa sản phẩm "${sp.tensanpham}" (${sp.id})?`,
        )
      ) {
        try {
          await SanPhamService.delete(sp.id);
          this.message = "Đã xóa sản phẩm thành công!";
          this.fetchSanPhams();
        } catch (error) {
          alert(error.response?.data?.message || "Không thể xóa sản phẩm này!");
        }
      }
    },
  },
};
</script>
