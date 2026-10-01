<template>
  <div class="container my-4">
    <!-- Header & Nút Quay Lại -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h3 class="mb-1 text-primary">
          <i class="fas fa-file-invoice me-2"></i>Chi Tiết Phiếu Nhập:
          {{ maphieunhap }}
        </h3>
        <p class="text-muted mb-0" v-if="phieuNhapInfo">
          Nhà cung cấp:
          <strong>{{
            phieuNhapInfo.nhacungcap?.tennhacungcap ||
            phieuNhapInfo.manhacungcap
          }}</strong>
          | Ngày nhập: <strong>{{ formatDate(phieuNhapInfo.ngaynhap) }}</strong>
        </p>
      </div>
      <div>
        <button
          class="btn btn-secondary me-2"
          @click="$router.push({ name: 'phieunhap' })"
        >
          <i class="fas fa-arrow-left me-1"></i> Quay lại
        </button>
        <button class="btn btn-success" @click="openModalAdd">
          <i class="fas fa-plus-circle me-1"></i> Thêm sản phẩm nhập
        </button>
      </div>
    </div>

    <!-- Bảng danh sách sản phẩm nhập kho -->
    <div class="card shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-striped table-hover align-middle mb-0">
            <thead class="table-dark">
              <tr>
                <th>STT</th>
                <th>Mã CTN</th>
                <th>Mã sản phẩm / Biến thể</th>
                <th>Tên / Mô tả Biến Thể</th>
                <th class="text-center">Số Lượng Nhập</th>
                <th class="text-end">Đơn Giá Nhập</th>
                <th class="text-end">Thành Tiền</th>
                <th class="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="8" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status"></div>
                </td>
              </tr>
              <tr v-else-if="dsChiTiet.length === 0">
                <td colspan="8" class="text-center py-4 text-muted">
                  Phiếu nhập này chưa có sản phẩm nào. Vui lòng nhấn
                  <strong>"Thêm sản phẩm nhập"</strong>.
                </td>
              </tr>
              <tr v-else v-for="(item, index) in dsChiTiet" :key="item.id">
                <td>{{ index + 1 }}</td>
                <td class="fw-bold">{{ item.id }}</td>
                <td>
                  <span class="badge bg-primary">{{
                    item.bienthe.masanpham
                  }}</span>
                  <span class="badge bg-secondary">{{ item.mabienthe }}</span>
                </td>
                <td>
                  {{ item.bienthe.sanpham.tensanpham }} | Ram:
                  {{ item.bienthe.ram.dungluongram }} | Rom:
                  {{ item.bienthe.rom.dungluongrom }} | Màu:
                  {{ item.bienthe.mausac.tenmau }}
                </td>
                <td class="text-center fw-bold text-success">
                  {{ item.soluongnhap }}
                </td>
                <td class="text-end">{{ formatCurrency(item.gianhap) }}</td>
                <td class="text-end fw-bold text-danger">
                  {{ formatCurrency(item.soluongnhap * item.gianhap) }}
                </td>
                <td class="text-center">
                  <button
                    class="btn btn-sm btn-warning me-2"
                    @click="openModalEdit(item)"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-danger"
                    @click="handleDelete(item.id)"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
            <!-- Footer tính tổng tiền phiếu nhập -->
            <tfoot v-if="dsChiTiet.length > 0" class="table-light fw-bold">
              <tr>
                <td colspan="6" class="text-end fs-6 text-uppercase">
                  Tổng Giá Trị Phiếu Nhập:
                </td>
                <td class="text-end fs-5 text-danger">
                  {{ formatCurrency(tongTien) }}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Thêm/Sửa Chi Tiết Nhập -->
    <div class="modal fade" id="chiTietModal" tabindex="-1" ref="chiTietModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <i class="fas" :class="isEdit ? 'fa-edit' : 'fa-plus-circle'"></i>
              {{
                isEdit
                  ? " Cập Nhật Chi Tiết Nhập"
                  : " Thêm Sản Phẩm Vào Phiếu Nhập"
              }}
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <form @submit.prevent="handleSubmit">
            <div class="modal-body">
              <!-- BƯỚC 1: Chọn Sản Phẩm (Mới thêm) -->
              <div class="mb-3">
                <label class="form-label fw-semibold">
                  1. Chọn Sản phẩm <span class="text-danger">*</span>
                </label>

                <v-select
                  v-model="selectedSanPhamId"
                  :options="dsSanPham"
                  :reduce="(sp) => sp.id"
                  label="tensanpham"
                  :disabled="isEdit"
                  placeholder="Gõ để tìm kiếm & chọn sản phẩm..."
                  @option:selected="form.mabienthe = ''"
                >
                  <template #option="option">
                    <strong>{{ option.id }}</strong> - {{ option.tensanpham }}
                  </template>

                  <template #no-options="{ search, searching }">
                    <template v-if="searching">
                      Không tìm thấy sản phẩm nào phù hợp với "<strong>{{
                        search
                      }}</strong
                      >".
                    </template>
                    <em v-else class="text-muted">Danh sách sản phẩm trống.</em>
                  </template>
                </v-select>
              </div>

              <!-- BƯỚC 2: Chọn Biến Thể (Được lọc theo sản phẩm đã chọn) -->
              <div class="mb-3">
                <label class="form-label fw-semibold"
                  >2. Chọn Biến thể / Phân loại
                  <span class="text-danger">*</span></label
                >
                <select
                  v-model="form.mabienthe"
                  class="form-select"
                  :disabled="isEdit || !selectedSanPhamId"
                  required
                >
                  <option value="">
                    {{
                      !selectedSanPhamId
                        ? "-- Vui lòng chọn sản phẩm trước --"
                        : "-- Chọn biến thể --"
                    }}
                  </option>
                  <option
                    v-for="bt in dsBienTheTheoSanPham"
                    :key="bt.id"
                    :value="bt.id"
                  >
                    {{ bt.id }}|Ram: {{ bt.ram.dungluongram }}|Rom:
                    {{ bt.rom.dungluongrom }}|Màu: {{ bt.mausac.tenmau }} (Tồn
                    kho: {{ bt.soluong || 0 }})
                  </option>
                </select>
                <small
                  v-if="selectedSanPhamId && dsBienTheTheoSanPham.length === 0"
                  class="text-warning d-block mt-1"
                >
                  ⚠️ Sản phẩm này chưa có biến thể nào.
                </small>
              </div>

              <!-- Số lượng nhập -->
              <div class="mb-3">
                <label class="form-label fw-semibold"
                  >Số lượng nhập <span class="text-danger">*</span></label
                >
                <input
                  v-model.number="form.soluongnhap"
                  type="number"
                  min="1"
                  class="form-control"
                  placeholder="Nhập số lượng..."
                  required
                />
              </div>

              <!-- Đơn giá nhập -->
              <div class="mb-3">
                <label class="form-label fw-semibold"
                  >Đơn giá nhập (VNĐ) <span class="text-danger">*</span></label
                >
                <input
                  v-model.number="form.gianhap"
                  type="number"
                  min="0"
                  step="1000"
                  class="form-control"
                  placeholder="Nhập đơn giá..."
                  required
                />
              </div>

              <!-- Xem trước thành tiền -->
              <div
                class="alert alert-info py-2 mb-0"
                v-if="form.soluongnhap > 0 && form.gianhap >= 0"
              >
                Thành tiền:
                <strong>{{
                  formatCurrency(form.soluongnhap * form.gianhap)
                }}</strong>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Hủy
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="submitting || !form.mabienthe"
              >
                <i
                  class="fas"
                  :class="submitting ? 'fa-spinner fa-spin' : 'fa-save'"
                ></i>
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Modal from "bootstrap/js/dist/modal";
import ChiTietNhapService from "@/services/chitietnhap.service";
import PhieuNhapService from "@/services/phieunhap.service";
import BienTheService from "@/services/bienthe.service";
import SanPhamService from "@/services/sanpham.service"; // Thêm Service Sản phẩm của bạn

import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

export default {
  name: "ChiTietNhapAdmin",
  components: { vSelect },
  props: {
    maphieunhap: {
      type: String,
      required: true, // Lấy maphieunhap từ Route URL
    },
  },
  data() {
    return {
      maphieunhap: this.maphieunhap,
      phieuNhapInfo: null,
      dsChiTiet: [],
      dsSanPham: [], // Danh sách tất cả sản phẩm
      dsBienThe: [], // Danh sách tất cả biến thể
      selectedSanPhamId: "", // ID Sản phẩm được chọn trong Modal
      searchSanPham: "",
      loading: false,
      submitting: false,
      isEdit: false,
      editId: null,
      modalInstance: null,
      form: {
        mabienthe: "",
        soluongnhap: 1,
        gianhap: 0,
      },
    };
  },
  computed: {
    dsSanPhamFiltered() {
      if (!this.searchSanPham.trim()) return this.dsSanPham;
      const key = this.searchSanPham.toLowerCase();
      return this.dsSanPham.filter(
        (sp) =>
          sp.id.toLowerCase().includes(key) ||
          (sp.tensanpham && sp.tensanpham.toLowerCase().includes(key)),
      );
    },
    tongTien() {
      return this.dsChiTiet.reduce(
        (sum, item) => sum + item.soluongnhap * item.gianhap,
        0,
      );
    },
    // Lọc danh sách biến thể theo Sản Phẩm đang chọn
    dsBienTheTheoSanPham() {
      if (!this.selectedSanPhamId) return [];
      return this.dsBienThe.filter((bt) => {
        // Tùy thuộc khóa ngoại của biến thể trỏ về sản phẩm (masanpham, me/id_sanpham, v.v.)
        return bt.masanpham === this.selectedSanPhamId;
      });
    },
  },
  async created() {
    await this.fetchPhieuNhapInfo();
    await this.fetchChiTiet();
    await this.fetchDataSelect();
  },
  methods: {
    // Tải cả Sản phẩm lẫn Biến thể
    async fetchDataSelect() {
      try {
        const [resSanPham, resBienThe] = await Promise.all([
          SanPhamService.getAll(),
          BienTheService.find(),
        ]);
        this.dsSanPham = resSanPham;
        this.dsBienThe = resBienThe;
      } catch (error) {
        console.error("Lỗi lấy danh sách sản phẩm/biến thể:", error);
      }
    },

    // Hàm phụ khởi tạo Modal an toàn
    getModalInstance() {
      if (!this.modalInstance && this.$refs.chiTietModal) {
        this.modalInstance = new Modal(this.$refs.chiTietModal);
      }
      return this.modalInstance;
    },

    openModalAdd() {
      this.isEdit = false;
      this.editId = null;
      this.selectedSanPhamId = "";
      this.searchSanPham = "";
      this.form = {
        mabienthe: "",
        soluongnhap: 1,
        gianhap: 0,
      };

      // Mở Modal an toàn
      this.$nextTick(() => {
        const modal = this.getModalInstance();
        if (modal) {
          modal.show();
        } else {
          console.error("Không tìm thấy ref 'chiTietModal' trong DOM");
        }
      });
    },

    openModalEdit(item) {
      this.isEdit = true;
      this.editId = item.id;
      this.searchSanPham = "";

      const currentBT = this.dsBienThe.find((bt) => bt.id === item.mabienthe);
      if (currentBT) {
        this.selectedSanPhamId =
          currentBT.masanpham || currentBT.sanphamId || "";
      }

      this.form = {
        mabienthe: item.mabienthe,
        soluongnhap: item.soluongnhap,
        gianhap: item.gianhap,
      };

      // Mở Modal an toàn
      this.$nextTick(() => {
        const modal = this.getModalInstance();
        if (modal) {
          modal.show();
        }
      });
    },
    async fetchPhieuNhapInfo() {
      try {
        this.phieuNhapInfo = await PhieuNhapService.get(this.maphieunhap);
      } catch (error) {
        console.error("Lỗi lấy thông tin phiếu nhập:", error);
      }
    },
    async fetchChiTiet() {
      this.loading = true;
      try {
        this.dsChiTiet = await ChiTietNhapService.getByPhieuNhap(
          this.maphieunhap,
        );
      } catch (error) {
        console.error("Lỗi lấy chi tiết phiếu nhập:", error);
      } finally {
        this.loading = false;
      }
    },

    async handleSubmit() {
      this.submitting = true;
      try {
        if (this.isEdit) {
          await ChiTietNhapService.update(this.editId, {
            mabienthe: this.form.mabienthe,
            soluongnhap: this.form.soluongnhap,
            gianhap: this.form.gianhap,
          });
          alert("Cập nhật chi tiết nhập thành công!");
        } else {
          await ChiTietNhapService.create({
            maphieunhap: this.maphieunhap,
            mabienthe: this.form.mabienthe,
            soluongnhap: this.form.soluongnhap,
            gianhap: this.form.gianhap,
          });
          alert("Thêm sản phẩm nhập kho thành công!");
        }
        this.modalInstance.hide();
        await this.fetchChiTiet(); // Tải lại danh sách
        await this.fetchDataSelect();
      } catch (error) {
        alert(
          error.response?.data?.message ||
            "Đã xảy ra lỗi thao tác chi tiết nhập.",
        );
      } finally {
        this.submitting = false;
      }
    },
    async handleDelete(id) {
      if (
        confirm(
          `Bạn có chắc chắn muốn xóa hàng nhập mã ${id}? (Số lượng tồn kho sẽ tự động hoàn lại)`,
        )
      ) {
        try {
          await ChiTietNhapService.delete(id);
          alert("Xóa thành công! Kho & tổng tiền đã tự động cập nhật.");
          await this.fetchChiTiet();
        } catch (error) {
          alert(
            error.response?.data?.message || "Không thể xóa chi tiết nhập này.",
          );
        }
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return "";
      return new Date(dateStr).toLocaleString("vi-VN");
    },
    formatCurrency(val) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(val || 0);
    },
  },
};
</script>
