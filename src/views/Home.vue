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
        :globalFilterFields="['billNo', 'customerName', 'customerAddress', 'billDate', 'billAmount']"
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
      <Column field="customerName" header="Customer Name" sortable style="min-width: 14rem">
        <template #body="{ data }">
          {{ data.customerName }}
        </template>
      </Column>
      <Column field="customerAddress" header="Customer Address" sortable style="min-width: 18rem">
        <template #body="{ data }">
          {{ data.customerAddress }}
        </template>
      </Column>
      <Column field="billDate" header="Bill Date" sortable style="min-width: 12rem">
        <template #body="{ data }">
          {{ formatDate(data.bill_date) }}
        </template>
      </Column>
      <Column field="billAmount" header="Bill Amount" sortable style="min-width: 12rem">
        <template #body="{ data }">
          {{ formatCurrency(data.grand_total) }}
        </template>
      </Column>
      <Column header="Edit" style="min-width: 10rem">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" @click="openEditDialog(data)"/>
        </template>
      </Column>
    </DataTable>

    <!-- Edit Order Dialog -->
    <Dialog header="Edit Order" v-model:visible="editDialogVisible" :modal="true" :closable="true"
            :style="{ width: '50vw' }">
      <div class="p-grid p-fluid p-dialog-content">
        <div class="p-col-12">
          <label for="billNo">Bill No</label>
          <InputText v-model="selectedOrder.bill_no" id="billNo"/>
        </div>
        <div class="p-col-12">
          <label for="customerName">Customer Name</label>
          <InputText v-model="selectedOrder.customerName" id="customerName"/>
        </div>
        <div class="p-col-12">
          <label for="customerAddress">Customer Address</label>
          <InputText v-model="selectedOrder.customerAddress" id="customerAddress"/>
        </div>
        <div class="p-col-12">
          <label for="billDate">Bill Date</label>
          <Calendar v-model="selectedOrder.bill_date" id="billDate" dateFormat="dd/mm/yy"/>
        </div>
        <div class="p-col-12">
          <label for="billAmount">Bill Amount</label>
          <InputText v-model="selectedOrder.grand_total" id="billAmount"/>
        </div>
      </div>
      <template #footer>
        <div class="p-dialog-footer">
          <Button label="Cancel" icon="pi pi-times" @click="editDialogVisible = false" class="p-button-text"/>
          <Button label="Save" icon="pi pi-check" @click="saveOrder"/>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import {FilterMatchMode, FilterOperator} from "primevue/api";
import {fetchAllOrders, getCustomerNameFrmConsigneeId} from "../pocketbase/dbQueries";

const orders = ref([]);
const selectedCustomers = ref();
const selectedOrder = ref({});
const editDialogVisible = ref(false);

const filters = ref({
  global: {value: null, matchMode: FilterMatchMode.CONTAINS},
  billNo: {
    operator: FilterOperator.AND,
    constraints: [{value: null, matchMode: FilterMatchMode.STARTS_WITH}],
  },
  customerName: {
    operator: FilterOperator.AND,
    constraints: [{value: null, matchMode: FilterMatchMode.STARTS_WITH}],
  },
  customerAddress: {
    operator: FilterOperator.AND,
    constraints: [{value: null, matchMode: FilterMatchMode.STARTS_WITH}],
  },
  billDate: {
    operator: FilterOperator.AND,
    constraints: [{value: null, matchMode: FilterMatchMode.EQUALS}],
  },
  billAmount: {
    operator: FilterOperator.AND,
    constraints: [{value: null, matchMode: FilterMatchMode.EQUALS}],
  },
});

onMounted(async () => {
  initFilters();
  await fetchOrders();
});

const initFilters = () => {
  filters.value = {
    global: {value: null, matchMode: FilterMatchMode.CONTAINS},
    billNo: {
      operator: FilterOperator.AND,
      constraints: [{value: null, matchMode: FilterMatchMode.STARTS_WITH}],
    },
    customerName: {
      operator: FilterOperator.AND,
      constraints: [{value: null, matchMode: FilterMatchMode.STARTS_WITH}],
    },
    customerAddress: {
      operator: FilterOperator.AND,
      constraints: [{value: null, matchMode: FilterMatchMode.STARTS_WITH}],
    },
    billDate: {
      operator: FilterOperator.AND,
      constraints: [{value: null, matchMode: FilterMatchMode.EQUALS}],
    },
    billAmount: {
      operator: FilterOperator.AND,
      constraints: [{value: null, matchMode: FilterMatchMode.EQUALS}],
    },
  };
};

const fetchOrders = async () => {
  try {
    const orderData = await fetchAllOrders();
    orders.value = await Promise.all(
        orderData.map(async (order) => {
          const customerDetails = await getCustomerNameFrmConsigneeId(order.consignee_name);
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

const openEditDialog = (order) => {
  selectedOrder.value = {...order};
  editDialogVisible.value = true;
};

const saveOrder = () => {
  // Implement your save logic here
  console.log("Saved order:", selectedOrder.value);
  editDialogVisible.value = false;
};

const formatCurrency = (value) => {
  return value.toLocaleString("en-IN", {style: "currency", currency: "INR"});
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {day: '2-digit', month: '2-digit', year: 'numeric'}).format(new Date(date));
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