<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  index: Number,
  itemName: String,
  qty: Number,
  products: Array,
  free: Number,
  tradePrice: Number,
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
  "update:name",
  "update:qty",
  "update:free",
  "update:tradePrice",
  "update:discountAmt",
  "update:tax",
  "update:totalAmt",
]);

const productName = ref(props.itemName);
const productQty = ref(props.qty);
const discountRate = ref(props.discount);
const tradePrice = ref(props.tradePrice);
const free = ref(props.free);
const tax = ref(props.tax);

const totalPrice = ref(0);
const discountAmt = ref(0);

const calcDiscountAmt = () => {
  const discount = (
    tradePrice.value *
    productQty.value *
    (discountRate.value / 100)
  ).toFixed(2);
  emit("update:discountAmt", discount);
  return discount;
};

const calcTotalPrice = () => {
  const discount_rate = discountRate.value >= 0 ? discountRate.value : 0;
  emit("update:discount", discount_rate);

  const subtotal =
    tradePrice.value * productQty.value * (1 - discount_rate / 100);
  const total = (subtotal + (tax.value / 100) * subtotal).toFixed(2);

  return parseFloat(total);
};

watch(
  [productName, productQty, discountRate, tradePrice, tax],
  () => {
    discountAmt.value = calcDiscountAmt();
    totalPrice.value = calcTotalPrice();
    emit("update:total-price", productName, totalPrice.value);
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
          @change="$emit('update:name', $event.value)"
        />
        <small v-if="productName === ''" class="text-red-500"
          >Select an item</small
        >
      </div>

      <div class="flex flex-col gap-2">
        <label for="qty" class="block text-gray-700">Qty</label>
        <InputText
          type="number"
          v-model.number="productQty"
          id="qty"
          placeholder="Qty"
          class="w-full"
          @input="$emit('update:qty', Number($event.target.value))"
        />
        <small v-if="productQty < 1" class="text-red-500"
          >Qty cannot be 0</small
        >
      </div>

      <div class="flex flex-col gap-2">
        <label for="free" class="block text-gray-700">Free</label>
        <InputText
          type="number"
          v-model.number="free"
          id="free"
          placeholder="Free"
          class="w-full"
          @input="$emit('update:free', Number($event.target.value))"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="tradePrice" class="block text-gray-700">Trade Price</label>
        <InputText
          type="number"
          v-model.number="tradePrice"
          id="tradePrice"
          placeholder="Trade Price"
          class="w-full"
          @input="$emit('update:tradePrice', Number($event.target.value))"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="discount" class="block text-gray-700">Discount %</label>
        <InputText
          type="number"
          v-model.number="discountRate"
          id="discount"
          step="0.01"
          class="w-full"
          @input="$emit('update:discount', Number($event.target.value))"
        />
        <small v-if="discountRate <= 0" class="text-red-500"
          >No Discount!</small
        >
      </div>

      <div class="flex flex-col gap-2">
        <label for="discountAmt" class="block text-gray-700"
          >Discount Amount</label
        >
        <InputText
          type="number"
          :value="discountAmt"
          id="discountAmt"
          placeholder="Discount Amount"
          class="w-full"
          disabled
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="tax" class="block text-gray-700">Tax</label>
        <InputText
          type="number"
          v-model.number="tax"
          id="tax"
          placeholder="Tax"
          class="w-full"
          @input="$emit('update:tax', Number($event.target.value))"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="totalAmt" class="block text-gray-700">Total Amount</label>
        <InputText
          type="number"
          :value="totalPrice"
          id="totalAmt"
          placeholder="Total Amount"
          class="w-full"
          disabled
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
