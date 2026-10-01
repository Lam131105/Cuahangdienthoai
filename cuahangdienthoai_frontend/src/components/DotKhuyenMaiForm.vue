<template>
  <form @submit.prevent="submitForm" class="card shadow-sm p-4">
    <div class="row g-3">
      <!-- Tên Đợt Khuyến Mãi -->
      <div class="col-12">
        <label class="form-label fw-semibold"
          >Tên đợt khuyến mãi <span class="text-danger">*</span></label
        >
        <input
          v-model="formData.tendot"
          type="text"
          class="form-control"
          placeholder="Nhập tên đợt khuyến mãi (VD: Flash Sale Mùa Hè)"
          required
        />
      </div>

      <!-- Loại Giảm Giá -->
      <div class="col-md-6">
        <label class="form-label fw-semibold"
          >Loại giảm giá <span class="text-danger">*</span></label
        >
        <select v-model="formData.loaigiamgia" class="form-select" required>
          <option value="">-- Chọn loại giảm giá --</option>
          <option value="Phần trăm">Phần trăm (%)</option>
          <option value="Tiền cố định">Số tiền cố định (VNĐ)</option>
        </select>
      </div>

      <!-- Giá Trị Giảm -->
      <div class="col-md-6">
        <label class="form-label fw-semibold"
          >Giá trị giảm <span class="text-danger">*</span></label
        >
        <div class="input-group">
          <input
            v-model.number="formData.giatrigiam"
            type="number"
            min="0"
            :max="formData.loaigiamgia === 'Phần trăm' ? 100 : undefined"
            step="any"
            class="form-control"
            placeholder="Nhập giá trị..."
            required
          />
          <span class="input-group-text">
            {{ formData.loaigiamgia === "Phần trăm" ? "%" : "VNĐ" }}
          </span>
        </div>
      </div>

      <!-- Ngày Bắt Đầu -->
      <div class="col-md-6">
        <label class="form-label fw-semibold"
          >Ngày bắt đầu <span class="text-danger">*</span></label
        >
        <input
          v-model="formData.ngaybatdau"
          type="datetime-local"
          class="form-control"
          required
        />
      </div>

      <!-- Ngày Kết Thúc -->
      <div class="col-md-6">
        <label class="form-label fw-semibold"
          >Ngày kết thúc <span class="text-danger">*</span></label
        >
        <input
          v-model="formData.ngayketthuc"
          type="datetime-local"
          class="form-control"
          required
        />
      </div>

      <!-- Thông báo lỗi Client Validate -->
      <div v-if="errorMessage" class="col-12 alert alert-danger mb-0">
        <i class="fas fa-exclamation-circle me-2"></i>{{ errorMessage }}
      </div>

      <!-- Nút thao tác -->
      <div class="col-12 d-flex justify-content-end gap-2 mt-4">
        <button
          type="button"
          class="btn btn-secondary"
          @click="$router.push({ name: 'dotkhuyenmai' })"
        >
          <i class="fas fa-arrow-left me-1"></i> Quay lại
        </button>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          <i
            class="fas"
            :class="submitting ? 'fa-spinner fa-spin' : 'fa-save'"
          ></i>
          {{ isEdit ? "Cập Nhật" : "Tạo Mới" }}
        </button>
      </div>
    </div>
  </form>
</template>

<script>
export default {
  name: "DotKhuyenMaiForm",
  props: {
    initialData: {
      type: Object,
      default: () => ({}),
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    submitting: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["submit-form"],
  data() {
    return {
      formData: {
        tendot: "",
        loaigiamgia: "Phần trăm",
        giatrigiam: 0,
        ngaybatdau: "",
        ngayketthuc: "",
      },
      errorMessage: "",
    };
  },
  watch: {
    initialData: {
      immediate: true,
      handler(val) {
        if (val && Object.keys(val).length > 0) {
          this.formData = {
            ...val,
            ngaybatdau: this.formatToDatetimeLocal(val.ngaybatdau),
            ngayketthuc: this.formatToDatetimeLocal(val.ngayketthuc),
          };
        }
      },
    },
  },
  methods: {
    // Chuyển ISO Date sang định dạng input datetime-local (YYYY-MM-THH:mm)
    formatToDatetimeLocal(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localISOTime = new Date(date.getTime() - tzOffset)
        .toISOString()
        .slice(0, 16);
      return localISOTime;
    },
    submitForm() {
      this.errorMessage = "";

      // Kiểm tra Logic ngày
      if (
        new Date(this.formData.ngaybatdau) >=
        new Date(this.formData.ngayketthuc)
      ) {
        this.errorMessage = "Ngày bắt đầu phải nhỏ hơn ngày kết thúc!";
        return;
      }

      this.$emit("submit-form", { ...this.formData });
    },
  },
};
</script>
