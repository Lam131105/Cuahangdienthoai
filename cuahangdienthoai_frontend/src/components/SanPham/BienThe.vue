<template>
  <div class="row g-4">
    <!-- Form Thêm / Cập nhật Biến Thể -->
    <div class="col-lg-4">
      <div class="card border-0 shadow-sm rounded-3">
        <div class="card-header bg-white py-3">
          <h6 class="mb-0 fw-bold">
            <i
              class="fas me-2 text-primary"
              :class="isEditing ? 'fa-edit' : 'fa-plus-circle'"
            ></i>
            {{ isEditing ? "Cập Nhật Biến Thể" : "Thêm Biến Thể Mới" }}
          </h6>
        </div>
        <div class="card-body">
          <form @submit.prevent="handleSubmit">
            <!-- Chọn RAM -->
            <div class="mb-3">
              <label class="form-label small fw-semibold"
                >Bộ nhớ RAM <span class="text-danger">*</span></label
              >
              <select class="form-select" v-model="form.maram" required>
                <option value="" disabled>-- Chọn RAM --</option>
                <option v-for="ram in dsRam" :key="ram.id" :value="ram.id">
                  {{ ram.dungluongram }}
                </option>
              </select>
            </div>

            <!-- Chọn ROM -->
            <div class="mb-3">
              <label class="form-label small fw-semibold"
                >Bộ nhớ ROM/Dung lượng <span class="text-danger">*</span></label
              >
              <select class="form-select" v-model="form.marom" required>
                <option value="" disabled>-- Chọn ROM --</option>
                <option v-for="rom in dsRom" :key="rom.id" :value="rom.id">
                  {{ rom.dungluongrom }}
                </option>
              </select>
            </div>

            <!-- Chọn Màu sắc -->
            <div class="mb-3">
              <label class="form-label small fw-semibold"
                >Màu sắc <span class="text-danger">*</span></label
              >
              <select
                class="form-select"
                v-model="form.mamausac"
                @change="handleMauSacChange"
                required
              >
                <option value="" disabled>-- Chọn Màu --</option>
                <option v-for="mau in dsMauSac" :key="mau.id" :value="mau.id">
                  {{ mau.tenmau }}
                </option>
              </select>
            </div>

            <!-- Ô nhập giá tiền (Có gợi ý giá từ biến thể cũ) -->
            <div class="col-md-6">
              <label class="form-label font-weight-bold">
                Giá bán
                <span
                  v-if="suggestedPrice && !isEditing"
                  class="badge bg-info ms-2"
                  style="cursor: pointer"
                  @click="applySuggestedPrice"
                >
                  💡 Gợi ý giá: {{ formatCurrency(suggestedPrice) }} (Nhấn để áp
                  dụng)
                </span>
              </label>
              <input
                v-model="form.gia"
                type="number"
                min="0"
                class="form-control"
                placeholder="Nhập giá bán..."
                required
              />
            </div>

            <!-- Chọn/Gợi ý hình ảnh -->
            <div class="col-md-12">
              <label class="form-label font-weight-bold"
                >Hình ảnh biến thể</label
              >
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="form-control"
                @change="handleFileChange"
              />
              <div v-if="imageSuggestedInfo" class="form-text text-success">
                <small>✨ {{ imageSuggestedInfo }}</small>
              </div>
            </div>

            <!-- Khung xem trước ảnh -->
            <div class="col-12 text-center" v-if="previewUrl">
              <div class="p-2 border rounded d-inline-block bg-light">
                <p class="text-muted small mb-1">Xem trước hình ảnh:</p>
                <img
                  :src="previewUrl"
                  class="img-thumbnail"
                  style="max-height: 120px"
                />
              </div>
            </div>

            <!-- Nút Hành Động -->
            <div class="d-grid gap-2">
              <button
                type="submit"
                class="btn btn-primary fw-bold"
                :disabled="submitting"
              >
                <span
                  v-if="submitting"
                  class="spinner-border spinner-border-sm me-1"
                ></span>
                <i v-else class="fas fa-save me-1"></i>
                {{ isEditing ? "Lưu Cập Nhật" : "Tạo Biến Thể" }}
              </button>
              <button
                v-if="isEditing"
                type="button"
                class="btn btn-light text-secondary"
                @click="resetForm"
              >
                Hủy bỏ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Danh Sách Biến Thể -->
    <div class="col-lg-8">
      <div class="card border-0 shadow-sm rounded-3">
        <div
          class="card-header bg-white py-3 d-flex justify-content-between align-items-center"
        >
          <h6 class="mb-0 fw-bold">
            <i class="fas fa-boxes me-2 text-primary"></i>Danh Sách Biến Thể ({{
              dsBienThe.length
            }})
          </h6>
        </div>
        <div class="card-body p-0">
          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status"></div>
          </div>

          <div
            v-else-if="dsBienThe.length === 0"
            class="text-center text-muted py-5"
          >
            <i class="fas fa-box-open fa-3x mb-3 text-secondary opacity-50"></i>
            <p class="mb-0">Sản phẩm này chưa có biến thể nào.</p>
          </div>

          <div v-else class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>Ảnh</th>
                  <th>Cấu hình (RAM/ROM)</th>
                  <th>Màu sắc</th>
                  <th>Số lượng</th>
                  <th>Giá gốc</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="bt in dsBienThe" :key="bt.id">
                  <td>
                    <img
                      :src="getImageUrl(bt.duongdananh)"
                      class="rounded border"
                      style="width: 48px; height: 48px; object-fit: cover"
                      alt="Ảnh biến thể"
                    />
                  </td>
                  <td>
                    <span class="fw-bold text-dark">
                      {{ bt.ram?.dungluongram }} /
                      {{ bt.rom?.dungluongrom }}
                    </span>
                    <br />
                    <small class="text-muted">Mã: {{ bt.id }}</small>
                  </td>
                  <td>
                    <span class="badge bg-info text-dark">
                      {{ bt.mausac?.tenmau }}
                    </span>
                  </td>
                  <td>
                    {{ bt.soluong }}
                  </td>
                  <td>
                    <span class="fw-semibold text-primary">
                      {{ formatCurrency(bt.giagoc || bt.gia) }}
                    </span>
                    <div v-if="bt.dakhuyenmai" class="small text-danger">
                      <i class="fas fa-tag me-1"></i>
                      Còn: {{ formatCurrency(bt.giasaugiam) }}
                    </div>
                  </td>
                  <td>
                    <button
                      class="btn btn-outline-primary btn-sm me-2"
                      title="Sửa"
                      @click="startEdit(bt)"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      class="btn btn-outline-danger btn-sm"
                      title="Xóa"
                      @click="deleteBienThe(bt.id)"
                    >
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BienTheService from "@/services/bienthe.service";
import RamService from "@/services/ram.service";
import RomService from "@/services/rom.service";
import MauSacService from "@/services/mausac.service";

export default {
  name: "BienTheTab",
  props: {
    masanpham: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      dsBienThe: [],
      dsRam: [],
      dsRom: [],
      dsMauSac: [],
      loading: false,
      submitting: false,
      isEditing: false,
      editingId: null,
      selectedFile: null,
      previewUrl: null,
      suggestedPrice: null, // Lưu giá gợi ý
      imageSuggestedInfo: "", // Nhãn thông báo gợi ý ảnh
      form: {
        maram: "",
        marom: "",
        mamausac: "",
        gia: "",
      },
    };
  },
  async created() {
    await Promise.all([
      this.fetchBienThe(),
      this.fetchDanhMuc(),
      this.fetchSuggestedPrice(), // Tìm giá gợi ý cho sản phẩm này
    ]);
  },
  methods: {
    // 1. Tải danh sách biến thể hiện tại
    async fetchBienThe() {
      this.loading = true;
      try {
        const res = await BienTheService.findBySanPham(this.masanpham);
        this.dsBienThe = res || [];
      } catch (error) {
        console.error("Lỗi lấy danh sách biến thể:", error);
      } finally {
        this.loading = false;
      }
    },

    // 2. Tải danh mục RAM, ROM, Màu sắc
    async fetchDanhMuc() {
      try {
        const [ramRes, romRes, mauRes] = await Promise.all([
          RamService.getAll ? RamService.getAll() : [],
          RomService.getAll ? RomService.getAll() : [],
          MauSacService.getAll ? MauSacService.getAll() : [],
        ]);
        this.dsRam = ramRes.data || ramRes;
        this.dsRom = romRes.data || romRes;
        this.dsMauSac = mauRes.data || mauRes;
      } catch (error) {
        console.error("Lỗi tải danh mục cấu hình:", error);
      }
    },

    // 3. GỢI Ý GIÁ: Tìm biến thể có ID nhỏ nhất thuộc sản phẩm này để gợi ý giá
    async fetchSuggestedPrice() {
      try {
        const list = await BienTheService.find({ masanpham: this.masanpham });
        if (Array.isArray(list) && list.length > 0) {
          // Sắp xếp các biến thể theo ID tăng dần
          const sorted = [...list].sort((a, b) => a.id - b.id);
          const minVariant = sorted[0];

          // Ưu tiên giagoc hoặc gia
          this.suggestedPrice = minVariant.gia;

          // Tự động gán luôn giá gợi ý vào form nếu ô giá đang trống
          if (!this.form.gia) {
            this.form.gia = this.suggestedPrice;
          }
        }
      } catch (error) {
        console.error("Lỗi tìm giá gợi ý:", error);
      }
    },

    // Cho phép người dùng bấm vào badge gợi ý để gán lại giá
    applySuggestedPrice() {
      if (this.suggestedPrice) {
        this.form.gia = this.suggestedPrice;
      }
    },

    // 4. GỢI Ý HÌNH ẢNH: Xử lý khi người dùng chọn Màu sắc
    async handleMauSacChange() {
      // Chỉ tự gợi ý ảnh khi tạo mới hoặc khi chưa chọn file ảnh mới từ thiết bị
      if (!this.form.mamausac || this.selectedFile) return;

      try {
        // Tìm các biến thể có cùng masanpham và mamausac
        const list = await BienTheService.find({
          masanpham: this.masanpham,
          mamausac: this.form.mamausac,
        });

        if (Array.isArray(list) && list.length > 0) {
          // Tìm biến thể có duongdananh và id nhỏ nhất
          const sorted = list
            .filter((item) => item.duongdananh)
            .sort((a, b) => a.id - b.id);

          if (sorted.length > 0) {
            const minItem = sorted[0];
            this.previewUrl = this.getImageUrl(minItem.duongdananh);
            this.suggestedImage = minItem.duongdananh;
            this.imageSuggestedInfo =
              "Đã tự động gợi ý ảnh từ biến thể cùng màu sắc ID: " +
              minItem.id +
              "(tự động chọn nếu bạn không chọn file nào khác)";
          } else {
            this.imageSuggestedInfo = "";
          }
        } else {
          this.imageSuggestedInfo = "";
        }
      } catch (error) {
        console.error("Lỗi lấy ảnh gợi ý theo màu sắc:", error);
      }
    },

    // 5. Xử lý khi người dùng tự tải file ảnh từ máy tính
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        this.previewUrl = URL.createObjectURL(file);
        this.imageSuggestedInfo = ""; // Xóa thông báo gợi ý vì người dùng đã chủ động upload ảnh mới
      }
    },

    // 6. Submit Form
    async handleSubmit() {
      this.submitting = true;
      try {
        const formData = new FormData();
        formData.append("masanpham", this.masanpham);
        formData.append("maram", this.form.maram);
        formData.append("marom", this.form.marom);
        formData.append("mamausac", this.form.mamausac);
        formData.append("gia", this.form.gia);

        if (this.selectedFile) {
          // 1. Nếu người dùng tự tải ảnh mới lên
          formData.append("image", this.selectedFile);
        } else if (this.suggestedImage) {
          // 2. Nếu người dùng dùng ảnh gợi ý tự động
          formData.append("duongdananh", this.suggestedImage);
        }

        if (this.isEditing) {
          await BienTheService.update(this.editingId, formData);
          alert("Cập nhật biến thể thành công!");
        } else {
          await BienTheService.create(formData);
          alert("Thêm biến thể mới thành công!");
        }

        this.resetForm();
        await this.fetchBienThe();
      } catch (error) {
        const msg = error.response?.data?.message || "Đã xảy ra lỗi!";
        alert(msg);
      } finally {
        this.submitting = false;
      }
    },

    // 7. Chuẩn bị sửa
    startEdit(bt) {
      this.isEditing = true;
      this.editingId = bt.id;
      this.imageSuggestedInfo = "";
      this.form = {
        maram: bt.maram,
        marom: bt.marom,
        mamausac: bt.mamausac,
        gia: bt.giagoc || bt.gia,
      };
      this.previewUrl = this.getImageUrl(bt.duongdananh);
    },

    // 8. Reset Form
    resetForm() {
      this.isEditing = false;
      this.editingId = null;
      this.selectedFile = null;
      this.previewUrl = null;
      this.imageSuggestedInfo = "";
      this.form = {
        maram: "",
        marom: "",
        mamausac: "",
        gia: this.suggestedPrice || "",
      };
      if (this.$refs.fileInput) this.$refs.fileInput.value = "";
    },

    // 9. Lấy URL ảnh
    getImageUrl(fileName) {
      if (!fileName) return "https://via.placeholder.com/80?text=No+Img";
      if (fileName.startsWith("http")) return fileName;
      return `http://localhost:5000${fileName}`;
    },

    formatCurrency(value) {
      if (!value) return "0 ₫";
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
    },

    // Hàm xóa biến thể
    async deleteBienThe(id) {
      // 1. Hiển thị hộp thoại xác nhận
      const confirmDelete = confirm(
        "Bạn có chắc chắn muốn xóa biến thể này không?",
      );
      if (!confirmDelete) return;

      try {
        // 2. Gọi Service gửi yêu cầu Xóa lên Backend
        await BienTheService.delete(id);

        // 3. Thông báo cho người dùng
        alert("Đã xóa biến thể thành công!");

        // 4. Nếu biến thể vừa xóa lại đúng là biến thể đang được Edit trên Form thì reset form
        if (this.isEditing && this.editingId === id) {
          this.resetForm();
        }

        // 5. Tải lại danh sách biến thể sau khi xóa
        await this.fetchBienThe();

        // 6. Tải lại giá gợi ý (phòng trường hợp biến thể bị xóa là biến thể có ID nhỏ nhất dùng để gợi ý giá)
        await this.fetchSuggestedPrice();
      } catch (error) {
        console.error("Lỗi khi xóa biến thể:", error);
        const errorMsg =
          error.response?.data?.message ||
          "Không thể xóa biến thể này. Vui lòng thử lại!";
        alert(errorMsg);
      }
    },
  },
};
</script>
