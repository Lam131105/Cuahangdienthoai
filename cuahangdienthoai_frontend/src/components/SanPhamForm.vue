<template>
  <Form
    @submit="handleSubmit"
    :validation-schema="schema"
    :initial-values="formData"
  >
    <!-- THÔNG TIN CHUNG SẢN PHẨM -->
    <div class="card mb-4 border-0 shadow-sm">
      <div class="card-header bg-white py-3">
        <h6 class="card-title mb-0 fw-bold text-primary">
          <i class="fas fa-info-circle me-2"></i>Thông Tin Cơ Bản
        </h6>
      </div>
      <div class="card-body">
        <!-- Tên sản phẩm -->
        <div class="mb-3">
          <label class="form-label fw-semibold"
            >Tên sản phẩm <span class="text-danger">*</span></label
          >
          <Field
            name="tensanpham"
            type="text"
            class="form-control"
            placeholder="Nhập tên sản phẩm..."
          />
          <ErrorMessage
            name="tensanpham"
            class="text-danger small mt-1 d-block"
          />
        </div>

        <div class="row">
          <!-- Thương hiệu -->
          <div class="col-md-4 mb-3">
            <label class="form-label fw-semibold"
              >Thương hiệu <span class="text-danger">*</span></label
            >
            <Field name="mathuonghieu" as="select" class="form-select">
              <option value="">-- Chọn thương hiệu --</option>
              <option
                v-for="item in dsThuongHieu"
                :key="item.id"
                :value="item.id"
              >
                {{ item.tenthuonghieu || item.id }}
              </option>
            </Field>
            <ErrorMessage
              name="mathuonghieu"
              class="text-danger small mt-1 d-block"
            />
          </div>

          <!-- Thể loại -->
          <div class="col-md-4 mb-3">
            <label class="form-label fw-semibold"
              >Thể loại <span class="text-danger">*</span></label
            >
            <Field name="matheloai" as="select" class="form-select">
              <option value="">-- Chọn thể loại --</option>
              <option v-for="item in dsTheLoai" :key="item.id" :value="item.id">
                {{ item.tentheloai || item.id }}
              </option>
            </Field>
            <ErrorMessage
              name="matheloai"
              class="text-danger small mt-1 d-block"
            />
          </div>

          <!-- Nhà cung cấp -->
          <div class="col-md-4 mb-3">
            <label class="form-label fw-semibold"
              >Nhà cung cấp <span class="text-danger">*</span></label
            >
            <Field name="manhacungcap" as="select" class="form-select">
              <option value="">-- Chọn nhà cung cấp --</option>
              <option
                v-for="item in dsNhaCungCap"
                :key="item.id"
                :value="item.id"
              >
                {{ item.tenncc || item.id }}
              </option>
            </Field>
            <ErrorMessage
              name="manhacungcap"
              class="text-danger small mt-1 d-block"
            />
          </div>
        </div>

        <!-- Trạng thái -->
        <!-- Trạng thái kinh doanh -->
        <div class="mb-3">
          <label class="form-label fw-semibold">Trạng thái kinh doanh</label>

          <Field name="trangthai" v-slot="{ field, value }">
            <select
              v-bind="field"
              class="form-select fw-bold"
              :class="{
                'text-success border-success':
                  value === true || value === 'true',
                'text-danger border-danger':
                  value === false || value === 'false',
              }"
            >
              <option :value="true" class="text-success fw-bold">
                Đang kinh doanh
              </option>
              <option :value="false" class="text-danger fw-bold">
                Ngừng kinh doanh
              </option>
            </select>
          </Field>

          <ErrorMessage name="trangthai" class="text-danger small mt-1" />
        </div>
        <!-- Mô tả sản phẩm -->
        <div class="mb-0">
          <label class="form-label fw-semibold">Mô tả sản phẩm</label>
          <Field
            name="mota"
            as="textarea"
            rows="3"
            class="form-control"
            placeholder="Mô tả chi tiết sản phẩm..."
          />
          <ErrorMessage name="mota" class="text-danger small mt-1 d-block" />
        </div>
      </div>
    </div>

    <!-- PHẦN THÔNG SỐ KỸ THUẬT -->
    <div class="card mb-4 border-0 shadow-sm">
      <div class="card-header bg-white py-3">
        <h6 class="card-title mb-0 fw-bold text-primary">
          <i class="fas fa-microchip me-2"></i>Thông Số Kỹ Thuật
        </h6>
      </div>
      <div class="card-body">
        <div class="row">
          <!-- Kích thước màn hình -->
          <div class="col-md-6 mb-3">
            <label class="form-label fw-semibold">Kích thước màn hình</label>
            <Field
              name="thongsokythuat.kichthuocmanhinh"
              type="text"
              class="form-control"
              placeholder="VD: 6.7 inch"
            />
          </div>

          <!-- Công nghệ màn hình -->
          <div class="col-md-6 mb-3">
            <label class="form-label fw-semibold">Công nghệ màn hình</label>
            <Field
              name="thongsokythuat.congnghemanhinh"
              type="text"
              class="form-control"
              placeholder="VD: Super Retina XDR OLED"
            />
          </div>

          <!-- Chipset -->
          <div class="col-md-6 mb-3">
            <label class="form-label fw-semibold">Chipset (CPU)</label>
            <Field
              name="thongsokythuat.chipset"
              type="text"
              class="form-control"
              placeholder="VD: Apple A17 Pro 6 nhân"
            />
          </div>

          <!-- Dung lượng pin -->
          <div class="col-md-6 mb-3">
            <label class="form-label fw-semibold">Dung lượng pin</label>
            <Field
              name="thongsokythuat.dungluongpin"
              type="text"
              class="form-control"
              placeholder="VD: 4422 mAh"
            />
          </div>

          <!-- Camera sau -->
          <div class="col-md-6 mb-3">
            <label class="form-label fw-semibold">Camera sau</label>
            <Field
              name="thongsokythuat.camerasau"
              type="text"
              class="form-control"
              placeholder="VD: Chính 48 MP & Phụ 12 MP, 12 MP"
            />
          </div>

          <!-- Camera trước -->
          <div class="col-md-6 mb-3">
            <label class="form-label fw-semibold">Camera trước</label>
            <Field
              name="thongsokythuat.cameratruoc"
              type="text"
              class="form-control"
              placeholder="VD: 12 MP"
            />
          </div>

          <!-- Công nghệ sạc -->
          <div class="col-md-12 mb-0">
            <label class="form-label fw-semibold">Công nghệ sạc</label>
            <Field
              name="thongsokythuat.congnghesac"
              type="text"
              class="form-control"
              placeholder="VD: Sạc nhanh 20 W, Sạc không dây MagSafe"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="d-flex justify-content-end gap-2 mt-4">
      <button
        type="button"
        class="btn btn-secondary"
        @click="$router.push('/admin/sanpham')"
      >
        <i class="fas fa-arrow-left me-1"></i> Quay lại
      </button>
      <button type="submit" class="btn btn-primary fw-bold" :disabled="loading">
        <span
          v-if="loading"
          class="spinner-border spinner-border-sm me-1"
        ></span>
        <i v-else class="fas fa-save me-1"></i>
        Lưu thông tin
      </button>
    </div>
  </Form>
</template>

<script>
import * as yup from "yup";
import { Form, Field, ErrorMessage } from "vee-validate";
import ThuongHieuService from "@/services/thuonghieu.service";
import TheLoaiService from "@/services/theloai.service";
import NhaCungCapService from "@/services/nhacungcap.service";

export default {
  name: "SanPhamForm",
  components: { Form, Field, ErrorMessage },
  props: {
    sanPhamData: {
      type: Object,
      default: () => ({}),
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["submit-form"],
  data() {
    const schema = yup.object().shape({
      tensanpham: yup
        .string()
        .required("Tên sản phẩm không được để trống.")
        .min(3, "Tên sản phẩm phải từ 3 ký tự trở lên."),
      mathuonghieu: yup.string().required("Vui lòng chọn thương hiệu."),
      matheloai: yup.string().required("Vui lòng chọn thể loại."),
      manhacungcap: yup.string().required("Vui lòng chọn nhà cung cấp."),
      // Trong data() -> schema
      trangthai: yup.string().required("Vui lòng chọn trạng thái."),
      mota: yup.string().nullable(),
      thongsokythuat: yup.object().shape({
        kichthuocmanhinh: yup.string().nullable(),
        congnghemanhinh: yup.string().nullable(),
        chipset: yup.string().nullable(),
        camerasau: yup.string().nullable(),
        cameratruoc: yup.string().nullable(),
        dungluongpin: yup.string().nullable(),
        congnghesac: yup.string().nullable(),
      }),
    });

    return {
      schema,
      dsThuongHieu: [],
      dsTheLoai: [],
      dsNhaCungCap: [],
    };
  },
  computed: {
    // Chuẩn hóa initial values để hỗ trợ cả thêm mới lẫn cập nhật
    formData() {
      return {
        tensanpham: "",
        mathuonghieu: "",
        matheloai: "",
        manhacungcap: "",
        trangthai: true,
        mota: "",
        ...this.sanPhamData,
        thongsokythuat: {
          kichthuocmanhinh: "",
          congnghemanhinh: "",
          chipset: "",
          camerasau: "",
          cameratruoc: "",
          dungluongpin: "",
          congnghesac: "",
          ...(this.sanPhamData.thongsokythuat || {}),
        },
      };
    },
  },
  async created() {
    await Promise.all([
      this.fetchThuongHieu(),
      this.fetchTheLoai(),
      this.fetchNhaCungCap(),
    ]);
  },
  methods: {
    async fetchThuongHieu() {
      try {
        this.dsThuongHieu = await ThuongHieuService.getAll();
      } catch (error) {
        console.error("Lỗi lấy danh sách thương hiệu:", error);
      }
    },
    async fetchNhaCungCap() {
      try {
        this.dsNhaCungCap = await NhaCungCapService.getAll();
      } catch (error) {
        console.error("Lỗi lấy danh sách nhà cung cấp:", error);
      }
    },
    async fetchTheLoai() {
      try {
        this.dsTheLoai = await TheLoaiService.getAll();
      } catch (error) {
        console.error("Lỗi lấy danh sách thể loại:", error);
      }
    },
    handleSubmit(values) {
      this.$emit("submit-form", values);
    },
  },
};
</script>
