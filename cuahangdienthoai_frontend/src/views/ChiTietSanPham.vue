<template>
  <div class="container py-4">
    <!-- Breadcrumb điều hướng -->
    <nav aria-label="breadcrumb" class="mb-4" v-if="sanpham">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <router-link to="/">Trang chủ</router-link>
        </li>
        <li class="breadcrumb-item active" aria-current="page">
          {{ sanpham.tensanpham }}
        </li>
      </ol>
    </nav>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Đang tải chi tiết sản phẩm...</p>
    </div>

    <!-- Chi tiết sản phẩm -->
    <div v-else-if="sanpham" class="row g-4">
      <!-- Cột Trái: Hình ảnh sản phẩm -->
      <div class="col-lg-5">
        <div
          class="card border-0 shadow-sm p-3 text-center sticky-top"
          style="top: 20px"
        >
          <div class="product-image-box text-center p-2 rounded bg-light mb-3">
            <img
              :src="getImageUrl(currentMainImage)"
              :alt="sanpham.tensanpham"
              class="img-fluid main-image"
            />
          </div>

          <!-- 2. Danh sách ảnh thu nhỏ (Thumbnails Carousel/Grid) -->
          <!-- Danh sách ảnh thu nhỏ: Luôn hiển thị dù có 1 hay nhiều ảnh -->
          <div class="thumbnail-list d-flex gap-2 overflow-x-auto pb-2">
            <div
              v-for="(img, index) in allImages"
              :key="index"
              class="thumbnail-item rounded border p-1 cursor-pointer position-relative"
              :class="{
                'border-primary border-2 active-thumb':
                  currentMainImage === img.duongdananh,
              }"
              @click="currentMainImage = img.duongdananh"
            >
              <img
                :src="getImageUrl(img.duongdananh)"
                class="img-fluid thumbnail-img"
                alt="Hình thu nhỏ"
              />
            </div>
          </div>

          <!-- Thương hiệu & Thể loại -->
          <div
            class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top"
          >
            <span class="badge bg-light text-dark border p-2">
              <i class="fas fa-tag me-1 text-primary"></i>
              {{ sanpham.thuonghieu?.tenthuonghieu }}
            </span>
            <span class="badge bg-light text-dark border p-2">
              <i class="fas fa-mobile-alt me-1 text-primary"></i>
              {{ sanpham.theloai?.tentheloai }}
            </span>
          </div>
          <!-- Nút Trái tim Thả thích / Bỏ thích -->
          <button
            class="btn btn-like-heart d-flex align-items-center justify-content-center gap-1 rounded-circle"
            :class="sanpham.dathich ? 'liked' : ''"
            @click.prevent="
              sanpham.dathich ? deleteFavorite(sanpham) : addFavorite(sanpham)
            "
            :title="sanpham.dathich ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'"
          >
            <!-- FontAwesome Heart Icon -->
            <i
              :class="
                sanpham.dathich
                  ? 'fas fa-heart text-danger'
                  : 'far fa-heart text-muted'
              "
            ></i>

            <!-- Số lượng lượt thích -->
            <span
              class="like-count small fw-bold"
              :class="sanpham.dathich ? 'text-danger' : 'text-muted'"
            >
              {{ sanpham.tongluotthich || 0 }}
            </span>
          </button>
        </div>
      </div>

      <!-- Cột Phải: Thông tin & Lựa chọn mua -->
      <div class="col-lg-7">
        <div class="card border-0 shadow-sm p-4 h-100">
          <!-- Tên sản phẩm -->
          <h2 class="fw-bold text-dark mb-2">{{ sanpham.tensanpham }}</h2>
          <p class="text-muted small mb-3">{{ sanpham.mota }}</p>

          <!-- Khối Khuyến mãi & Giá cả -->
          <div class="bg-light p-3 rounded mb-4">
            <div class="d-flex align-items-baseline gap-3">
              <!-- Giá sau giảm -->
              <span class="fs-2 fw-bold text-danger">
                {{ formatCurrency(selectedBienThe.giasaugiam) }}
              </span>

              <!-- Giá gốc (chỉ hiện khi có giảm giá) -->
              <span
                v-if="sanpham.dakhuyenmai === true"
                class="text-muted text-decoration-line-through fs-5"
              >
                {{ formatCurrency(selectedBienThe ? selectedBienThe.gia : 0) }}
              </span>

              <!-- Badge phần trăm hoặc số tiền giảm -->
              <div class="d-flex flex-wrap align-items-center gap-2 my-2">
                <div v-for="km in dsKhuyenMai" :key="km.id">
                  <span class="badge badge-masp bg-success">
                    {{ km.dotkhuyenmai.tendot }}
                  </span>
                </div>
              </div>
            </div>

            <small
              v-if="sanpham.dakhuyenmai === true"
              class="text-success fw-bold d-block mt-1"
            >
              <i class="fas fa-check-circle me-1"></i>Tiết kiệm được
              {{ formatCurrency(computedChietKhau) }}
            </small>
          </div>

          <!-- Lựa chọn Biến Thể -->
          <div class="mb-4">
            <label class="fw-bold mb-2 text-dark"
              >Chọn cấu hình & Màu sắc:</label
            >
            <div class="row g-2">
              <div
                v-for="bt in sanpham.danhsach_bienthe"
                :key="bt.id"
                class="col-6 col-md-4"
              >
                <button
                  type="button"
                  class="btn w-100 text-start p-2 border transition-all position-relative"
                  :class="{
                    'btn-outline-primary active border-primary border-2 bg-primary-subtle':
                      selectedBienThe && selectedBienThe.id === bt.id,
                    'btn-light':
                      !selectedBienThe || selectedBienThe.id !== bt.id,
                  }"
                  @click="selectBienThe(bt)"
                >
                  <div class="fw-bold fs-7">
                    Ram: {{ bt.ram.dungluongram }}| Rom:
                    {{ bt.rom.dungluongrom }}| Màu: {{ bt.mausac?.tenmau }}
                  </div>
                  <div class="small text-muted">
                    Kho:
                    <span
                      :class="
                        Number(bt.soluong) > 0 ? 'text-success' : 'text-danger'
                      "
                    >
                      {{ Number(bt.soluong) > 0 ? bt.soluong : "Hết hàng" }}
                    </span>
                  </div>

                  <!-- Icon check khi được chọn -->
                  <i
                    v-if="selectedBienThe && selectedBienThe.id === bt.id"
                    class="fas fa-check-circle text-primary position-absolute top-0 end-0 m-1"
                  ></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Chọn Số lượng & Nút Mua -->
          <div class="mb-4">
            <label class="fw-bold mb-2 text-dark">Số lượng mua:</label>
            <div class="d-flex align-items-center gap-3">
              <div class="input-group" style="width: 130px">
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  @click="soLuong > 1 ? soLuong-- : null"
                  :disabled="soLuong <= 1"
                >
                  -
                </button>
                <input
                  type="number"
                  class="form-control text-center fw-bold"
                  v-model.number="soLuong"
                  min="1"
                  :max="selectedBienThe ? selectedBienThe.soluong : 1"
                />
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  @click="
                    soLuong < (selectedBienThe ? selectedBienThe.soluong : 1)
                      ? soLuong++
                      : null
                  "
                  :disabled="
                    !selectedBienThe || soLuong >= selectedBienThe.soluong
                  "
                >
                  +
                </button>
              </div>

              <span class="text-muted small" v-if="selectedBienThe">
                (Còn {{ selectedBienThe.soluong }} sản phẩm sẵn có)
              </span>
            </div>
          </div>

          <!-- Nút bấm hành động -->
          <div class="d-grid gap-2 d-md-flex mt-auto">
            <button
              class="btn btn-outline-primary btn-lg flex-grow-1 fw-bold"
              :disabled="!selectedBienThe || selectedBienThe.soluong <= 0"
              @click="themVaoGioHang"
            >
              <i class="fas fa-cart-plus me-2"></i>Thêm vào giỏ hàng
            </button>
            <button
              class="btn btn-primary btn-lg flex-grow-1 fw-bold"
              :disabled="!selectedBienThe || selectedBienThe.soluong <= 0"
              @click="muaNgay"
            >
              <i class="fas fa-bolt me-2"></i>Mua ngay
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Khối Thông Số Kỹ Thuật -->
    <div
      v-if="sanpham && sanpham.thongsokythuat"
      class="card border-0 shadow-sm mt-4 p-4"
    >
      <h4 class="fw-bold text-primary mb-3">
        <i class="fas fa-cogs me-2"></i>Thông số kỹ thuật
      </h4>
      <div class="row">
        <div class="col-md-6">
          <table class="table table-striped table-bordered mb-0">
            <tbody>
              <tr v-if="sanpham.thongsokythuat.kichthuocmanhinh">
                <th width="40%">Kích thước màn hình</th>
                <td>{{ sanpham.thongsokythuat.kichthuocmanhinh }}</td>
              </tr>
              <tr v-if="sanpham.thongsokythuat.congnghemanhinh">
                <th>Công nghệ màn hình</th>
                <td>{{ sanpham.thongsokythuat.congnghemanhinh }}</td>
              </tr>
              <tr v-if="sanpham.thongsokythuat.chipset">
                <th>Chipset (CPU)</th>
                <td>{{ sanpham.thongsokythuat.chipset }}</td>
              </tr>
              <tr v-if="sanpham.thongsokythuat.dungluongpin">
                <th>Dung lượng Pin</th>
                <td>{{ sanpham.thongsokythuat.dungluongpin }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="col-md-6">
          <table class="table table-striped table-bordered mb-0">
            <tbody>
              <tr v-if="sanpham.thongsokythuat.camerasau">
                <th width="40%">Camera sau</th>
                <td>{{ sanpham.thongsokythuat.camerasau }}</td>
              </tr>
              <tr v-if="sanpham.thongsokythuat.cameratruoc">
                <th>Camera trước</th>
                <td>{{ sanpham.thongsokythuat.cameratruoc }}</td>
              </tr>
              <tr v-if="sanpham.thongsokythuat.congnghesac">
                <th>Cổng sạc / Công nghệ sạc</th>
                <td>{{ sanpham.thongsokythuat.congnghesac }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SanPhamService from "@/services/sanpham.service"; // Đường dẫn tới sanphamservice của bạn
import GioHangService from "@/services/giohang.service";
import ChiTietGioHangService from "@/services/chitietgiohang.service";
import YeuThichService from "@/services/yeuthich.service";

export default {
  name: "ChiTietSanPham",
  data() {
    return {
      currentUser: null,
      dsKhuyenMai: [],
      sanpham: null,
      loading: true,
      currentMainImage: "", // Lưu đường dẫn ảnh đang hiển thị lớn
      selectedBienThe: null, // Biến thể đang được người dùng chọn
      soLuong: 1,
      baseURL: "http://localhost:3000", // Cập nhật domain backend của bạn
    };
  },
  computed: {
    allImages() {
      if (!this.sanpham) return [];
      const images = [];

      // A. Lấy tất cả ảnh từ danhsach_anh

      this.sanpham.danhsach_anh.forEach((item) => {
        images.push({
          duongdananh: item.duongdananh,
        });
      });

      return images;
    },

    // 2. Tính số tiền giảm giá
    computedChietKhau() {
      if (!this.selectedBienThe) return 0;
      const giaGoc = Number(this.selectedBienThe.gia);
      const giaSauGiam = Number(this.selectedBienThe.giasaugiam);
      const giaChietKhau = giaGoc - giaSauGiam;
      return Number(giaChietKhau);
    },
  },

  async created() {
    this.getCurrentUser();
    await this.fetchDetail();
  },
  methods: {
    // Gọi API lấy dữ liệu chi tiết
    async fetchDetail() {
      this.loading = true;
      try {
        const params = {};
        if (this.currentUser && this.currentUser.id) {
          params.makhachhang = this.currentUser.id;
        }
        const id = this.$route.params.id; // Lấy ID từ URL /san-pham/:id
        this.sanpham = await SanPhamService.get(id, params);

        // Mặc định chọn biến thể đầu tiên còn hàng
        if (this.sanpham && this.sanpham.danhsach_bienthe.length > 0) {
          const available = this.sanpham.danhsach_bienthe.find(
            (bt) => Number(bt.soluong) > 0,
          );
          this.selectedBienThe = available || this.sanpham.danhsach_bienthe[0];
        }
        const mainImgObj = this.sanpham?.danhsach_anh?.find(
          (img) => img.laanhchinh,
        );
        this.currentMainImage = mainImgObj.duongdananh;
        this.dsKhuyenMai = this.sanpham.danhsach_chitietkhuyenmai || [];
      } catch (error) {
        console.error("Lỗi khi tải chi tiết sản phẩm:", error);
      } finally {
        this.loading = false;
      }
    },

    // Chọn biến thể
    selectBienThe(bt) {
      this.selectedBienThe = bt;
      this.soLuong = 1; // Reset số lượng mua về 1
      if (Number(bt.soluong) <= 0) {
        this.soLuong = 0;
      }
      if (bt.duongdananh) {
        this.currentMainImage = bt.duongdananh;
      }
    },

    //Thêm vào giỏ hàng
    async themVaoGioHang() {
      this.addingToCart = true;

      try {
        // Bước 1: Gọi GioHangService để lấy giỏ hàng của người dùng hiện tại
        const gioHangRes = await GioHangService.getByGioHang(
          this.currentUser.id,
        );

        // Kiểm tra giohang.id trả về
        const giohangid = gioHangRes?.id || gioHangRes?.giohang?.id;

        if (!giohangid) {
          alert("Không tìm thấy thông tin giỏ hàng của người dùng!");
          return;
        }

        // Bước 2: Chuẩn bị payload dữ liệu gửi tới ChiTietGioHangService
        const payload = {
          giohangid: giohangid,
          bientheid: this.selectedBienThe.id,
          soluong: parseInt(this.soLuong, 10),
        };

        // Bước 3: Gọi ChiTietGioHangService.create(payload)
        const response = await ChiTietGioHangService.create(payload);

        alert(response.message || "Thêm sản phẩm vào giỏ hàng thành công!");
      } catch (error) {
        console.error("Lỗi khi thêm vào giỏ hàng:", error);

        // Bắt các thông báo lỗi trả về từ ApiError của Backend
        const errorMessage = error.response?.data?.message;

        if (errorMessage) {
          alert(`Lỗi: ${errorMessage}`);
        } else {
          alert("Đã xảy ra lỗi kết nối khi thêm vào giỏ hàng!");
        }
      } finally {
        this.addingToCart = false;
      }
    },

    // Mua ngay
    muaNgay() {
      this.themVaoGioHang();
      this.$router.push("/gio-hang");
    },

    // Ghép URL đường dẫn ảnh
    getImageUrl(fileName) {
      if (!fileName) return "";
      if (fileName.startsWith("http")) return fileName;
      return `http://localhost:5000${fileName}`;
    },

    // Định dạng tiền tệ VND
    formatCurrency(value) {
      if (!value && value !== 0) return "0 đ";
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
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

<style scoped>
.product-image-box {
  height: 380px;
}
.main-image {
  max-height: 100%;
  object-fit: contain;
}
.transition-all {
  transition: all 0.2s ease-in-out;
}
.fs-7 {
  font-size: 0.875rem;
}

/* Khung chứa ảnh lớn ở trên */
.product-image-box {
  height: 350px; /* Chiều cao cố định cho ảnh lớn */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.main-image {
  max-height: 100%;
  object-fit: contain;
  transition: all 0.2s ease-in-out;
}

/* Khung chứa danh sách ảnh nhỏ ở dưới */
.thumbnail-list {
  scrollbar-width: thin;
}

/* Từng khung ảnh nhỏ: Kích thước cố định 65px x 65px (nhỏ hơn hẳn ảnh trên) */
.thumbnail-item {
  width: 65px;
  height: 66px;
  flex-shrink: 0; /* Giữ nguyên kích thước khi danh sách cuộn ngang */
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.thumbnail-item:hover,
/* Khi được chọn: Đổi màu viền và làm nét cả 4 cạnh */
.active-thumb {
  border-color: #0d6efd !important; /* Màu xanh Primary */
  box-shadow: 0 0 0 1px #0d6efd; /* Tạo viền 2px đều 4 cạnh không bị đè */
}

/* Ảnh bên trong ô thu nhỏ */
.thumbnail-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.fs-8 {
  font-size: 0.6rem;
}

.cursor-pointer {
  cursor: pointer;
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
