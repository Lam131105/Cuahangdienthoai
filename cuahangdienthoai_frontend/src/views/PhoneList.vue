<template>
  <div class="container py-4">
    <!-- Bộ lọc tìm kiếm & Thống kê ngắn -->
    <div class="mb-4">
      <BoLocSanPham @filter-change="fetchSanPhams" />
    </div>

    <!-- Trạng thái Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Đang tải danh sách sản phẩm...</p>
    </div>

    <!-- Không tìm thấy sản phẩm -->
    <div v-else-if="sanPhams.length === 0" class="text-center py-5">
      <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
      <h5 class="text-secondary">Không tìm thấy sản phẩm nào phù hợp</h5>
    </div>

    <!-- Danh sách Sản Phẩm dạng Grid / Card -->
    <div
      v-else
      class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4"
    >
      <div v-for="sp in sanPhams" :key="sp.id" class="col">
        <div
          class="card h-100 product-card shadow-sm border-0 position-relative"
        >
          <!-- Badge Khuyến mãi (nếu có) -->
          <span
            v-if="sp.dakhuyenmai"
            class="badge bg-danger position-absolute top-0 start-0 m-2 px-2 py-1 fs-7 rounded-pill"
          >
            <i class="fas fa-bolt me-1"></i>Giảm giá
          </span>
          <!-- Hình ảnh đại diện -->
          <div class="product-img-wrapper text-center p-3">
            <img
              :src="getImageUrl(sp.danhsach_anh[0].duongdananh)"
              class="img-fluid product-img"
              :alt="sp.tensanpham"
            />
          </div>

          <div class="card-body d-flex flex-column justify-content-between p-3">
            <div>
              <!-- Tên sản phẩm -->
              <h6
                class="card-title fw-bold text-dark text-truncate-2 mb-2"
                :title="sp.tensanpham"
              >
                {{ sp.tensanpham }}
              </h6>

              <!-- Cấu hình đại diện (RAM / ROM / Màu) -->
              <div v-if="sp.bienthe_daidien" class="mb-2">
                <span class="badge bg-light text-secondary border me-1">
                  Ram: {{ sp.bienthe_daidien.ram?.dungluongram || "N/A" }}
                </span>
                <span class="badge bg-light text-secondary border me-1">
                  Rom: {{ sp.bienthe_daidien.rom?.dungluongrom || "N/A" }}
                </span>
                <span class="badge bg-light text-secondary border">
                  Màu: {{ sp.bienthe_daidien.mausac?.tenmau || "N/A" }}
                </span>
              </div>
            </div>

            <!-- Giá tiền & Nút Thao Tác -->
            <div class="mt-3">
              <div v-if="sp.bienthe_daidien" class="mb-2">
                <!-- Trường hợp CÓ giảm giá -->
                <template
                  v-if="sp.dakhuyenmai && sp.bienthe_daidien.giasaugiam"
                >
                  <div class="text-danger fw-bold fs-5">
                    {{ formatCurrency(sp.bienthe_daidien.giasaugiam) }}
                  </div>
                  <div class="text-muted text-decoration-line-through small">
                    {{ formatCurrency(sp.bienthe_daidien.gia) }}
                  </div>
                </template>

                <!-- Trường hợp Giá thường -->
                <template v-else>
                  <div class="text-primary fw-bold fs-5">
                    {{ formatCurrency(sp.bienthe_daidien.gia) }}
                  </div>
                </template>
              </div>

              <!-- Hết hàng / Chưa có biến thể -->
              <div v-else class="text-muted small mb-2">Đang cập nhật giá</div>

              <!-- Hàng nút: Nút Xem Chi Tiết + Nút Trái Tim Lượt Thích -->
              <div class="d-flex align-items-center gap-2 mt-2">
                <!-- Nút Xem chi tiết -->
                <router-link
                  :to="'/sanpham/' + sp.id"
                  class="btn btn-outline-primary btn-sm flex-grow-1 fw-bold rounded-pill"
                >
                  Xem chi tiết
                </router-link>

                <!-- Nút Trái tim Thả thích / Bỏ thích -->
                <button
                  class="btn btn-like-heart d-flex align-items-center justify-content-center gap-1 rounded-circle"
                  :class="sp.dathich ? 'liked' : ''"
                  @click.prevent="
                    sp.dathich ? deleteFavorite(sp) : addFavorite(sp)
                  "
                  :title="sp.dathich ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'"
                >
                  <!-- FontAwesome Heart Icon -->
                  <i
                    :class="
                      sp.dathich
                        ? 'fas fa-heart text-danger'
                        : 'far fa-heart text-muted'
                    "
                  ></i>

                  <!-- Số lượng lượt thích -->
                  <span
                    class="like-count small fw-bold"
                    :class="sp.dathich ? 'text-danger' : 'text-muted'"
                  >
                    {{ sp.tongluotthich || 0 }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* CSS Tối ưu giao diện sản phẩm */
.product-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  border-radius: 12px;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12) !important;
}

.product-img-wrapper {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
}

.product-img {
  max-height: 100%;
  object-fit: contain;
}

/* Giới hạn tên sản phẩm tối đa 2 dòng */
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.5rem;
}

.fs-7 {
  font-size: 0.75rem;
}

/* Styling cho Nút Trái tim */
.btn-like-heart {
  border: 1px solid #dee2e6;
  background-color: #f8f9fa;
  padding: 6px 12px;
  border-radius: 50px !important;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.btn-like-heart:hover {
  background-color: #ffe6e6;
  border-color: #ffb3b3;
}

.btn-like-heart.liked {
  background-color: #fff0f0;
  border-color: #ffcccc;
}

/* Hiệu ứng nảy nhẹ khi bấm */
.btn-like-heart:active i {
  transform: scale(1.3);
  transition: transform 0.1s ease;
}

.btn-like-heart i {
  font-size: 1rem;
  transition: color 0.2s ease;
}
</style>

<script>
import SanPhamService from "@/services/sanpham.service";
import YeuThichService from "@/services/yeuthich.service";
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
    this.getCurrentUser();
    this.fetchSanPhams();
  },
  methods: {
    async fetchSanPhams(filterParams) {
      this.loading = true;
      try {
        const params = { ...filterParams };
        if (this.currentUser && this.currentUser.id) {
          params.makhachhang = this.currentUser.id;
        }
        this.sanPhams = await SanPhamService.getAllForKhachHang(params);
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

    getImageUrl(fileName) {
      if (!fileName) return "";
      if (fileName.startsWith("http")) return fileName;
      return `http://localhost:5000${fileName}`;
    },

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
        // this.filters.makhachhang = this.currentUser.id || "";
        return this.currentUser;
      } catch (e) {
        console.error("Lỗi trích xuất thông tin người dùng:", e);
        this.currentUser = null;
        localStorage.removeItem("user");
        return null;
      }
    },

    async addFavorite(sp) {
      {
        try {
          const payload = {
            masanpham: sp.id,
            makhachhang: this.currentUser.id,
          };
          await YeuThichService.create(payload);
          sp.tongluotthich = sp.tongluotthich + 1;
          sp.dathich = true;
          this.message = "Đã thích sản phẩm thành công!";
          // this.fetchSanPhams();
        } catch (error) {
          alert(
            error.response?.data?.message || "Không thể thích sản phẩm này!",
          );
        }
      }
    },

    async deleteFavorite(sp) {
      {
        try {
          const params = {
            masanpham: sp.id,
            makhachhang: this.currentUser.id,
          };
          await YeuThichService.delete(params);
          sp.tongluotthich = sp.tongluotthich - 1;
          sp.dathich = false;
          this.message = "Đã xóa sản phẩm thành công!";
          // this.fetchSanPhams();
        } catch (error) {
          alert(error.response?.data?.message || "Không thể xóa sản phẩm này!");
        }
      }
    },
  },
};
</script>
