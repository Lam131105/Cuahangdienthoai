<template>
  <div class="card border-0 shadow-sm rounded-3 mb-4 w-100">
    <div class="card-body p-3 p-md-4">
      <!-- Header + Nút Xóa bộ lọc -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h6 class="mb-0 fw-bold text-dark fs-6">
          <i class="fas fa-sliders-h text-primary me-2"></i>Bộ Lọc Tìm Kiếm
        </h6>
        <button
          v-if="hasActiveFilter"
          class="btn btn-link btn-sm text-danger text-decoration-none p-0 fw-semibold"
          @click="resetFilters"
        >
          <i class="fas fa-undo me-1"></i>Xóa bộ lọc
        </button>
      </div>

      <!-- Layout Hàng ngang (Row-Cols responsive) -->
      <div class="row g-2 g-md-3 align-items-end">
        <!-- 1. Ô tìm kiếm Từ khóa -->
        <div class="col-12 col-sm-6 col-lg-3">
          <label class="form-label small fw-semibold text-secondary mb-1"
            >Từ khóa</label
          >
          <div class="input-group input-group-sm">
            <input
              type="text"
              class="form-control"
              placeholder="Nhập tên sản phẩm..."
              v-model="filters.tensanpham"
              @keyup.enter="applyFilters"
            />
            <button class="btn btn-primary" type="button" @click="applyFilters">
              <i class="fas fa-search"></i>
            </button>
          </div>
        </div>

        <!-- 2. Thể loại -->
        <div class="col-6 col-sm-6 col-lg-2">
          <label class="form-label small fw-semibold text-secondary mb-1"
            >Thể loại</label
          >
          <select
            class="form-select form-select-sm"
            v-model="filters.matheloai"
            @change="applyFilters"
          >
            <option value="">Tất cả thể loại</option>
            <option v-for="item in dsTheLoai" :key="item.id" :value="item.id">
              {{ item.tentheloai || item.id }}
            </option>
          </select>
        </div>

        <!-- 3. Thương hiệu -->
        <div class="col-6 col-sm-6 col-lg-2">
          <label class="form-label small fw-semibold text-secondary mb-1"
            >Thương hiệu</label
          >
          <select
            class="form-select form-select-sm"
            v-model="filters.mathuonghieu"
            @change="applyFilters"
          >
            <option value="">Tất cả thương hiệu</option>
            <option
              v-for="item in dsThuongHieu"
              :key="item.id"
              :value="item.id"
            >
              {{ item.tenthuonghieu || item.id }}
            </option>
          </select>
        </div>

        <!-- 3. Nhà cung cấp -->
        <div class="col-6 col-sm-6 col-lg-2">
          <label class="form-label small fw-semibold text-secondary mb-1"
            >Nhacungcap</label
          >
          <select
            class="form-select form-select-sm"
            v-model="filters.manhacungcap"
            @change="applyFilters"
          >
            <option value="">Tất cả nhà cung cấp</option>
            <option
              v-for="item in dsNhaCungCap"
              :key="item.id"
              :value="item.id"
            >
              {{ item.tenncc || item.id }}
            </option>
          </select>
        </div>

        <!-- 4. RAM -->
        <div class="col-6 col-sm-4 col-lg-1-5 col-xl-2">
          <label class="form-label small fw-semibold text-secondary mb-1"
            >RAM</label
          >
          <select
            class="form-select form-select-sm"
            v-model="filters.maram"
            @change="applyFilters"
          >
            <option value="">Tất cả RAM</option>
            <option v-for="item in dsRam" :key="item.id" :value="item.id">
              {{ item.dungluongram || item.tenram || item.id }}
            </option>
          </select>
        </div>

        <!-- 5. ROM -->
        <div class="col-2">
          <label class="form-label small fw-semibold text-secondary mb-1"
            >ROM</label
          >
          <select
            class="form-select form-select-sm"
            v-model="filters.marom"
            @change="applyFilters"
          >
            <option value="">Tất cả ROM</option>
            <option v-for="item in dsRom" :key="item.id" :value="item.id">
              {{ item.dungluongrom || item.tenrom || item.id }}
            </option>
          </select>
        </div>

        <!-- 6. Màu sắc -->
        <div class="col-12 col-sm-4 col-lg-2" v-if="dsMauSac.length > 0">
          <label class="form-label small fw-semibold text-secondary mb-1"
            >Màu sắc</label
          >
          <select
            class="form-select form-select-sm"
            v-model="filters.mamausac"
            @change="applyFilters"
          >
            <option value="">Tất cả màu sắc</option>
            <option v-for="mau in dsMauSac" :key="mau.id" :value="mau.id">
              {{ mau.tenmau || mau.id }}
            </option>
          </select>
        </div>

        <!-- Trạng thái kinh doanh -->
        <div class="col-12 col-sm-4 col-lg-2">
          <label class="form-label fw-semibold">Trạng thái kinh doanh</label>

          <select
            v-model="filters.trangthai"
            @change="applyFilters"
            class="form-select fw-bold"
            :class="{
              'text-success border-success': value === 'true',
              'text-danger border-danger': value === 'false',
            }"
          >
            <option value="" class="fw-bold">Tất cả</option>
            <option :value="'true'" class="text-success fw-bold">
              Đang kinh doanh
            </option>
            <option :value="'false'" class="text-danger fw-bold">
              Ngừng kinh doanh
            </option>
          </select>

          <ErrorMessage name="trangthai" class="text-danger small mt-1" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ThuongHieuService from "@/services/thuonghieu.service";
import TheLoaiService from "@/services/theloai.service";
import RamService from "@/services/ram.service";
import RomService from "@/services/rom.service";
import MauSacService from "@/services/mausac.service";
import NhaCungCapService from "@/services/nhacungcap.service";

export default {
  name: "BoLocSanPham",
  emits: ["filter-change"],
  data() {
    return {
      filters: {
        tensanpham: "",
        matheloai: "",
        mathuonghieu: "",
        manhacungcap: "",
        maram: "",
        marom: "",
        mamausac: "",
        trangthai: "",
      },
      dsThuongHieu: [],
      dsNhaCungCap: [],
      dsTheLoai: [],
      dsRam: [],
      dsRom: [],
      dsMauSac: [],
    };
  },
  computed: {
    hasActiveFilter() {
      return (
        this.filters.tensanpham !== "" ||
        this.filters.matheloai !== "" ||
        this.filters.mathuonghieu !== "" ||
        this.filters.manhacungcap !== "" ||
        this.filters.maram !== "" ||
        this.filters.marom !== "" ||
        this.filters.mamausac !== "" ||
        this.filters.trangthai !== ""
      );
    },
  },
  async created() {
    // Đọc URL Query parameters nếu có (để giữ trạng thái khi reload)
    this.initFiltersFromQuery();

    // Tải dữ liệu các danh mục thuộc tính
    await Promise.all([
      this.fetchThuongHieu(),
      this.fetchNhaCungCap(),
      this.fetchTheLoai(),
      this.fetchRam(),
      this.fetchRom(),
      this.fetchMauSac(),
    ]);
  },
  methods: {
    initFiltersFromQuery() {
      const q = this.$route.query;
      this.filters.tensanpham = q.tensanpham || "";
      this.filters.matheloai = q.matheloai || "";
      this.filters.mathuonghieu = q.mathuonghieu || "";
      this.filters.manhacungcap = q.manhacungcap || "";
      this.filters.maram = q.maram || "";
      this.filters.marom = q.marom || "";
      this.filters.mamausac = q.mamausac || "";
      this.filters.trangthai = q.trangthai || "";
    },

    async fetchThuongHieu() {
      try {
        this.dsThuongHieu = await ThuongHieuService.getAll();
      } catch (e) {}
    },

    async fetchNhaCungCap() {
      try {
        this.dsNhaCungCap = await NhaCungCapService.getAll();
      } catch (e) {}
    },
    async fetchTheLoai() {
      try {
        this.dsTheLoai = await TheLoaiService.getAll();
      } catch (e) {}
    },
    async fetchRam() {
      try {
        this.dsRam = await RamService.getAll();
      } catch (e) {}
    },
    async fetchRom() {
      try {
        this.dsRom = await RomService.getAll();
      } catch (e) {}
    },
    async fetchMauSac() {
      try {
        this.dsMauSac = await MauSacService.getAll();
      } catch (e) {}
    },

    selectOption(field, value) {
      this.filters[field] = value;
      this.applyFilters();
    },

    applyFilters() {
      // 1. Tạo query object lọc bỏ trường rỗng
      const cleanFilter = {};
      Object.keys(this.filters).forEach((key) => {
        if (this.filters[key] !== "" && this.filters[key] !== false) {
          cleanFilter[key] = this.filters[key];
        }
      });

      // 2. Cập nhật query lên URL để share/reload không mất bộ lọc
      this.$router.push({ query: cleanFilter }).catch(() => {});

      // 3. Emit bộ lọc ra component cha
      this.$emit("filter-change", cleanFilter);
    },

    resetFilters() {
      this.filters = {
        tensanpham: "",
        matheloai: "",
        mathuonghieu: "",
        manhacungcap: "",
        maram: "",
        marom: "",
        mamausac: "",
        trangthai: "",
      };
      this.applyFilters();
    },
  },
};
</script>

<style scoped>
.btn-filter-chip {
  padding: 0.25rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 6px;
}
</style>
