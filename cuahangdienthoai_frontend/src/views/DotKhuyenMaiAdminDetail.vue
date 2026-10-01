<template>
  <div class="container-fluid py-4">
    <!-- Header & Thẻ thông tin Đợt Khuyến Mãi -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="fw-bold text-primary mb-1">Chi Tiết Đợt Khuyến Mãi</h3>
        <p class="text-muted mb-0">
          Mã đợt: <strong>{{ id }}</strong>
        </p>
      </div>
      <router-link :to="{ name: 'dotkhuyenmai' }" class="btn btn-secondary">
        <i class="fas fa-arrow-left me-1"></i> Quay lại danh sách
      </router-link>
    </div>

    <!-- Thông tin tổng quan đợt khuyến mãi -->
    <div
      v-if="dotKhuyenMaiInfo"
      class="card shadow-sm mb-4 border-start border-primary border-4"
    >
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-4">
            <h5 class="fw-bold text-dark mb-1">
              {{ dotKhuyenMaiInfo.tendot }}
            </h5>
            <span class="badge bg-success fs-6">
              Mức giảm: {{ dotKhuyenMaiInfo.giatrigiam }}
              {{ dotKhuyenMaiInfo.loaigiamgia === "Phần trăm" ? "%" : "VNĐ" }}
            </span>
          </div>
          <div class="col-md-5">
            <small class="text-muted d-block">Thời gian áp dụng:</small>
            <span class="text-success fw-semibold"
              ><i class="far fa-clock me-1"></i
              >{{ formatDate(dotKhuyenMaiInfo.ngaybatdau) }}</span
            >
            <span class="mx-2">đến</span>
            <span class="text-danger fw-semibold"
              ><i class="far fa-clock me-1"></i
              >{{ formatDate(dotKhuyenMaiInfo.ngayketthuc) }}</span
            >
          </div>
          <div class="col-md-3 text-end">
            <button class="btn btn-primary" @click="openModalAdd">
              <i class="fas fa-plus-circle me-1"></i> Thêm Sản Phẩm Mới
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bảng danh sách sản phẩm trong đợt -->
    <div class="card shadow-sm">
      <div
        class="card-header bg-white py-3 d-flex justify-content-between align-items-center"
      >
        <h5 class="m-0 fw-bold">
          Danh sách sản phẩm được áp dụng ({{ dsChiTiet.length }})
        </h5>
        <button
          v-if="selectedIds.length > 0"
          class="btn btn-sm btn-danger"
          @click="handleDeleteSelected"
        >
          <i class="fas fa-trash me-1"></i> Xóa {{ selectedIds.length }} mục đã
          chọn
        </button>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 40px" class="text-center">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    :checked="isAllSelected"
                    @change="toggleSelectAll"
                  />
                </th>
                <th>Mã CTKM</th>
                <th>Mã Sản Phẩm/Biến Thể</th>
                <th>Tên Sản Phẩm</th>
                <th class="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="5" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status"></div>
                </td>
              </tr>
              <tr v-else-if="dsChiTiet.length === 0">
                <td colspan="5" class="text-center py-4 text-muted">
                  Đợt khuyến mãi này chưa có sản phẩm nào. Bấm "Thêm Sản Phẩm
                  Mới" để gán sản phẩm vào đợt.
                </td>
              </tr>
              <tr v-else v-for="item in dsChiTiet" :key="item.id">
                <td class="text-center">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    :value="item.id"
                    v-model="selectedIds"
                  />
                </td>
                <td>
                  <strong>{{ item.id }}</strong>
                </td>
                <td>
                  <span class="badge bg-secondary">{{ item.masanpham }}</span>
                </td>
                <td class="fw-semibold">
                  {{ item.sanpham?.tensanpham || item.sanpham?.ten || "N/A" }}
                </td>
                <td class="text-center">
                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="handleDeleteSingle(item.id)"
                  >
                    <i class="fas fa-trash"></i> Xóa
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Thêm Sản Phẩm Vào Đợt Khuyến Mãi -->
    <div class="modal fade" id="chiTietModal" tabindex="-1" ref="chiTietModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">
              Thêm Sản Phẩm Vào Đợt Khuyến Mãi
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModal"
            ></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label fw-semibold"
                >Chọn các sản phẩm áp dụng:</label
              >
              <p class="text-muted small mb-2">
                Tích chọn một hoặc nhiều sản phẩm/biến thể cần áp dụng đợt
                khuyến mãi này.
              </p>

              <!-- Ô tìm kiếm sản phẩm trong modal -->
              <input
                v-model="searchSanPham"
                type="text"
                class="form-control mb-3"
                placeholder="Tìm kiếm sản phẩm theo tên hoặc mã..."
              />

              <!-- Danh sách tích chọn sản phẩm -->
              <div
                class="border rounded p-3"
                style="max-height: 300px; overflow-y: auto"
              >
                <div
                  v-if="dsSanPhamFiltered.length === 0"
                  class="text-muted text-center py-3"
                >
                  Không tìm thấy sản phẩm phù hợp
                </div>
                <div
                  v-for="sp in dsSanPhamFiltered"
                  :key="sp.id"
                  class="form-check py-1 border-bottom"
                >
                  <input
                    type="checkbox"
                    class="form-check-input"
                    :id="'sp-' + sp.id"
                    :value="sp.id"
                    v-model="selectedSanPhamAdd"
                    :disabled="isSanPhamInDot(sp.id)"
                  />
                  <label
                    class="form-check-label d-flex justify-content-between cursor-pointer"
                    :for="'sp-' + sp.id"
                  >
                    <span
                      ><strong>[{{ sp.id }}]</strong>
                      {{ sp.tensanpham || sp.ten }}</span
                    >
                    <span
                      v-if="isSanPhamInDot(sp.id)"
                      class="badge bg-warning text-dark"
                      >Đã có trong đợt</span
                    >
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              Hủy
            </button>
            <button
              type="button"
              class="btn btn-primary"
              :disabled="submitting || selectedSanPhamAdd.length === 0"
              @click="handleSubmitAdd"
            >
              <i
                class="fas"
                :class="submitting ? 'fa-spinner fa-spin' : 'fa-save'"
              ></i>
              Thêm {{ selectedSanPhamAdd.length }} sản phẩm đã chọn
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Modal from "bootstrap/js/dist/modal";
import ChiTietDotKhuyenMaiService from "@/services/chitietdotkhuyenmai.service";
import DotKhuyenMaiService from "@/services/dotkhuyenmai.service";
import SanPhamService from "@/services/sanpham.service";

export default {
  name: "ChiTietDotKhuyenMaiAdmin",
  props: {
    id: {
      type: String,
      required: true, // Lấy madotkhuyenmai từ Route URL
    },
  },
  data() {
    return {
      dotKhuyenMaiInfo: null,
      dsChiTiet: [],
      dsSanPham: [],
      selectedIds: [], // Dùng để xóa hàng loạt
      selectedSanPhamAdd: [], // Dùng để chọn nhiều SP trong Modal
      searchSanPham: "",
      loading: false,
      submitting: false,
      modalInstance: null,
    };
  },
  computed: {
    // Tìm kiếm danh sách sản phẩm trong Modal
    dsSanPhamFiltered() {
      if (!this.searchSanPham.trim()) return this.dsSanPham;
      const key = this.searchSanPham.toLowerCase();
      return this.dsSanPham.filter(
        (sp) =>
          sp.id.toLowerCase().includes(key) ||
          (sp.tensanpham && sp.tensanpham.toLowerCase().includes(key)),
      );
    },
    // Kiểm tra checkbox chọn tất cả
    isAllSelected() {
      return (
        this.dsChiTiet.length > 0 &&
        this.selectedIds.length === this.dsChiTiet.length
      );
    },
  },
  async created() {
    await this.fetchDotKhuyenMaiInfo();
    await this.fetchChiTiet();
    await this.fetchDataSanPham();
  },
  methods: {
    // 1. Tải thông tin đợt khuyến mãi
    async fetchDotKhuyenMaiInfo() {
      try {
        this.dotKhuyenMaiInfo = await DotKhuyenMaiService.get(this.id);
      } catch (error) {
        console.error("Lỗi lấy thông tin đợt khuyến mãi:", error);
      }
    },

    // 2. Tải danh sách chi tiết các sản phẩm trong đợt này
    async fetchChiTiet() {
      this.loading = true;
      try {
        this.dsChiTiet = await ChiTietDotKhuyenMaiService.getByDotKhuyenMai(
          this.id,
        );
        this.selectedIds = [];
      } catch (error) {
        console.error("Lỗi lấy chi tiết khuyến mãi:", error);
      } finally {
        this.loading = false;
      }
    },

    // 3. Tải tất cả Sản phẩm để đưa vào Modal chọn
    async fetchDataSanPham() {
      try {
        this.dsSanPham = await SanPhamService.getAll();
      } catch (error) {
        console.error("Lỗi lấy danh sách sản phẩm:", error);
      }
    },

    // Kiểm tra sản phẩm đã được gán vào đợt chưa (để disable checkbox)
    isSanPhamInDot(masanpham) {
      return this.dsChiTiet.some((item) => item.masanpham === masanpham);
    },

    // Quản lý Modal an toàn
    getModalInstance() {
      if (!this.modalInstance && this.$refs.chiTietModal) {
        this.modalInstance = new Modal(this.$refs.chiTietModal);
      }
      return this.modalInstance;
    },

    openModalAdd() {
      this.selectedSanPhamAdd = [];
      this.searchSanPham = "";
      this.$nextTick(() => {
        const modal = this.getModalInstance();
        if (modal) modal.show();
      });
    },

    closeModal() {
      const modal = this.getModalInstance();
      if (modal) modal.hide();
    },

    // 4. Xử lý thêm sản phẩm hàng loạt (gọi API createMany)
    async handleSubmitAdd() {
      if (this.selectedSanPhamAdd.length === 0) return;

      this.submitting = true;
      try {
        const payload = {
          madotkhuyenmai: this.id,
          masanphams: this.selectedSanPhamAdd,
        };
        await ChiTietDotKhuyenMaiService.createMany(payload);
        alert("Đã thêm sản phẩm vào đợt khuyến mãi thành công!");
        this.closeModal();
        await this.fetchChiTiet();
      } catch (error) {
        alert(
          error.response?.data?.message || "Đã xảy ra lỗi khi thêm sản phẩm.",
        );
      } finally {
        this.submitting = false;
      }
    },

    // 5. Xóa 1 bản ghi
    async handleDeleteSingle(id) {
      if (confirm(`Bạn có chắc chắn muốn xóa mã chi tiết ${id}?`)) {
        try {
          await ChiTietDotKhuyenMaiService.deleteMany([id]);
          alert("Xóa thành công!");
          await this.fetchChiTiet();
        } catch (error) {
          alert(error.response?.data?.message || "Lỗi khi xóa!");
        }
      }
    },

    // 6. Xóa hàng loạt
    async handleDeleteSelected() {
      if (
        confirm(
          `Xác nhận xóa ${this.selectedIds.length} sản phẩm khỏi đợt khuyến mãi?`,
        )
      ) {
        try {
          await ChiTietDotKhuyenMaiService.deleteMany(this.selectedIds);
          alert("Đã xóa các mục đã chọn!");
          await this.fetchChiTiet();
        } catch (error) {
          alert(error.response?.data?.message || "Lỗi khi xóa nhiều mục!");
        }
      }
    },

    // Chọn tất cả
    toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedIds = [];
      } else {
        this.selectedIds = this.dsChiTiet.map((item) => item.id);
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
</style>
