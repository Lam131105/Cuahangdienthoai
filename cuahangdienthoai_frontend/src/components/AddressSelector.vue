<template>
  <div class="address-selector">
    <!-- 🟢 THÊM: Tên người nhận -->
    <div class="form-group">
      <label class="fw-semibold"
        >Họ và tên người nhận: <span class="text-danger">*</span></label
      >
      <input
        type="text"
        v-model="receiverName"
        @input="emitAddressData"
        placeholder="Ví dụ: Nguyễn Văn A"
      />
    </div>

    <!-- 🟢 THÊM: Số điện thoại người nhận -->
    <div class="form-group">
      <label class="fw-semibold"
        >Số điện thoại nhận hàng: <span class="text-danger">*</span></label
      >
      <input
        type="tel"
        v-model="receiverPhone"
        @input="emitAddressData"
        placeholder="Ví dụ: 0912345678"
      />
    </div>

    <!-- Dropdown Tỉnh / Thành -->
    <div class="form-group">
      <label class="fw-semibold"
        >Tỉnh / Thành phố: <span class="text-danger">*</span></label
      >
      <select v-model="selectedProvinceCode" @change="handleProvinceChange">
        <option value="">-- Chọn Tỉnh / Thành --</option>
        <option v-for="item in provinces" :key="item.code" :value="item.code">
          {{ item.name }}
        </option>
      </select>
    </div>

    <!-- Dropdown Quận / Huyện -->
    <div class="form-group">
      <label class="fw-semibold"
        >Quận / Huyện: <span class="text-danger">*</span></label
      >
      <select
        v-model="selectedDistrictCode"
        @change="handleDistrictChange"
        :disabled="!selectedProvinceCode"
      >
        <option value="">-- Chọn Quận / Huyện --</option>
        <option v-for="item in districts" :key="item.code" :value="item.code">
          {{ item.name }}
        </option>
      </select>
    </div>

    <!-- Dropdown Phường / Xã -->
    <div class="form-group">
      <label class="fw-semibold"
        >Phường / Xã: <span class="text-danger">*</span></label
      >
      <select
        v-model="selectedWardCode"
        @change="emitAddressData"
        :disabled="!selectedDistrictCode"
      >
        <option value="">-- Chọn Phường / Xã --</option>
        <option v-for="item in wards" :key="item.code" :value="item.code">
          {{ item.name }}
        </option>
      </select>
    </div>

    <!-- Ô nhập Địa chỉ chi tiết -->
    <div class="form-group">
      <label class="fw-semibold"
        >Địa chỉ chi tiết (Số nhà, tên đường):
        <span class="text-danger">*</span></label
      >
      <input
        type="text"
        v-model="detailAddress"
        @input="emitAddressData"
        placeholder="Ví dụ: 123 Nguyễn Trãi"
      />
    </div>

    <!-- Trong AddressSelector.vue -->
    <div class="form-check mt-2">
      <input
        class="form-check-input"
        type="checkbox"
        id="lamacdinhCheck"
        v-model="isDefault"
        @change="emitAddressData"
      />
      <label class="form-check-label" for="lamacdinhCheck">
        Đặt làm địa chỉ giao hàng mặc định
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const emit = defineEmits(["update:address"]);

// 🟢 THÊM: Khai báo 2 biến lưu thông tin người nhận
const receiverName = ref("");
const receiverPhone = ref("");

const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);

const selectedProvinceCode = ref("");
const selectedDistrictCode = ref("");
const selectedWardCode = ref("");
const detailAddress = ref("");
const isDefault = ref("true");

onMounted(async () => {
  emitAddressData();
  try {
    const res = await fetch("/data/full_3_levels.json");
    provinces.value = await res.json();
  } catch (err) {
    console.error("Lỗi khi tải file địa giới:", err);
  }
});

// Xử lý khi chọn Tỉnh / Thành
const handleProvinceChange = () => {
  selectedDistrictCode.value = "";
  selectedWardCode.value = "";
  wards.value = [];

  const foundProvince = provinces.value.find(
    (p) =>
      p.code === Number(selectedProvinceCode.value) ||
      p.code === selectedProvinceCode.value,
  );
  districts.value = foundProvince ? foundProvince.districts : [];

  emitAddressData();
};

// Xử lý khi chọn Quận / Huyện
const handleDistrictChange = () => {
  selectedWardCode.value = "";

  const foundDistrict = districts.value.find(
    (d) =>
      d.code === Number(selectedDistrictCode.value) ||
      d.code === selectedDistrictCode.value,
  );
  wards.value = foundDistrict ? foundDistrict.wards : [];

  emitAddressData();
};

// Phát dữ liệu ra ngoài
const emitAddressData = () => {
  const provinceObj = provinces.value.find(
    (p) =>
      p.code === Number(selectedProvinceCode.value) ||
      p.code === selectedProvinceCode.value,
  );
  const districtObj = districts.value.find(
    (d) =>
      d.code === Number(selectedDistrictCode.value) ||
      d.code === selectedDistrictCode.value,
  );
  const wardObj = wards.value.find(
    (w) =>
      w.code === Number(selectedWardCode.value) ||
      w.code === selectedWardCode.value,
  );

  emit("update:address", {
    // 🟢 Dữ liệu người nhận mới thêm
    tenNguoiNhan: receiverName.value,
    sdtNguoiNhan: receiverPhone.value,

    // Dữ liệu mã và tên địa giới
    tinh_thanh_id: selectedProvinceCode.value,
    tinh_thanh_ten: provinceObj ? provinceObj.name : "",
    quan_huyen_id: selectedDistrictCode.value,
    quan_huyen_ten: districtObj ? districtObj.name : "",
    phuong_xa_id: selectedWardCode.value,
    phuong_xa_ten: wardObj ? wardObj.name : "",
    diachichitiet: detailAddress.value,
    lamacdinh: Boolean(isDefault.value),
  });
};
</script>

<style scoped>
.address-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 100%;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
select,
input {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s ease-in-out;
}
select:focus,
input:focus {
  outline: none;
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
}
.text-danger {
  color: #dc3545;
}
</style>
