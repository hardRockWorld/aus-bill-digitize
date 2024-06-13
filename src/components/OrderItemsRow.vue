<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  index: Number,
  itemName: {
    type: String,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
  },
  products: {
    type: Array,
    required: true,
  },
  free: {
    type: Number,
    required: true,
    default: 0,
  },
  tradePrice: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 30.0,
  },
  tax: Number,
});

const emit = defineEmits([
  "delete-item",
  "update:total-price",
  "update:discount",
  "update:itemName",
  "update:qty",
  "update:free",
  "update:tradePrice",
  "update:discountAmt",
  "update:tax",
  "update:totalAmt",
]);

const indexNo = ref(props.index);
const productName = ref(props.itemName);
const productQty = ref(props.qty);
const discountRate = ref(props.discount);
const tradePrice = ref(props.tradePrice);
const free = ref(props.free);
const tax = ref(props.tax);

const totalPrice = ref(0);
const discountAmt = ref(0);

const handleItemNameChange = (event) => {
  if (event.value) {
    productName.value = event.value.name;
    emit("update:itemName", String(event.value.name));
  } else {
    productName.value = ""; // Clear the productName if the value is empty
    emit("update:itemName", ""); // Emit an empty value
  }
};

const calcDiscountAmt = () => {
  const discount = (
    tradePrice.value *
    productQty.value *
    (discountRate.value / 100)
  ).toFixed(2);
  emit("update:discountAmt", Number(discount.value));
  return Number(discount);
};

const calcTotalPrice = () => {
  const discount_rate = discountRate.value >= 0 ? discountRate.value : 0;
  emit("update:discount", discount_rate);

  const subtotal =
    tradePrice.value * productQty.value * (1 - discount_rate / 100);
  const total = !isNaN(subtotal)
    ? (subtotal + (tax.value / 100) * subtotal).toFixed(2)
    : 0;

  return parseFloat(total);
};

watch(
  [productName, productQty, discountRate, tradePrice, tax],
  () => {
    if (props.itemName) {
      discountAmt.value = calcDiscountAmt();
      totalPrice.value = calcTotalPrice();
      emit("update:total-price", totalPrice.value);
    }
  },
  { immediate: true }
);

defineExpose({
  totalPrice,
  discountRate,
  tax,
  discountAmt,
});
</script>

<template>
  <div
    class="grid gap-4 p-4 border border-gray-300 rounded-lg shadow-md w-full"
  >
    <div class="flex items-center gap-2">
      <Button
        icon="pi pi-trash"
        class="p-button-danger"
        @click.prevent="$emit('delete-item', props.index)"
      />
      <span>
        Item #<span class="font-bold">{{ props.index + 1 }}</span>
      </span>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div class="flex flex-col gap-2">
        <label for="items" class="block text-gray-700">Item Name</label>
        <Dropdown
          v-model="productName"
          :options="props.products"
          optionLabel="name"
          placeholder="Select an item"
          class="w-full"
          @change="handleItemNameChange"
          editable
          showClear
          required
        />
        <small v-if="productName === ''" class="text-red-500"
          >Select an item</small
        >
      </div>

      <div class="flex flex-col gap-2">
        <label for="qty" class="block text-gray-700">Qty</label>
        <InputNumber
          v-model="productQty"
          id="qty"
          placeholder="Qty"
          class="w-full"
          @input="$emit('update:qty', Number($event.value))"
        />
        <small v-if="productQty < 1" class="text-red-500"
          >Qty cannot be 0</small
        >
      </div>

      <div class="flex flex-col gap-2">
        <label for="free" class="block text-gray-700">Free</label>
        <InputNumber
          v-model="free"
          id="free"
          placeholder="Free"
          class="w-full"
          @input="$emit('update:free', Number($event.value))"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="tradePrice" class="block text-gray-700">Trade Price</label>
        <InputNumber
          v-model="tradePrice"
          id="tradePrice"
          placeholder="Trade Price"
          class="w-full"
          @input="$emit('update:tradePrice', Number($event.value))"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="discount" class="block text-gray-700">Discount %</label>
        <InputNumber
          v-model="discountRate"
          id="discount"
          inputId="percent"
          prefix="%"
          class="w-full"
          @input="$emit('update:discount', Number($event.value))"
        />
        <small v-if="discountRate <= 0" class="text-red-500"
          >No Discount!</small
        >
      </div>

      <div class="flex flex-col gap-2">
        <label for="discountAmt" class="block text-gray-700"
          >Discount Amount</label
        >
        <InputNumber
          v-model="discountAmt"
          id="discountAmt"
          placeholder="Discount Amount"
          class="w-full"
          mode="currency"
          currency="INR"
          disabled
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="tax" class="block text-gray-700">Tax %</label>
        <InputNumber
          v-model="tax"
          id="tax"
          inputId="percent"
          prefix="%"
          placeholder="Tax"
          class="w-full"
          @input="$emit('update:tax', Number($event.value))"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="totalAmt" class="block text-gray-700">Total Amount</label>
        <InputNumber
          v-model="totalPrice"
          id="totalAmt"
          placeholder="Total Amount"
          class="w-full"
          mode="currency"
          currency="INR"
          disabled
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
