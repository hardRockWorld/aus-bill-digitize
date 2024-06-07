import pb from "../pocketbase";

const addNewOrder = async (order) => {
    const orderItems = [];

    for (const item of order.items) {
        const orderItem = {
            item_name: item.itemName.name,
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

const fetchSingleDocRef = async (recordId) => {
    // Retrieve the document data using the recordId
    const record = await pb.collection("orders").getOne(recordId, {
        expand: "bill_No,consignee_name.cust_name,cust_address.cust_name",
    });
    return record;
};

// Get a single order by sln
const getOrderBySLN = async (sln) => {
    const orderRef = doc(db, "orders", sln);

    try {
        const orderDoc = await getDoc(orderRef);
        if (orderDoc.exists()) {
            return {...orderDoc.data(), id: orderDoc.id};
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
    const records = await pb.collection('orders').getFullList({
        sort: '-bill_no',
    });

    records.forEach((record) => {
        orders.push(record);
    })

    return orders;
};

const getCustomerNameFrmConsigneeId = async (consigneeId) => {
    const consigneeRecord = await pb.collection('customer_details').getOne(consigneeId);

    const customerName = consigneeRecord.cust_name;
    const customerAddress = consigneeRecord.cust_address;

    return {
        customerName,
        customerAddress,
    };
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
    fetchSingleDocRef,
    fetchAllOrders,
    updateUnEditOrder,
    updateEditOrder,
    getOrderBySLN,
    getAllCustomers,
    getCustomerCategories,
    getCustomerActiveStatuses,
    getCustomerNameFrmConsigneeId,
};
