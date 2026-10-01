<template>
  <div class="col">
    <div class="card h-100 product-card shadow-sm border-0 position-relative">
      <!-- Checkbox chọn -->
      <div class="position-absolute top-0 end-0 m-2 z-index-1">
        <input
          type="checkbox"
          class="form-check-input fs-5 cursor-pointer"
          :value="item.id"
          :checked="isSelected"
          @change="$emit('toggle-select', item.id)"
        />
      </div>

      <!-- Badge Khuyến mãi -->
      <span
        v-if="item.bienthe?.dakhuyenmai"
        class="badge bg-danger position-absolute top-0 start-0 m-2 px-2 py-1 fs-7 rounded-pill"
      >
        <i class="fas fa-bolt me-1"></i>Giảm giá
      </span>

      <!-- Ảnh sản phẩm -->
      <div class="product-img-wrapper text-center p-3 mt-3">
        <img
          :src="getImageUrl(item.bienthe?.duongdananh)"
          class="img-fluid product-img"
          :alt="item.bienthe?.sanpham?.tensanpham"
        />
      </div>

      <div class="card-body d-flex flex-column justify-content-between p-3">
        <div>
          <h6
            class="card-title fw-bold text-dark text-truncate-2 mb-2"
            :title="item.bienthe?.sanpham?.tensanpham"
          >
            {{ item.bienthe?.sanpham?.tensanpham }}
          </h6>

          <!-- RAM/ROM/Màu -->
          <div class="mb-2">
            <span class="badge bg-light text-secondary border me-1">
              RAM: {{ item.bienthe?.ram?.dungluongram || "N/A" }}
            </span>
            <span class="badge bg-light text-secondary border me-1">
              ROM: {{ item.bienthe?.rom?.dungluongrom || "N/A" }}
            </span>
            <span class="badge bg-light text-secondary border">
              Màu: {{ item.bienthe?.mausac?.tenmau || "N/A" }}
            </span>
          </div>
        </div>

        <!-- Bộ chọn số lượng -->
        <div class="my-3">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <label class="fw-bold text-dark small mb-0">Số lượng:</label>
            <span class="text-muted extra-small"
              >(Còn {{ item.bienthe?.soluong }})</span
            >
          </div>
          <div class="input-group input-group-sm">
            <button
              class="btn btn-outline-secondary"
              type="button"
              :disabled="item.soluong <= 1"
              @click="changeQty(-1)"
            >
              -
            </button>
            <input
              v-model.number="item.soluong"
              type="number"
              class="form-control text-center fw-bold"
              min="1"
              :max="item.bienthe?.soluong"
              @change="$emit('update-qty', item)"
            />
            <button
              class="btn btn-outline-secondary"
              type="button"
              :disabled="item.soluong >= item.bienthe?.soluong"
              @click="changeQty(1)"
            >
              +
            </button>
          </div>
        </div>

        <!-- Giá tiền & Nút thao tác -->
        <div>
          <div class="mb-2">
            <template
              v-if="item.bienthe?.dakhuyenmai && item.bienthe?.giasaugiam"
            >
              <div class="text-danger fw-bold fs-6">
                {{ formatCurrency(item.bienthe.giasaugiam) }}
              </div>
              <div class="text-muted text-decoration-line-through extra-small">
                {{ formatCurrency(item.bienthe.gia) }}
              </div>
            </template>
            <template v-else>
              <div class="text-primary fw-bold fs-6">
                {{ formatCurrency(item.bienthe?.gia) }}
              </div>
            </template>
            <div class="text-danger fw-bold fs-6">
              Tổng cộng {{ formatCurrency(totalPrice) }}
            </div>
          </div>

          <div class="d-flex align-items-center gap-2 mt-2">
            <router-link
              :to="'/sanpham/' + item.bienthe?.sanpham?.id"
              class="btn btn-outline-primary btn-sm flex-grow-1 fw-bold rounded-pill"
            >
              Chi tiết
            </router-link>
            <button
              class="btn btn-outline-danger btn-sm rounded-circle"
              title="Xóa sản phẩm"
              @click.prevent="$emit('delete', item)"
            >
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CartItem",
  props: {
    item: { type: Object, required: true },
    isSelected: { type: Boolean, default: false },
  },
  computed: {
    totalPrice() {
      const gia = Number(
        this.item.bienthe?.giasaugiam || this.item.bienthe?.gia || 0,
      );
      return gia * Number(this.item.soluong || 1);
    },
  },
  methods: {
    changeQty(delta) {
      const newQty = this.item.soluong + delta;
      if (newQty >= 1 && newQty <= this.item.bienthe.soluong) {
        this.item.soluong = newQty;
        this.$emit("update-qty", this.item);
      }
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount || 0);
    },
    getImageUrl(fileName) {
      if (!fileName) return "";
      return fileName.startsWith("http")
        ? fileName
        : `http://localhost:5000${fileName}`;
    },
  },
};
</script>

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
</style>
