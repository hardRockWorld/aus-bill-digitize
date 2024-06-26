<template>
  <div class="card h-full">
    <DataTable
      v-model:filters="filters"
      v-model:selection="selectedCustomers"
      :value="orders"
      paginator
      :rows="10"
      dataKey="id"
      filterDisplay="menu"
      :globalFilterFields="[
        'billNo',
        'customerName',
        'customerAddress',
        'billDate',
        'billAmount',
      ]"
    >
      <template #header>
        <div class="flex justify-between">
          <Button
            type="button"
            icon="pi pi-filter-slash"
            label="Clear"
            outlined
            @click="clearFilter()"
          />
          <span class="relative">
            <i
              class="pi pi-search absolute top-2/4 -mt-2 left-3 text-surface-400 dark:text-surface-600"
            />
            <InputText
              v-model="filters['global'].value"
              placeholder="Keyword Search"
              class="pl-10 font-normal"
            />
          </span>
        </div>
      </template>
      <template #empty> No orders found.</template>
      <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
      <Column field="billNo" header="Bill No" sortable style="min-width: 8rem">
        <template #body="{ data }">
          {{ data.bill_no }}
        </template>
      </Column>
      <Column
        field="customerName"
        header="Customer Name"
        sortable
        style="min-width: 14rem"
      >
        <template #body="{ data }">
          {{ data.customerName }}
        </template>
      </Column>
      <Column
        field="customerAddress"
        header="Customer Address"
        sortable
        style="min-width: 18rem"
      >
        <template #body="{ data }">
          {{ data.customerAddress }}
        </template>
      </Column>
      <Column
        field="billDate"
        header="Bill Date"
        sortable
        style="min-width: 12rem"
      >
        <template #body="{ data }">
          {{ formatDate(data.bill_date) }}
        </template>
      </Column>
      <Column
        field="billAmount"
        header="Bill Amount"
        sortable
        style="min-width: 12rem"
      >
        <template #body="{ data }">
          {{ formatCurrency(data.grand_total) }}
        </template>
      </Column>
      <Column header="Edit" style="min-width: 10rem">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" @click="openEditDialog(data)" />
        </template>
      </Column>
    </DataTable>

    <!-- Edit Order Dialog -->
    <Dialog
      header="Edit Order"
      v-model:visible="editDialogVisible"
      :modal="true"
      :closable="true"
      :style="{ width: '50vw' }"
    >
      <div class="p-grid p-fluid p-dialog-content">
        <div class="p-col-12">
          <label for="billNo">Bill No</label>
          <InputText v-model="selectedOrder.bill_no" id="billNo" />
        </div>
        <div class="p-col-12">
          <label for="customerName">Customer Name</label>
          <InputText v-model="selectedOrder.customerName" id="customerName" />
        </div>
        <div class="p-col-12">
          <label for="customerAddress">Customer Address</label>
          <InputText
            v-model="selectedOrder.customerAddress"
            id="customerAddress"
          />
        </div>
        <div class="p-col-12">
          <label for="billDate">Bill Date</label>
          <Calendar
            v-model="selectedOrder.bill_date"
            id="billDate"
            dateFormat="dd/mm/yy"
          />
        </div>
        <div v-for="(item, i) in selectedOrder.items" :key="i" class="p-col-12">
          <OrderItemsRow
            v-model:itemName="item.itemName"
            v-model:qty="item.qty"
            v-model:free="item.free"
            v-model:tradePrice="item.tradePrice"
            v-model:discount="item.discount"
            v-model:tax="item.tax"
            :index="i"
            :products="products"
            @delete-item="
              (idx) => {
                selectedOrder.items.splice(idx, 1);
                calcGrandTotal(); // Call the calcGrandTotal function
              }
            "
            @update:total-price="
              (totalPrice) => updateTotalOrderAmt(i, totalPrice)
            "
            @update:discount="(discount_amt) => getDiscountAmount(discount_amt)"
          />
        </div>
        <div class="p-col-12">
          <!-- Add item -->
          <Button
            @click="addOrderItem"
            class="secondary"
            :disabled="isSaveButtonDisabled"
          >
            Add item
          </Button>
        </div>
        <div class="p-col-12">
          <label for="grandTotal">Grand Total:</label>
          <InputText id="grandTotal" v-model="selectedOrder.grand_total" />
        </div>
        <div class="p-col-12">
          <label for="remark">Remark:</label>
          <InputText id="remark" v-model="selectedOrder.remark" />
        </div>
        <div class="p-col-12">
          <label for="ratingRemark">Rating Remark:</label>
          <InputText id="ratingRemark" v-model="selectedOrder.rating_remark" />
        </div>
      </div>
      <template #footer>
        <div class="p-dialog-footer">
          <Button
            label="Cancel"
            icon="pi pi-times"
            @click="editDialogVisible = false"
            class="p-button-text"
          />
          <Button label="Save" icon="pi pi-check" @click="saveOrder" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { FilterMatchMode, FilterOperator } from "primevue/api";
import {
  fetchAllOrders,
  getCustomerNameFrmConsigneeId,
  fetchSingleRecordItems,
  updateCustomerData,
  updateOrderItems,
} from "../pocketbase/dbQueries";
import OrderItemsRow from "../components/OrderItemsRow.vue";
import { products } from "../util/constants.js";

const orders = ref([]);
const selectedCustomers = ref();
const selectedOrder = ref({
  items: [], // Initialize items to an empty array
});
const editDialogVisible = ref(false);

const discountAmt = ref(0);

const addOrderItem = () => {
  if (!selectedOrder.value.items) {
    selectedOrder.value.items = [];
  }
  selectedOrder.value.items.push({
    itemName: "",
    qty: 0,
    free: 0,
    tradePrice: 0,
    discount: 0,
    tax: 0,
    totalAmt: 0,
  });
};

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  billNo: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  customerName: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  customerAddress: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  billDate: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
  },
  billAmount: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
  },
});

onMounted(async () => {
  initFilters();
  await fetchOrders();
});

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    billNo: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    customerName: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    customerAddress: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    billDate: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
    billAmount: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
  };
};

const fetchOrders = async () => {
  try {
    const orderData = await fetchAllOrders();
    orders.value = await Promise.all(
      orderData.map(async (order) => {
        const customerDetails = await getCustomerNameFrmConsigneeId(
          order.consignee_name
        );
        return {
          ...order,
          customerName: customerDetails.customerName,
          customerAddress: customerDetails.customerAddress,
        };
      })
    );
    console.log("Successfully fetched all orders with customer details.");
  } catch (error) {
    console.log("Failed to fetch orders.", error);
  }
};

// calculate total discounted amount
const calcGrandTotal = () => {
  let totalOrderAmt = 0;
  selectedOrder.value.items.forEach((item) => {
    totalOrderAmt += item.totalAmt || 0; // Ensure totalAmt is defined
  });
  selectedOrder.value.grand_total =
    Math.round(parseFloat(totalOrderAmt) * 100) / 100;
};

// get the discountRate
const getDiscountAmount = (discount_amt) => {
  discountAmt.value = discount_amt;
};

// for updating total discounted amt
const updateTotalOrderAmt = (index, totalPrice) => {
  selectedOrder.value.items[index].totalAmt = totalPrice;
  calcGrandTotal();
};

const openEditDialog = async (order) => {
  selectedOrder.value = { ...order, items: [] };
  const rowItems = await fetchSingleRecordItems(order.id);
  selectedOrder.value.items = rowItems.orderItems.map((item) => ({
    id: item.id,
    itemName: item.item_name,
    qty: item.qty,
    free: item.free,
    tradePrice: item.trade_price,
    discount: item.discount,
    tax: item.tax,
    totalAmt: item.total_amt,
  }));
  console.log(
    "items in the openEditDialog method: ",
    selectedOrder.value.items
  );
  editDialogVisible.value = true;
};

const saveOrder = async () => {
  // Prepare data to update the order
  const orderData = {
    bill_no: selectedOrder.value.bill_no,
    customerName: selectedOrder.value.customerName,
    customerAddress: selectedOrder.value.customerAddress,
    bill_date: selectedOrder.value.bill_date,
    grand_total: selectedOrder.value.grand_total,
    remark: selectedOrder.value.remark,
    rating_remark: selectedOrder.value.rating_remark,
    order_items: [], // Add order_items property
  };

  const items = selectedOrder.value.items.map((item) => ({
    id: item.id || "", // Include item ID for existing items
    item_name: item.itemName,
    qty: item.qty,
    discount: item.discount,
    free: item.free,
    trade_price: item.tradePrice,
    tax: item.tax,
    total_amt: item.totalAmt,
  }));

  // Update order items
  const itemsUpdateSuccess = await updateOrderItems(
    selectedOrder.value.id,
    items
  );

  if (itemsUpdateSuccess) {
    // Add updated items to orderData
    orderData.order_items = itemsUpdateSuccess;

    // Update customer data
    const success = await updateCustomerData(selectedOrder.value.id, orderData);

    if (success) {
      console.log("Order saved successfully.");
      editDialogVisible.value = false;
      await fetchOrders();
    } else {
      console.log("Failed to save order.");
    }
  } else {
    console.log("Failed to update order items.");
  }
};

const isSaveButtonDisabled = computed(() => {
  const hasInvalidQuantity = selectedOrder.value.items.some(
    (item) => item.qty < 1
  );
  const hasInvalidName = selectedOrder.value.items.some((item) => {
    const productName = (item.itemName || "").toString().trim();
    return productName === "";
  });
  return hasInvalidQuantity || hasInvalidName;
});

const formatCurrency = (value) => {
  return value.toLocaleString("en-IN", { style: "currency", currency: "INR" });
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
};

const clearFilter = () => {
  initFilters();
};
</script>

<style scoped>
.p-grid .p-col-12 {
  margin-bottom: 1.5rem;
}

.p-dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.p-dialog-footer {
  justify-content: center;
}
</style>
