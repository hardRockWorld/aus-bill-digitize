<template>
  <div class="p-4 border border-gray-300 rounded-lg shadow-md min-w-2 w-3/4">
    <form @submit.prevent="submitOrder" class="my-3 grid gap-4">
      <div class="lg:grid lg:grid-cols-2 gap-4">
        <div class="form-group">
          <label for="billNo">Bill No:</label>
          <InputNumber id="billNo" v-model="order.billNo" required />
        </div>
        <div class="form-group">
          <label for="billDate">Bill Date:</label>
          <Calendar
            id="billDate"
            v-model="order.billDate"
            dateFormat="dd/mm/yy"
          />
        </div>
        <div class="form-group">
          <label for="consigneeName">Consignee Name:</label>
          <InputText
            id="consigneeName"
            v-model="order.consigneeName"
            required
          />
        </div>
        <div class="form-group">
          <label for="address">Address:</label>
          <InputText id="address" v-model="order.address" required />
        </div>
        <div class="form-group">
          <label for="district">District:</label>
          <InputText id="district" v-model="order.district" required />
        </div>
        <div class="form-group">
          <label for="zone">Zone:</label>
          <InputText id="zone" v-model="order.zone" required />
        </div>
        <div class="form-group">
          <label for="custCategory">Customer Category:</label>
          <InputText id="custCategory" v-model="order.custCategory" required />
        </div>
        <div class="form-group">
          <label for="custActiveStatus">Customer Active Status:</label>
          <InputText
            id="custActiveStatus"
            v-model="order.custActiveStatus"
            required
          />
        </div>
      </div>

      <!-- OrderItemsRow section taking full width -->
      <div class="w-full">
        <div v-for="(item, i) in order.items" :key="i" class="form-group">
          <OrderItemsRow
            v-model:name="item.itemName"
            v-model:qty="item.qty"
            v-model:discount="item.discount"
            v-model:free="item.free"
            v-model:tradePrice="item.tradePrice"
            v-model:tax="item.tax"
            :index="i"
            :products="products"
            @delete-item="(idx) => order.items.splice(idx, 1)"
            @update:total-price="
              (productName, totalPrice) =>
                updateTotalOrderAmt(productName, totalPrice)
            "
            @update:discount="(discount_amt) => getDiscountAmount(discount_amt)"
          />
        </div>
      </div>

      <!-- Add item -->
      <Button
        @click="addOrderItem"
        class="secondary"
        :disabled="isSaveButtonDisabled"
      >
        Add item
      </Button>

      <!-- Grand Total and Remark section -->
      <div class="lg:grid lg:grid-cols-2 gap-4 w-full">
        <div class="form-group">
          <label for="grandTotal">Grand Total:</label>
          <InputText id="grandTotal" v-model="order.grandTotal" required />
        </div>
        <div class="form-group">
          <label for="remark">Remark:</label>
          <InputText id="remark" v-model="order.remark" required />
        </div>
        <div class="form-group">
          <label for="ratingRemark">Rating Remark:</label>
          <InputText id="ratingRemark" v-model="order.ratingRemark" required />
        </div>
      </div>

      <div class="form-group flex justify-center w-full">
        <Button type="submit" label="Submit Order" />
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { products } from "../util/constants";
import OrderItemsRow from "../components/OrderItemsRow.vue";
import { useSessionStore } from "../stores/user";
import { useOrderStore } from "../stores/orders";
import pb from "../pocketbase";

const sessionStore = useSessionStore();
const orderStore = useOrderStore();

const loading = ref(false);
const discountAmt = ref(0);

const blankOrder = {
  billNo: 0,
  billDate: new Date(Date.now()),
  consigneeName: "",
  address: "",
  district: "",
  zone: "",
  custCategory: "",
  custActiveStatus: "",
  items: [
    {
      itemName: "",
      qty: 0,
      free: 0,
      tradePrice: 0,
      discount: 0,
      tax: 0,
      totalAmt: 0,
    },
  ],
  grandTotal: 0,
  remark: "",
  ratingRemark: "",
};

const order = ref({ ...blankOrder });

const notificationMsg = ref("");

const addOrderItem = () => {
  order.value.items.push({
    itemName: "",
    qty: 0,
    free: 0,
    tradePrice: 0,
    discount: 0,
    discountAmt: 0,
    tax: 0,
    totalAmt: 0,
  });
};

// calculate total discounted amount
const calcGrandTotal = () => {
  let totalOrderAmt = 0;
  itemTotalPrices.forEach((value) => {
    totalOrderAmt += value;
  });
  order.value.grandTotal = Math.round(parseFloat(totalOrderAmt) * 100) / 100;
};

// for updating total discounted amt
const itemTotalPrices = new Map();
const updateTotalOrderAmt = (productName, totalPrice) => {
  if (itemTotalPrices.has(productName)) {
    itemTotalPrices.set(productName, totalPrice);
  } else {
    itemTotalPrices.set(productName, 0);
  }
  calcGrandTotal();
};

watch(
  order.value.items,
  () => {
    calcGrandTotal();
  },
  { deep: true }
);

// get the discountRate
const getDiscountAmount = (discount_amt) => {
  discountAmt.value = discount_amt;
};

// const submitOrder = async () => {
//   loading.value = true;

//   const sessionUserEmail = sessionStore.getUser().email;
//   const submitResult = await addNewOrder(
//     db,
//     order.value,
//     discRate.value,
//     sessionUserEmail
//   );

//   if (submitResult && submitResult.docRef) {
//     const orderData = await fetchSingleDocRef(submitResult.docRef);

//     // Save the order data to the Pinia store
//     orderStore.pushOrder(orderData);

//     // Notify user with message
//     notificationMsg.value = `Order created | sln : ${submitResult.sln}`;
//     itemTotalPrices.clear();
//     calcTotalBillAmt();
//     order.value = { ...blankOrder, items: [{ name: "", qty: 0 }], discount: 0 };
//     loading.value = false;
//   } else {
//     notificationMsg.value = `Did not Save..`;
//     calcTotalBillAmt();
//     loading.value = false;
//   }
// };

const isSaveButtonDisabled = computed(() => {
  const noItem = order.value.items == null || order.value.items.length === 0;
  const hasInvalidQuantity = order.value.items.some((item) => item.qty < 1);
  const hasInvalidName = order.value.items.some((item) => {
    const productName = (item.itemName || "").toString().trim();
    return productName === "";
  });
  return hasInvalidQuantity || hasInvalidName || noItem;
});
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

label {
  font-weight: bold;
  margin-bottom: 0.5rem;
}
</style>
