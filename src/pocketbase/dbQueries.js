import pb from "../pocketbase";

const addNewOrder = async (order) => {
  const orderItems = [];

  for (const item of order.items) {
    const orderItem = {
      item_name: item.itemName,
      qty: item.qty,
      free: item.free,
      trade_price: item.tradePrice,
      discount: item.discount,
      tax: item.tax,
      total_amt: item.totalAmt,
    };

    const itemAdded = await pb.collection("order_items").create(orderItem);
    orderItems.push(itemAdded.id);
  }

  const data = {
    bill_no: order.billNo,
    bill_date: order.billDate,
    consignee_name: order.consigneeName,
    address: order.address,
    district: order.district,
    zone: order.zone,
    cust_category: order.custCategory,
    cust_active_status: order.custActiveStatus,
    order_items: orderItems,
    grand_total: order.grandTotal,
    remark: order.remark,
    rating_remark: order.ratingRemark,
  };

  const record = await pb.collection("orders").create(data);
  const recordId = record.id;
  const recordBillNo = record.bill_no;
  console.log("order written with ID: ", recordId);
  console.log("Bill No: ", recordBillNo);

  // Return an object containing both docRef and sln
  return {
    record,
    recordId,
    recordBillNo,
  };
};

const fetchSingleRecordItems = async (recordId) => {
  try {
    const record = await pb.collection("orders").getOne(recordId, {
      expand: "order_items",
    });
    if (record == undefined) {
      return undefined;
    }

    // Check if the expanded order_items is an array
    const orderItems = [];
    if (record.expand && Array.isArray(record.expand.order_items)) {
      record.expand.order_items.forEach((item) => {
        // information for order_items
        orderItems.push({
          id: item.id,
          item_name: item.item_name,
          qty: item.qty,
          discount: item.discount || 0,
          free: item.free,
          trade_price: item.trade_price || 0,
          tax: item.tax || 0,
          total_amt: item.total_amt || 0,
        });
      });
    }
    return {
      id: record.id,
      address: record.address,
      bill_date: record.bill_date,
      bill_no: record.bill_no,
      consignee_name: record.consignee_name,
      cust_active_status: record.cust_active_status,
      cust_category: record.cust_category,
      district: record.district,
      grand_total: record.grand_total,
      rating_remark: record.rating_remark,
      remark: record.remark,
      zone: record.zone,
      orderItems: orderItems,
      created: record.created,
      updated: record.updated,
    };
  } catch (error) {
    console.error("Error fetching single record items:", error);
    return undefined;
  }
};

// Update customer data for a specific order
const updateCustomerData = async (orderId, customerData) => {
  try {
    console.log("this is the order id for update customer data: ", orderId);
    console.log("customer data for update is: ", customerData);
    await pb.collection("orders").update(orderId, customerData);
    console.log("customer data updated success!");
    return true;
  } catch (error) {
    console.error("Error updating customer data:", error);
    return false;
  }
};

// Update order items for a specific order
const updateOrderItems = async (orderId, orderItems) => {
  const results = [];
  try {
    // Delete existing order items for the given order ID
    const existingOrder = await pb.collection("orders").getOne(orderId);

    for (const orderItemId of existingOrder.order_items) {
      await pb.collection("order_items").delete(orderItemId);
    }

    // Insert new or updated order items
    for (const item of orderItems) {
      const itemPayload = {
        item_name: item.item_name,
        qty: item.qty,
        discount: item.discount,
        free: item.free,
        trade_price: item.trade_price,
        tax: item.tax,
        total_amt: item.total_amt,
      };

      const insertedItem = await pb
        .collection("order_items")
        .create(itemPayload);
      results.push(insertedItem.id);
    }

    // // Retrieve the existing grand_total value
    // const existingGrandTotal = existingOrder.grand_total;
    // console.log("existing order is :", existingOrder);
    // console.log("existing grand_total is: ", existingGrandTotal);

    // // Calculate the new grand_total
    // const newGrandTotal = orderItems.reduce(
    //   (total, item) => total + item.total_amt,
    //   0
    // );

    // console.log("new grand total is: ", newGrandTotal);

    // // Update the orders collection with the new grand_total
    // await pb.collection("orders").update(orderId, {
    //   grand_total: newGrandTotal,
    // });
  } catch (error) {
    console.error("Error updating order items:", error);
    return undefined;
  }
  console.log("Updated order items i.e. results array :", results);
  return results;
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

  // you can also fetch all records at once via getFullList
  const records = await pb.collection("orders").getFullList({
    sort: "-bill_no",
  });

  records.forEach((record) => {
    orders.push(record);
  });

  // log orders
  console.log(orders);

  return orders;
};

const getCustomerNameFrmConsigneeId = async (consigneeId) => {
  const consigneeRecord = await pb
    .collection("customer_details")
    .getOne(consigneeId);

  const customerName = consigneeRecord.cust_name;
  const customerAddress = consigneeRecord.cust_address;

  return {
    customerName,
    customerAddress,
  };
};

// Update the order details after editing
const updateOrder = async (orderId, orderData, items) => {
  try {
    // Update the order details
    await pb.collection("orders").update(orderId, orderData);

    // check the content of items parameter
    console.log("items param for updateOrder is: ", items);

    // Update each order item
    for (const item of items) {
      // check the content of each item
      console.log("item for payload is: ", item);

      const itemPayload = {
        id: item.id,
        item_name: item.item_name,
        qty: item.qty,
        discount: item.discount,
        free: item.free,
        trade_price: item.trade_price,
        tax: item.tax,
        total_amt: item.total_amt,
      };

      console.log("Updating/Creating item:", itemPayload); // Log the payload

      if (item.id) {
        // Existing item, update it
        await pb.collection("order_items").update(item.id, itemPayload);
      } else {
        // New item, create it
        await pb.collection("order_items").create(itemPayload);
      }
    }

    // Handle deletion of removed items (if necessary)
    for (const itemId of orderData.itemsToDelete || []) {
      await pb.collection("order_items").delete(itemId);
    }

    return true;
  } catch (error) {
    console.error(
      "Error updating order:",
      error.response ? error.response.data : error
    );
    return false;
  }
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
    cust_id: customer.id,
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
  fetchSingleRecordItems,
  fetchAllOrders,
  updateCustomerData,
  updateOrderItems,
  updateOrder,
  updateUnEditOrder,
  updateEditOrder,
  getOrderBySLN,
  getAllCustomers,
  getCustomerCategories,
  getCustomerActiveStatuses,
  getCustomerNameFrmConsigneeId,
};
