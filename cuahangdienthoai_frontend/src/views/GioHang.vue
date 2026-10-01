<template>
  <div class="container py-4 mb-5">
    <!-- Alert message -->
    <div v-if="message" class="alert alert-success alert-dismissible fade show">
      <i class="fas fa-check-circle me-2"></i>{{ message }}
      <button type="button" class="btn-close" @click="message = ''"></button>
    </div>

    <div
      v-if="voucherError"
      class="alert alert-danger alert-dismissible fade show"
    >
      <i class="fas fa-check-circle me-2"></i>{{ voucherError }}
      <button
        type="button"
        class="btn-close"
        @click="voucherError = ''"
      ></button>
    </div>

    <!-- Loading / Empty states -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Đang tải danh sách sản phẩm...</p>
    </div>

    <div v-else-if="chiTietGioHangs.length === 0" class="text-center py-5">
      <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
      <h5 class="text-secondary">Giỏ hàng của bạn đang trống</h5>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Top Bar Select All -->
      <div class="card p-3 mb-4 shadow-sm border-0 rounded-3">
        <div class="d-flex align-items-center justify-content-between">
          <div class="form-check mb-0">
            <input
              class="form-check-input"
              type="checkbox"
              id="selectAll"
              :checked="isAllSelected"
              @change="toggleSelectAll"
            />
            <label
              class="form-check-label fw-bold cursor-pointer"
              for="selectAll"
            >
              Chọn tất cả ({{ chiTietGioHangs.length }} sản phẩm)
            </label>
          </div>
          <span class="text-muted small">
            Đã chọn:
            <b class="text-primary">{{ selectedCartIds.length }}</b> sản phẩm
          </span>
        </div>
      </div>

      <!-- Danh sách Product Grid -->
      <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        <CartItem
          v-for="sp in chiTietGioHangs"
          :key="sp.id"
          :item="sp"
          :is-selected="selectedCartIds.includes(sp.id)"
          @toggle-select="toggleSelectItem"
          @update-qty="updateChitietGioHang"
          @delete="deleteChitietGioHang"
        />
      </div>
    </div>

    <!-- Sticky Bottom Checkout Bar -->
    <CartCheckoutBar
      v-if="chiTietGioHangs.length > 0"
      :vouchers="danhSachVoucher"
      :selected-voucher-id="selectedVoucherId"
      @update:selectedVoucherId="onVoucherChange"
      :selected-count="selectedCartIds.length"
      :preview-data="previewData"
      :loading-preview="loadingPreview"
      @checkout="proceedToCheckout"
    />
  </div>
</template>

<script>
import ChiTietGioHangService from "@/services/chitietgiohang.service";
import DonHangService from "@/services/donhang.service";
import ViVoucherService from "@/services/vivoucher.service";
import CartItem from "@/components/GioHang/CartItem.vue";
import CartCheckoutBar from "@/components/GioHang/CartCheckOutBar.vue";
export default {
  name: "GioHang",
  components: { CartItem, CartCheckoutBar },

  data() {
    return {
      chiTietGioHangs: [],
      danhSachVoucher: [],
      selectedCartIds: [],
      selectedVoucherId: "",
      previewData: null,
      loading: false,
      loadingPreview: false,
      message: "",
      currentUser: null,
      voucherError: "",
    };
  },

  computed: {
    isAllSelected() {
      return (
        this.chiTietGioHangs.length > 0 &&
        this.selectedCartIds.length === this.chiTietGioHangs.length
      );
    },
  },

  created() {
    this.getCurrentUser();
    if (this.currentUser?.id) {
      this.fetchChiTietGioHangs();
      this.fetchMyVouchers();
    }
  },

  methods: {
    async fetchChiTietGioHangs() {
      this.loading = true;
      try {
        this.chiTietGioHangs = await ChiTietGioHangService.getAll(
          this.currentUser.id,
        );
      } catch (error) {
        console.error("Lỗi khi tải danh sách sản phẩm:", error);
      } finally {
        this.loading = false;
      }
    },

    async fetchMyVouchers() {
      try {
        this.danhSachVoucher = await ViVoucherService.getByKhachHang(
          this.currentUser?.id,
        );
      } catch (error) {
        console.error("Lỗi lấy danh sách ví voucher:", error);
      }
    },

    toggleSelectItem(id) {
      const index = this.selectedCartIds.indexOf(id);
      if (index > -1) {
        this.selectedCartIds.splice(index, 1);
      } else {
        this.selectedCartIds.push(id);
      }
      this.handleCheckoutPreview();
    },

    toggleSelectAll(e) {
      this.selectedCartIds = e.target.checked
        ? this.chiTietGioHangs.map((sp) => sp.id)
        : [];
      this.handleCheckoutPreview();
    },

    onVoucherChange(val) {
      this.selectedVoucherId = val;
      this.handleCheckoutPreview();
    },

    async handleCheckoutPreview() {
      if (this.selectedCartIds.length === 0) {
        this.previewData = null;
        this.voucherError = "";
        return;
      }

      this.loadingPreview = true;
      this.voucherError = "";

      try {
        const payload = {
          chitietgiohangids: this.selectedCartIds,
          vivoucherid: this.selectedVoucherId || null,
        };
        const res = await DonHangService.previewcheckout(payload);

        if (
          res.status === "error" ||
          res.message?.includes("chưa đạt điều kiện")
        ) {
          this.handleVoucherFailure(res.message);
          return;
        }

        if (res.status === "success" || res.data) {
          this.previewData = res.data;
        }
      } catch (error) {
        let errorMsg = error.response?.data?.message;
        this.handleVoucherFailure(errorMsg);
      } finally {
        this.loadingPreview = false;
      }
    },

    async handleVoucherFailure(errorMessage) {
      this.voucherError = errorMessage;
      if (
        errorMessage?.startsWith(
          "Giá trị đơn hàng chưa đạt điều kiện tối thiểu",
        )
      ) {
        const giatoithieu = errorMessage.replace(
          "Giá trị đơn hàng chưa đạt điều kiện tối thiểu để áp dụng voucher",
          "",
        );
        this.voucherError = `Đơn hàng chưa đạt điều kiện tối thiểu ${this.formatCurrency(giatoithieu)} để áp dụng voucher này`;
      }
      this.selectedVoucherId = "";

      try {
        const res = await DonHangService.previewcheckout({
          chitietgiohangids: this.selectedCartIds,
          vivoucherid: null,
        });
        if (res.status === "success" || res.data) {
          this.previewData = res.data;
        }
      } catch (e) {
        console.error("Lỗi khi tải lại giá không voucher:", e);
      }
    },

    async updateChitietGioHang(sp) {
      try {
        await ChiTietGioHangService.update(sp.id, { soluong: sp.soluong });
        if (this.selectedCartIds.includes(sp.id)) {
          this.handleCheckoutPreview();
        }
      } catch (error) {
        alert(error.response?.data?.message || "Không thể cập nhật số lượng!");
      }
    },

    async deleteChitietGioHang(sp) {
      if (
        confirm(
          `Bạn có muốn xóa sản phẩm "${sp.bienthe.sanpham?.tensanpham}" không?`,
        )
      ) {
        try {
          await ChiTietGioHangService.delete(sp.id);
          this.message = "Đã xóa sản phẩm thành công!";

          // Xóa khỏi danh sách chọn nếu có
          this.selectedCartIds = this.selectedCartIds.filter(
            (id) => id !== sp.id,
          );
          this.fetchChiTietGioHangs();
        } catch (error) {
          alert(error.response?.data?.message || "Không thể xóa sản phẩm này!");
        }
      }
    },

    proceedToCheckout() {
      if (this.selectedCartIds.length === 0) return;
      this.$router.push({
        path: "/checkout",
        query: {
          items: JSON.stringify(this.selectedCartIds),
          voucher: this.selectedVoucherId || "",
        },
      });
    },

    getCurrentUser() {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) return null;
        this.currentUser = JSON.parse(userStr);
        return this.currentUser;
      } catch (e) {
        localStorage.removeItem("user");
        return null;
      }
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount || 0);
    },
  },
};
</script>
