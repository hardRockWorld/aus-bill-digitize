import pb from "../pocketbase";

const addNewOrder = async (order, selectedCustomer) => {
  const data = {
    billNo: order.billNo,
    billDate: order.billDate,
    consigneeName: selectedCustomer,
    address: order.address,
    district: order.district,
    zone: order.zone,
    custCategory: order.custCategory,
    custActiveStatus: order.custActiveStatus,
    order_items: order.items,
    grandTotal: order.grandTotal,
    remark: order.remark,
    ratingRemark: order.ratingRemark,
  };

  const record = await pb.collection("orders").create(data);
  const recordId = record.id;
  const recordBillNo = record.billNo;
  console.debug("order written with ID: ", recordId);
  console.debug("Bill No: ", recordBillNo);

  // Return an object containing both docRef and sln
  return {
    record,
    recordId,
    recordBillNo,
  };
};

const fetchSingleDocRef = async (recordId) => {
  // Retrieve the document data using the recordId
  const record = await pb.collection("orders").getOne(recordId, {
    expand: "bill_No,consignee_name.cust_name,cust_address.cust_name",
  });
  return record.data();
};

// Get a single order by sln
const getOrderBySLN = async (sln) => {
  const orderRef = doc(db, "orders", sln);

  try {
    const orderDoc = await getDoc(orderRef);
    if (orderDoc.exists()) {
      return { ...orderDoc.data(), id: orderDoc.id };
    } else {
      console.error("Order not found!");
      return null;
    }
  } catch (error) {
    console.error("Error getting order:", error);
    return null;
  }
};

const fetchAllOrders = async () => {
  let orders = []; // Clear the orders array
  const q = query(collection(db, "orders"), orderBy("sln", "desc"));

  const querySnapshot = await getDocs(q);
  await querySnapshot.forEach((doc) => {
    orders.push({ ...doc.data(), id: doc.id });
  });

  return orders;
};

const updateEditOrder = async (db, currentOrder) => {
  let result;
  const docRef = doc(db, "orders", currentOrder.id);
  try {
    await updateDoc(docRef, {
      customerName: currentOrder.customerName,
      customerAddress: currentOrder.customerAddress,
      orderDate: currentOrder.orderDate,
      salesman: currentOrder.salesman,
      items: currentOrder.items,
      status: currentOrder.status,
      notes: currentOrder.notes,
      discount: currentOrder.discount,
      totalBillAmt: currentOrder.totalBillAmt,
      totalMrpBillAmt: currentOrder.totalMrpBillAmt,
      createdBy: currentOrder.createdBy,
    });
    result = true;
  } catch (e) {
    result = false;
  }

  return result;
};

const updateUnEditOrder = async (db, currentOrder) => {
  let result;
  const docRef = doc(db, "orders", currentOrder.id);
  try {
    await updateDoc(docRef, {
      status: currentOrder.status,
      notes: currentOrder.notes,
    });
    result = true;
  } catch (e) {
    result = false;
  }

  return result;
};

// Get all customer details
const getAllCustomers = async () => {
  const customers = await pb.collection("customer_details").getFullList();
  return customers.map((customer) => ({
    cust_name: customer.cust_name,
    cust_address: customer.cust_address,
  }));
};

// Get customer categories
const getCustomerCategories = async () => {
  const categories = await pb.collection("orders").getList(1, 100, {
    filter: `category != ''`,
  });

  return categories.map((item) => item.category);
};

// Get customer active statuses
const getCustomerActiveStatuses = async () => {
  const statuses = await pb.collection("orders").getList(1, 100, {
    filter: `active_status != ''`,
  });

  return statuses.map((item) => item.active_status);
};

export {
  addNewOrder,
  fetchSingleDocRef,
  fetchAllOrders,
  updateUnEditOrder,
  updateEditOrder,
  getOrderBySLN,
  getAllCustomers,
  getCustomerCategories,
  getCustomerActiveStatuses,
};
