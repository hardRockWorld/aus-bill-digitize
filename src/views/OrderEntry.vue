<template>
  <div class="p-4 border border-gray-300 rounded-lg shadow-md min-w-2 w-3/4">
    <form @submit.prevent="submitOrder" class="my-3 grid gap-4">
      <div class="lg:grid lg:grid-cols-2 gap-4">
        <div class="form-group">
          <label for="billNo">Bill No:</label>
          <InputNumber id="billNo" v-model="order.billNo" required/>
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
          <Dropdown
              id="consigneeName"
              v-model="selectedCustomer"
              @change="onConsigneeNameChange"
              :options="customerNames"
              optionLabel="cust_name"
              placeholder="Select a customer"
              class="p-column-filter"
              showClear
              editable
              required
          />
        </div>
        <div class="form-group">
          <label for="address">Address:</label>
          <InputText id="address" v-model="order.address" disabled required/>
        </div>
        <div class="form-group">
          <label for="district">District:</label>
          <InputText id="district" v-model="order.district" required/>
        </div>
        <div class="form-group">
          <label for="zone">Zone:</label>
          <InputText id="zone" v-model="order.zone" required/>
        </div>
        <div class="form-group">
          <label for="custCategory">Customer Category:</label>
          <Dropdown
              id="custCategory"
              v-model="selectedCustomerCategory"
              :options="customerCategoryOptions"
              placeholder="Select a category"
              class="p-column-filter"
              showClear
              required
          />
        </div>
        <div class="form-group">
          <label for="custActiveStatus">Customer Active Status:</label>
          <Dropdown
              id="custActiveStatus"
              v-model="selectedCustomerActiveStatus"
              :options="customerActiveStatusOptions"
              placeholder="Select a status"
              class="p-column-filter"
              showClear
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
              @update:total-price="(totalPrice) => updateTotalOrderAmt(i, totalPrice)"
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
          <InputText id="grandTotal" v-model="order.grandTotal" required/>
        </div>
        <div class="form-group">
          <label for="remark">Remark:</label>
          <InputText id="remark" v-model="order.remark" required/>
        </div>
        <div class="form-group">
          <label for="ratingRemark">Rating Remark:</label>
          <InputText id="ratingRemark" v-model="order.ratingRemark" required/>
        </div>
      </div>

      <div class="form-group flex justify-center w-full">
        <Button type="submit" label="Submit Order"/>
      </div>
    </form>
  </div>
</template>

<script setup>
import {ref, computed, watch, onMounted} from "vue";
import {products} from "../util/constants";
import OrderItemsRow from "../components/OrderItemsRow.vue";
import {useSessionStore} from "../stores/user";
import {useOrderStore} from "../stores/orders";
import {getAllCustomers, addNewOrder, fetchSingleDocRef} from "../pocketbase/dbQueries";
import {useToast} from 'primevue/usetoast';
import pb from "../pocketbase";

const sessionStore = useSessionStore();
const orderStore = useOrderStore();

const loading = ref(false);
const discountAmt = ref(0);

const toast = useToast();

const showSuccess = (bill_no) => {
  toast.add({
    severity: 'success',
    summary: 'Order Created',
    detail: `sln : ${bill_no}`,
    life: 3000
  });
}

const showError = (err_msg) => {
  toast.add({severity: 'error', summary: 'Error', detail: `${err_msg}`, life: 3000});
};

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

const order = ref({...blankOrder});

const notificationMsg = ref("");

const addOrderItem = () => {
  order.value.items.push({
    itemName: "",
    qty: 0,
    free: 0,
    tradePrice: 0,
    discount: 0,
    tax: 0,
    totalAmt: 0,
  });
};

// Get the customer names
const customerNames = ref([]);

// Get the customer table id
const customerTableId = ref("");

// Get the selected customer category & active status
const selectedCustomerCategory = ref(null);
const selectedCustomerActiveStatus = ref(null);

// Get the customer category & active status options
const customerCategoryOptions = ["Premium", "Normal", "Ordinary"];
const customerActiveStatusOptions = ["Active", "Inactive"];

onMounted(async () => {
// Fetch customer names
  customerNames.value = await getAllCustomers();
});

const selectedCustomer = ref(null);

const customerAddress = computed(() => {
  return selectedCustomer.value ? selectedCustomer.value.cust_address : "";
});

// watch(selectedCustomer, (newValue) => {
//   if (newValue && selectedCustomer.value) {
//     order.value.address = customerAddress.value;
//   } else {
//     order.value.address = "";
//   }
// });

watch(
    [selectedCustomer, selectedCustomerCategory, selectedCustomerActiveStatus],
    ([newCustomer, newCategory, newStatus]) => {
      if (newCustomer && selectedCustomer.value) {
        order.value.consigneeName = newCustomer.cust_id;
        order.value.address = newCustomer.cust_address;
      } else {
        order.value.consigneeName = "";
        order.value.address = "";
      }

      if (newCategory) {
        order.value.custCategory = newCategory;
      }

      if (newStatus) {
        order.value.custActiveStatus = newStatus;
      }
    }
);

const onConsigneeNameChange = () => {
  if (selectedCustomer.value) {
    order.value.address = selectedCustomer.value.cust_address;
    customerTableId.value = selectedCustomer.value.cust_id;
  }
};

// calculate total discounted amount
const calcGrandTotal = () => {
  let totalOrderAmt = 0;
  order.value.items.forEach((item) => {
    totalOrderAmt += item.totalAmt;
  });
  order.value.grandTotal = Math.round(parseFloat(totalOrderAmt) * 100) / 100;
};

// for updating total discounted amt
const updateTotalOrderAmt = (index, totalPrice) => {
  order.value.items[index].totalAmt = totalPrice;
  calcGrandTotal();
};

watch(
    order.value.items,
    () => {
      calcGrandTotal();
    },
    {deep: true}
);

// get the discountRate
const getDiscountAmount = (discount_amt) => {
  discountAmt.value = discount_amt;
};

const submitOrder = async () => {
  loading.value = true;

  const submitResult = await addNewOrder(order.value);

  if (submitResult) {
    const orderData = await fetchSingleDocRef(submitResult.recordId);

    // Save the order data to the Pinia store
    orderStore.pushOrder(orderData);

    // Notify user with message
    showSuccess(submitResult.bill_no);
    calcGrandTotal();
    order.value = {
      ...blankOrder,
      items: [
        {
          itemName: "",
          qty: 0,
          free: 0,
          tradePrice: 0,
          discount: 0,
          discountAmt: 0,
          tax: 0,
          totalAmt: 0,
        },
      ],
    };
    loading.value = false;
  } else {
    showError('did not save..!');
    calcGrandTotal();
    loading.value = false;
  }
};

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
