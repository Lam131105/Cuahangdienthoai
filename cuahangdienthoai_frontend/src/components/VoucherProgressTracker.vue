<template>
  <div class="card shadow-sm border-0 mb-4 bg-light">
    <div class="card-body p-4">
      <!-- Tiêu đề Thanh Tiến Trình -->
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h5 class="fw-bold text-success mb-0">
          <i class="fas fa-trophy text-warning me-2"></i>Thanh Tiến Trình Mốc
          Tặng Voucher
        </h5>
        <div class="d-flex gap-2 align-items-center">
          <span class="badge bg-success rounded-pill px-3 py-2">
            Tổng cộng: {{ groupedDieuKiens.length }} mốc thưởng
          </span>
        </div>
      </div>

      <!-- Trường hợp chưa có mốc nào -->
      <div
        v-if="groupedDieuKiens.length === 0"
        class="text-center py-3 text-muted"
      >
        Chưa có mốc điều kiện nào được thiết lập.
      </div>

      <!-- Hiển thị Thanh Tiến Trình -->
      <div v-else class="progress-tracker-wrapper position-relative py-4 px-2">
        <!-- Đường ray nền xám (Tổng chiều dài) -->
        <div class="progress-line-bg"></div>

        <!-- 🟢 Đường màu sáng lấp đầy chạy theo mức tongChi -->
        <div
          class="progress-line-active"
          :style="{ width: progressWidth + '%' }"
        ></div>

        <!-- Danh sách các Mốc Thưởng đã Gom Nhóm -->
        <div
          class="d-flex justify-content-between align-items-start position-relative"
        >
          <div
            v-for="(group, index) in groupedDieuKiens"
            :key="group.mocchitoithieu"
            class="milestone-item text-center"
          >
            <!-- 🟢 Biểu tượng / Khối Mốc Thưởng (Sáng lên nếu đã đạt mốc) -->
            <div
              class="milestone-node shadow-sm"
              :class="{ active: isReached(group.mocchitoithieu) }"
              :title="`Mốc ${index + 1}: Chi tối thiểu ${formatCurrency(group.mocchitoithieu)} - ${isReached(group.mocchitoithieu) ? 'Đã đạt' : 'Chưa đạt'}`"
            >
              <i class="bi bi-gift-fill text-white fs-5"></i>
              <span class="milestone-number">{{ index + 1 }}</span>
            </div>
            <div
              v-if="isReached(group.mocchitoithieu)"
              class="badge bg-success-subtle text-success border border-success-subtle rounded-pill mt-1 text-uppercase fw-bold style-received-badge"
            >
              <i class="bi bi-check-circle-fill me-1"></i>Đã nhận
            </div>

            <!-- Nhãn Mốc Chi Tối Thiểu -->
            <div
              class="milestone-amount fw-bold mt-2"
              :class="
                isReached(group.mocchitoithieu) ? 'text-primary' : 'text-muted'
              "
            >
              {{ formatCurrency(group.mocchitoithieu) }}
            </div>

            <!-- Danh sách các Thẻ Phần Thưởng tại Mốc này -->
            <div class="rewards-container mt-2">
              <div
                v-for="(dk, rIndex) in group.rewards"
                :key="dk.id || rIndex"
                class="reward-badge card border-0 shadow-sm p-1 mb-1"
                :class="{ 'reward-reached': isReached(group.mocchitoithieu) }"
              >
                <div
                  class="reward-title fw-bold text-truncate"
                  :class="
                    isReached(group.mocchitoithieu)
                      ? 'text-primary'
                      : 'text-secondary'
                  "
                  :title="dk.phieugiamgia?.tenphieu"
                >
                  {{ dk.phieugiamgia?.tenphieu || "Phiếu giảm giá" }}
                </div>
                <div class="reward-quantity fw-semibold text-danger">
                  <i class="bi bi-ticket-perforated-fill me-1"></i>x{{
                    dk.soluongnhan
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "VoucherProgressTracker",
  props: {
    dieuKiens: {
      type: Array,
      default: () => [],
    },
    // 🟢 1. Thêm prop nhận tổng chi của khách hàng
    tongChi: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    // Gom nhóm các mốc có cùng giá trị 'mocchitoithieu'
    groupedDieuKiens() {
      const groups = {};

      this.dieuKiens.forEach((dk) => {
        const moc = dk.mocchitoithieu || 0;
        if (!groups[moc]) {
          groups[moc] = {
            mocchitoithieu: moc,
            rewards: [], // Chứa danh sách các voucher nhận được tại mốc này
          };
        }
        groups[moc].rewards.push(dk);
      });

      // Chuyển đối tượng nhóm thành mảng và sắp xếp tăng dần theo mốc tiền
      return Object.values(groups).sort(
        (a, b) => a.mocchitoithieu - b.mocchitoithieu,
      );
    },
    // Sắp xếp các mốc nhận voucher theo Mốc chi tối thiểu tăng dần
    sortedDieuKiens() {
      return [...this.dieuKiens].sort(
        (a, b) => (a.mocchitoithieu || 0) - (b.mocchitoithieu || 0),
      );
    },

    progressWidth() {
      if (!this.groupedDieuKiens.length) return 0;

      const maxMoc =
        this.groupedDieuKiens[this.groupedDieuKiens.length - 1].mocchitoithieu;
      if (maxMoc <= 0) return 0;

      // Tính % dựa trên tongChi so với mốc cao nhất
      const percent = (this.tongChi / maxMoc) * 100;
      return Math.min(Math.max(percent, 0), 100); // Giới hạn từ 0% đến 100%
    },
  },
  methods: {
    formatCurrency(value) {
      if (!value && value !== 0) return "0 đ";
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(value);
    },

    // 🟢 3. Helper kiểm tra xem mốc tiền này đã đạt được chưa
    isReached(mocchitoithieu) {
      return this.tongChi >= mocchitoithieu;
    },
  },
};
</script>

<style scoped>
.progress-tracker-wrapper {
  overflow-x: auto;
  white-space: nowrap;
}

/* Đường nối ngang phía sau các mốc */
.progress-line-bg {
  position: absolute;
  top: 48px;
  left: 5%;
  right: 5%;
  height: 6px;
  background: linear-gradient(90deg, #0d6efd 0%, #0dcaf0 100%);
  border-radius: 3px;
  z-index: 1;
}

/* Từng mốc trong tiến trình */
.milestone-item {
  position: relative;
  z-index: 2;
  flex: 1;
  min-width: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Nút Tròn Mốc Thưởng */
.milestone-node {
  width: 54px;
  height: 40px;

  /* Chèn ảnh voucher từ thư mục assets hoặc link URL */
  background-image: url("http://localhost:5000/uploads/phieugiamgia/phieugiamgia.png");
  /* Hoặc nếu dùng link trực tiếp: background-image: url('https://example.com/voucher.png'); */

  background-size: contain; /* Đảm bảo ảnh vừa vặn khung */
  background-repeat: no-repeat; /* Không lặp lại ảnh */
  background-position: center; /* Căn giữa ảnh */

  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition:
    transform 0.2s ease,
    filter 0.2s ease;
  cursor: pointer;
}

.milestone-node:hover {
  transform: scale(1.15) rotate(-3deg);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2)); /* Tạo bóng cho tấm ảnh */
}

.milestone-node:hover {
  transform: scale(1.15);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

/* Số thứ tự mốc ở góc trên nút */
.milestone-number {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: #dc3545;
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid white;
}

/* Chữ hiển thị số tiền mốc */
.milestone-amount {
  font-size: 0.9rem;
}

/* Container chứa các thẻ quà tặng tại cùng 1 mốc */
.rewards-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

/* Thẻ phần thưởng nhỏ gọn */
.reward-badge {
  background-color: #ffffff;
  border-radius: 6px;
  border-left: 3px solid #0d6efd !important;
  display: inline-block;
  text-align: center;
  padding: 4px 8px !important;
  min-width: 120px;
}

.reward-title {
  font-size: 0.75rem;
  max-width: 120px;
  line-height: 1.2;
}

.reward-quantity {
  font-size: 0.7rem;
  margin-top: 2px;
}

/* Đường nối xám mờ phía sau (Chưa đạt) */
.progress-line-bg {
  position: absolute;
  top: 48px;
  left: 5%;
  right: 5%;
  height: 6px;
  background: #0aa1ed; /* Màu xám */
  border-radius: 3px;
  z-index: 1;
}

/* 🟢 Đường màu sáng đại diện cho tiến trình ĐÃ ĐẠT ĐƯỢC */
.progress-line-active {
  position: absolute;
  top: 48px;
  left: 5%;
  height: 6px;
  background: linear-gradient(90deg, #076826 0%, #32f677 100%);
  border-radius: 3px;
  z-index: 1;
  transition: width 0.4s ease-in-out; /* Hiệu ứng mượt khi thanh tăng */
}

/* Tùy chỉnh nhẹ cho nhãn Đã nhận */
.style-received-badge {
  font-size: 0.65rem;
  padding: 2px 8px;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
