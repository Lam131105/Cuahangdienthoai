<template>
  <Form @submit="submitForm" :validation-schema="formSchema">
    <div class="row g-3">
      <!-- Mốc Chi Tối Thiểu -->
      <div class="col-md-6">
        <label for="mocchitoithieu" class="form-label fw-bold">
          Mốc chi tối thiểu (VNĐ) <span class="text-danger">*</span>
        </label>
        <Field
          name="mocchitoithieu"
          type="number"
          min="0"
          step="1000"
          class="form-control"
          id="mocchitoithieu"
          v-model.number="itemLocal.mocchitoithieu"
          placeholder="VD: 500000"
        />
        <ErrorMessage
          name="mocchitoithieu"
          class="text-danger small mt-1 d-block"
        />
      </div>

      <!-- Số Lượng Nhận -->
      <div class="col-md-6">
        <label for="soluongnhan" class="form-label fw-bold">
          Số lượng nhận (Voucher) <span class="text-danger">*</span>
        </label>
        <Field
          name="soluongnhan"
          type="number"
          min="1"
          class="form-control"
          id="soluongnhan"
          v-model.number="itemLocal.soluongnhan"
          placeholder="VD: 1, 2, 5..."
        />
        <ErrorMessage
          name="soluongnhan"
          class="text-danger small mt-1 d-block"
        />
      </div>

      <!-- Chọn Phiếu Giảm Giá -->
      <div class="col-md-12">
        <label for="maphieugiamgia" class="form-label fw-bold">
          Phiếu giảm giá áp dụng <span class="text-danger">*</span>
        </label>
        <Field
          name="maphieugiamgia"
          as="select"
          class="form-select"
          id="maphieugiamgia"
          v-model="itemLocal.maphieugiamgia"
        >
          <option value="" disabled>-- Chọn Phiếu Giảm Giá --</option>
          <option v-for="pgg in dsPhieuGiamGia" :key="pgg.id" :value="pgg.id">
            {{ pgg.id }} - {{ pgg.tenphieu || pgg.mota || "Phiếu giảm giá" }}
          </option>
        </Field>
        <ErrorMessage
          name="maphieugiamgia"
          class="text-danger small mt-1 d-block"
        />
      </div>
    </div>

    <!-- Nút Thao Tác -->
    <div class="d-flex gap-2 justify-content-end mt-4">
      <button type="button" class="btn btn-secondary" @click="cancel">
        <i class="bi bi-x-circle me-1"></i> Hủy
      </button>
      <button
        type="submit"
        class="btn btn-primary fw-semibold"
        :disabled="isLoading"
      >
        <span
          v-if="isLoading"
          class="spinner-border spinner-border-sm me-1"
          role="status"
        ></span>
        <i v-else class="bi bi-check-circle me-1"></i>
        Lưu Điều Kiện
      </button>
    </div>
  </Form>
</template>

<script>
import * as yup from "yup";
import { Form, Field, ErrorMessage } from "vee-validate";
import PhieuGiamGiaService from "@/services/phieugiamgia.service";

export default {
  name: "DieuKienNhanVoucherForm",
  components: {
    Form,
    Field,
    ErrorMessage,
  },
  props: {
    dieuKien: {
      type: Object,
      default: () => ({
        mocchitoithieu: 0,
        soluongnhan: 1,
        maphieugiamgia: "",
      }),
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["submit:dieuKien", "cancel"],
  data() {
    const formSchema = yup.object().shape({
      mocchitoithieu: yup
        .number()
        .typeError("Mốc chi tối thiểu phải là số.")
        .required("Mốc chi tối thiểu không được để trống.")
        .min(0, "Mốc chi tối thiểu phải lớn hơn hoặc bằng 0."),
      soluongnhan: yup
        .number()
        .typeError("Số lượng nhận phải là số.")
        .required("Số lượng nhận không được để trống.")
        .min(1, "Số lượng nhận phải lớn hơn 0."),
      maphieugiamgia: yup
        .string()
        .required("Vui lòng chọn phiếu giảm giá áp dụng."),
    });

    return {
      itemLocal: { ...this.dieuKien },
      dsPhieuGiamGia: [],
      formSchema,
    };
  },
  watch: {
    dieuKien: {
      handler(newVal) {
        this.itemLocal = { ...newVal };
      },
      deep: true,
    },
  },
  methods: {
    async fetchDSPhieuGiamGia() {
      try {
        this.dsPhieuGiamGia = await PhieuGiamGiaService.getAll();
      } catch (error) {
        console.error("Lỗi lấy danh sách phiếu giảm giá:", error);
      }
    },
    submitForm() {
      this.$emit("submit:dieuKien", this.itemLocal);
    },
    cancel() {
      this.$emit("cancel");
    },
  },
  created() {
    this.fetchDSPhieuGiamGia();
  },
};
</script>
