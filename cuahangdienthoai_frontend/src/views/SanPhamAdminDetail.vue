<template>
  <div class="container-fluid py-4">
    <!-- Header Page -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="fw-bold mb-1">
          Chi Tiết Sản Phẩm: {{ sanPham.tensanpham || "Đang tải..." }}
        </h4>
        <span class="badge badge-masp bg-secondary"
          >Mã SP: {{ masanpham }}</span
        >
        <div v-if="dsKhuyenMai.length === 0" class="text-muted">
          <p class="mb-0 text-danger">Hiện tại chưa có khuyến mãi nào.</p>
        </div>

        <div v-else>
          <!-- Khung chứa chung để ép các badge xếp trên cùng 1 hàng -->
          <div class="d-flex flex-wrap align-items-center gap-2 my-2">
            <div v-for="km in dsKhuyenMai" :key="km.id">
              <router-link
                :to="{
                  name: 'dotkhuyenmai.edit',
                  params: { id: km.dotkhuyenmai.id },
                }"
              >
                <span class="badge badge-masp bg-success">
                  {{ km.dotkhuyenmai.tendot }}
                </span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <button
        class="btn btn-outline-secondary btn-sm"
        @click="$router.push('/admin/sanpham')"
      >
        <i class="fas fa-arrow-left me-1"></i> Quay lại danh sách
      </button>
    </div>

    <!-- Tabs Navigation -->
    <ul class="nav nav-tabs mb-4 border-bottom-0">
      <li class="nav-item">
        <button
          class="nav-item-tab"
          :class="{ active: activeTab === 'images' }"
          @click="activeTab = 'images'"
        >
          <i class="fas fa-images me-2"></i>Quản Lý Bộ Ảnh
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-item-tab"
          :class="{ active: activeTab === 'variants' }"
          @click="activeTab = 'variants'"
        >
          <i class="fas fa-boxes me-2"></i>Quản Lý Biến Thể
        </button>
      </li>
    </ul>

    <!-- COMPONENT CON TAB 1: ẢNH SẢN PHẨM -->
    <AnhSanPhamTab v-if="activeTab === 'images'" :masanpham="masanpham" />

    <!-- COMPONENT CON TAB 2: BIẾN THỂ -->
    <BienTheTab v-if="activeTab === 'variants'" :masanpham="masanpham" />
  </div>
</template>

<script>
import SanPhamService from "@/services/sanpham.service";
import AnhSanPhamTab from "@/components/SanPham/AnhSanPham.vue";
import BienTheTab from "@/components/SanPham/BienThe.vue";

export default {
  name: "SanPhamAdminDetail",
  components: {
    AnhSanPhamTab,
    BienTheTab,
  },
  data() {
    return {
      masanpham: this.$route.params.id,
      activeTab: "images",
      sanPham: {},
      dsKhuyenMai: [],
    };
  },
  async created() {
    await this.fetchSanPhamDetail();
  },
  methods: {
    async fetchSanPhamDetail() {
      try {
        const res = await SanPhamService.get(this.masanpham);
        this.sanPham = res || {};
        this.dsKhuyenMai = res.danhsach_chitietkhuyenmai || [];
      } catch (error) {
        console.error("Lỗi lấy thông tin sản phẩm:", error);
      }
    },
  },
};
</script>

<style scoped>
.nav-item-tab {
  border: none;
  background: transparent;
  padding: 0.5rem 1.25rem;
  font-weight: 600;
  border-bottom: 3px solid transparent;
}
.nav-item-tab.active {
  color: #0d6efd;
  border-bottom-color: #0d6efd;
}

.badge-masp {
  color: #ffffff;
  font-size: 1rem; /* Cỡ chữ to (tương đương 16px) */
  font-weight: 600; /* Chữ đậm vừa phải */
  padding: 0.5em 0.8em; /* Tăng khoảng cách trong để badge cân đối */
  border-radius: 6px; /* Bo góc nhẹ */
  letter-spacing: 0.5px; /* Cắt nét chữ nhìn hiện đại */
}
</style>
