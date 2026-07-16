const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user-login");
const Address = require("../models/address");
const Admin = require("../models/user");
const {sendInvoiceEmail} = require("../middleware/mail");

const calculateVariantPrice = require("../utils/price-calculator");

exports.createOrder = async (req, res) => {

    try {

        const {

            orderSource,
            branch,
            subBranch,
            createdBy,
            user,
            customerDetails,
            address,
            paymentMethod,
            items,
            couponCode,
            notes

        } = req.body;

        // ===========================
        // BASIC VALIDATION
        // ===========================

        if (!orderSource) {
            return res.status(400).json({
                success: false,
                message: "Order source is required"
            });
        }

        if (!paymentMethod) {
            return res.status(400).json({
                success: false,
                message: "Payment method is required"
            });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Order items are required"
            });
        }

        let userData = null;
        let addressData = null;

        // ===========================
        // ONLINE ORDER
        // ===========================

        if (orderSource === "ONLINE") {

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "User is required"
                });
            }

            if (!address) {
                return res.status(400).json({
                    success: false,
                    message: "Address is required"
                });
            }

            userData = await User.findById(user);

            if (!userData) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            addressData = await Address.findById(address);

            if (!addressData) {
                return res.status(404).json({
                    success: false,
                    message: "Address not found"
                });
            }

        }

        // ===========================
        // BRANCH ORDER
        // ===========================

        if (orderSource === "BRANCH") {


            const branchData = await Admin.findOne({
                _id: branch,
                role: "BRANCH"
            });

            if (!branchData) {
                return res.status(404).json({
                    success: false,
                    message: "Branch not found"
                });
            }

        }

        // ===========================
        // SUB BRANCH ORDER
        // ===========================

        if (orderSource === "SUB_BRANCH") {

            const subBranchData = await Admin.findOne({
                _id: subBranch,
                role: "SUB_BRANCH"
            });

            if (!subBranchData) {
                return res.status(404).json({
                    success: false,
                    message: "Sub Branch not found"
                });
            }

        }

        // ===========================
        // ORDER NUMBER
        // ===========================

        const lastOrder = await Order.findOne()
            .sort({ createdAt: -1 })
            .select("orderNumber invoiceNumber");


        let nextOrderNumber = 1001;

        if (lastOrder && lastOrder.orderNumber) {

            const lastNumber = Number(
                lastOrder.orderNumber.replace("ORD", "")
            );

            nextOrderNumber = lastNumber + 1;

        }


        const orderNumber = `ORD${nextOrderNumber}`;

        const invoiceNumber = `INV${nextOrderNumber}`;



        // ===========================
        // TOTAL VARIABLES
        // ===========================

        let orderItems = [];

        let subTotal = 0;

        let discountAmount = 0;

        let gstAmount = 0;

        let totalAmount = 0;

        // ===========================
        // PART-2 STARTS HERE
        // ===========================
        // ===========================
        // PRODUCT LOOP
        // ===========================

        for (const item of items) {

            // ===========================
            // PRODUCT CHECK
            // ===========================

            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found"
                });
            }

            // ===========================
            // VARIANT CHECK
            // ===========================

            const variant = product.variants.find(
                v => v._id.toString() === item.variant
            );

            if (!variant) {
                return res.status(404).json({
                    success: false,
                    message: "Variant not found"
                });
            }

            // ===========================
            // STOCK CHECK
            // ===========================

            if (variant.stock < item.quantity) {

                return res.status(400).json({

                    success: false,

                    message: `${product.name} stock not available`

                });

            }

            // ===========================
            // PRICE CALCULATION
            // ===========================

            const priceDetails =
                await calculateVariantPrice(variant);

            const unitPrice =
                priceDetails.finalPrice;

            const totalPrice =
                unitPrice * item.quantity;

            // ===========================
            // TOTALS
            // ===========================

            subTotal += totalPrice;

            discountAmount +=
                priceDetails.discountAmount * item.quantity;

            gstAmount +=
                priceDetails.gstAmount * item.quantity;

            totalAmount += totalPrice;

            // ===========================
            // ORDER ITEM
            // ===========================

            orderItems.push({

                product: product._id,

                variant: variant._id,

                productSnapshot: {

                    name: product.name,

                    slug: product.slug,

                    image: product.images?.[0] || "",

                    category: product.category?.toString(),

                    subCategory: product.subCategory?.toString(),

                    subSubCategory: product.subSubCategory?.toString(),

                    productType: product.productType,

                    brand: product.brand

                },

                variantSnapshot: {

                    sku: variant.sku,

                    metalType: variant.metalType,

                    purity: variant.metalPurity,

                    metalColor: variant.metalColor,

                    size: variant.size,

                    grossWeight: variant.grossWeight,

                    netWeight: variant.netWeight,

                    wastagePercentage: variant.wastagePercentage,

                    stoneWeight:
                        variant.stones?.reduce(

                            (sum, stone) =>

                                sum + Number(stone.totalWeight || 0),

                            0

                        ),

                    diamondWeight:
                        variant.diamonds?.reduce(

                            (sum, diamond) =>

                                sum + Number(diamond.totalWeight || 0),

                            0

                        ),

                    makingCharge:
                        variant.makingCharges,

                    makingChargeType:
                        variant.makingChargeType,

                    discountPercentage:
                        variant.discountPercentage,

                    stoneType:
                        variant.stones?.[0]?.stoneType || "",

                    gender:
                        product.gender,
                    stones: priceDetails.stones

                },

                pricingSnapshot: {

                    goldRate:
                        priceDetails.metalRate,

                    goldValue:
                        priceDetails.metalValue,

                    wastageAmount:
                        priceDetails.wastageAmount,

                    stoneValue:
                        priceDetails.stoneValue,

                    diamondValue:
                        priceDetails.diamondValue || 0,

                    makingCharge:
                        priceDetails.makingCharges,

                    discountAmount:
                        priceDetails.discountAmount,

                    gstPercentage: 3,

                    gstAmount:
                        priceDetails.gstAmount,

                    finalPrice:
                        priceDetails.finalPrice

                },

                quantity:
                    item.quantity,

                unitPrice,

                totalPrice

            });

        }

        // ===========================
        // PART-3 STARTS HERE
        // ===========================
        // ===========================
        // STOCK UPDATE
        // ===========================

        for (const item of items) {

            const product = await Product.findById(item.product);

            const variant = product.variants.id(item.variant);

            variant.stock -= item.quantity;

            await product.save();

        }

        // ===========================
        // PAYMENT HISTORY
        // ===========================
        let paymentStatus;
        let orderStatus;
        let billingStatus;

        if (orderSource === "ONLINE") {

            if (paymentMethod === "COD") {

                paymentStatus = "Pending";
                orderStatus = "Pending";
                billingStatus = "Draft";

            } else {

                paymentStatus = "Paid";
                orderStatus = "Confirmed";
                billingStatus = "Completed";

            }

        } else {

            paymentStatus = "Paid";
            orderStatus = "Delivered";
            billingStatus = "Completed";

        }

        const paymentHistory = [];

        if (paymentStatus === "Paid") {

            paymentHistory.push({

                method: paymentMethod,

                amount: totalAmount,

                transactionId: null,

                paymentGateway: null,

                paidAt: new Date()

            });

        }

        // ===========================
        // STATUS HISTORY
        // ===========================

        const statusHistory = [

            {

                status: "orderStatus",

                updatedBy: createdBy || null,

                remarks: "Order Created",

                updatedAt: new Date()

            }

        ];

        // ===========================
        // CREATE ORDER
        // ===========================

        const order = await Order.create({

            orderNumber,

            invoiceNumber,

            orderSource,

            branch: branch || null,

            subBranch: subBranch || null,

            createdBy: createdBy || null,

            user: user || null,

            customerDetails,

            items: orderItems,

            address: address || null,

            addressSnapshot: addressData
                ? {
                    fullName: addressData.fullName,
                    phone: addressData.phone,
                    alternatePhone: addressData.alternatePhone,
                    addressLine1: addressData.addressLine1,
                    addressLine2: addressData.addressLine2,
                    landmark: addressData.landmark,
                    city: addressData.city,
                    state: addressData.state,
                    country: addressData.country,
                    postalCode: addressData.pincode
                }
                : {},

            paymentMethod,

            paymentStatus,

            paymentHistory,

            subTotal,

            discountAmount,

            couponCode,

            shippingCharge: 0,

            gstAmount,

            totalAmount,

            orderStatus,

            billingStatus,

            statusHistory,

            stockUpdated: true,

            invoicePrinted: false,

            invoiceDate: new Date(),

            notes

        });


/* ===========================
   SEND INVOICE MAIL
=========================== */

if (customerDetails?.email) {

    const logo = "https://your-domain.com/logo.png"; // Replace with your logo URL

const invoiceHtml = `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

</head>

<body style="margin:0;padding:30px;background:#f5f5f5;font-family:Arial,sans-serif;">

<table width="700" align="center"
style="background:#ffffff;border-radius:12px;overflow:hidden;
box-shadow:0 5px 20px rgba(0,0,0,.15);">

<!-- Header -->

<tr>

<td
style="background:#640101;
padding:25px;
text-align:center;">

<img
src="${logo}"
width="90"
style="margin-bottom:10px;">

<h1
style="color:#ffffff;
margin:0;
font-size:28px;">

OZO Gold & Diamond Jewellery

</h1>

<p
style="color:#d4af37;
margin-top:8px;">

Premium Jewellery Invoice

</p>

</td>

</tr>

<!-- Customer -->

<tr>

<td style="padding:30px;">

<h2
style="color:#640101;
margin-bottom:20px;">

Invoice Details

</h2>

<table width="100%" cellpadding="8">

<tr>

<td>

<b>Invoice No</b>

</td>

<td>

${order.invoiceNumber}

</td>

</tr>

<tr>

<td>

<b>Order No</b>

</td>

<td>

${order.orderNumber}

</td>

</tr>

<tr>

<td>

<b>Customer</b>

</td>

<td>

${customerDetails.name}

</td>

</tr>

<tr>

<td>

<b>Phone</b>

</td>

<td>

${customerDetails.phone}

</td>

</tr>

<tr>

<td>

<b>Email</b>

</td>

<td>

${customerDetails.email}

</td>

</tr>

<tr>

<td>

<b>Payment</b>

</td>

<td>

${order.paymentMethod}

</td>

</tr>

</table>

</td>

</tr>

<!-- Product Table -->

<tr>

<td style="padding:0 30px 30px;">

<table
width="100%"
cellpadding="12"
style="border-collapse:collapse;">

<tr
style="background:#d4af375d;color:#640101;">

<th align="left">Image</th>

<th align="left">Product</th>

<th align="left">SKU</th>

<th align="center">Qty</th>

<th align="right">Price</th>

</tr>

${order.items.map(item=>`

<tr
style="border-bottom:1px solid #eee;">

<td>

<img
src="${item.productSnapshot.image}"
width="60"
height="60"
style="border-radius:8px;object-fit:cover;">

</td>

<td>

<b>${item.productSnapshot.name}</b>

<br>

<span
style="color:#777;font-size:12px;">

${item.productSnapshot.productType || ""}

</span>

</td>

<td>

${item.variantSnapshot.sku}

</td>

<td align="center">

${item.quantity}

</td>

<td align="right">

₹ ${item.totalPrice.toLocaleString("en-IN")}

</td>

</tr>

`).join("")}

</table>

</td>

</tr>

<!-- Total -->

<tr>

<td style="padding:0 30px 30px;">

<table
width="320"
align="right"
cellpadding="8">

<tr>

<td>

Subtotal

</td>

<td align="right">

₹ ${order.subTotal.toLocaleString("en-IN")}

</td>

</tr>

<tr>

<td>

GST

</td>

<td align="right">

₹ ${order.gstAmount.toLocaleString("en-IN")}

</td>

</tr>

<tr>

<td>

Discount

</td>

<td align="right">

₹ ${order.discountAmount.toLocaleString("en-IN")}

</td>

</tr>

<tr
style="background:#640101;
color:#fff;
font-size:18px;">

<td>

Grand Total

</td>

<td align="right">

₹ ${order.totalAmount.toLocaleString("en-IN")}

</td>

</tr>

</table>

</td>

</tr>

<!-- Footer -->

<tr>

<td
style="background:#f7f7f7;
padding:25px;
text-align:center;">

<h3
style="color:#640101;
margin-bottom:8px;">

Thank You ❤️

</h3>

<p
style="color:#666;">

Thank you for shopping with

<b>OZO Gold & Diamond Jewellery</b>

</p>

<p
style="font-size:12px;color:#999;">

This is a system generated invoice.

</p>

</td>

</tr>

</table>

</body>

</html>

`;

    await sendInvoiceEmail(

        customerDetails.email,

        `Invoice - ${order.invoiceNumber}`,

        invoiceHtml

    );

}

        // ===========================
        // RESPONSE
        // ===========================

        return res.status(201).json({

            success: true,

            message: "Order created successfully.",

            data: order

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};





exports.getAllOrders = async (req, res) => {
    try {

        // ===============================
        // QUERY PARAMS
        // ===============================

        let {
            page = 1,
            limit = 10,
            search = "",
            orderSource,
            orderStatus,
            paymentStatus,
            subBranch,
            fromDate,
            toDate,
            sortBy = "latest"
        } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        const skip = (page - 1) * limit;

        // ===============================
        // USER DETAILS
        // ===============================

        const { id, role } = req.user;

        // ===============================
        // FILTER
        // ===============================

        let filter = {};

        // ===============================
        // ROLE BASED FILTER
        // ===============================

        if (role === "BRANCH") {

            // Branch can view its own orders
            // and all its sub branch orders

            filter.branch = id;

        }

        if (role === "SUB_BRANCH") {

            // Sub Branch can view only its orders

            filter.subBranch = id;

        }

        // ===============================
        // SEARCH
        // ===============================

        if (search) {

            filter.$or = [

                {
                    orderNumber: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    invoiceNumber: {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    "customerDetails.name": {
                        $regex: search,
                        $options: "i"
                    }
                },

                {
                    "customerDetails.phone": {
                        $regex: search,
                        $options: "i"
                    }
                }

            ];

        }

        // ===============================
        // ORDER SOURCE FILTER
        // ===============================

        if (orderSource) {

            filter.orderSource = orderSource;

        }

        // ===============================
        // ORDER STATUS FILTER
        // ===============================

        if (orderStatus) {

            filter.orderStatus = orderStatus;

        }

        // ===============================
        // PAYMENT STATUS FILTER
        // ===============================

        if (paymentStatus) {

            filter.paymentStatus = paymentStatus;

        }

        // ===============================
        // SUB BRANCH FILTER
        // (Only Branch Can Filter)
        // ===============================

        if (

            role === "BRANCH" &&

            subBranch

        ) {

            filter.subBranch = subBranch;

        }

        // ===============================
        // DATE FILTER
        // ===============================

        if (fromDate || toDate) {

            filter.createdAt = {};

            if (fromDate) {

                filter.createdAt.$gte = new Date(fromDate);

            }

            if (toDate) {

                const endDate = new Date(toDate);

                endDate.setHours(23, 59, 59, 999);

                filter.createdAt.$lte = endDate;

            }

        }

        // ===============================
        // SORTING
        // ===============================

        let sort = {
            createdAt: -1
        };

        if (sortBy === "oldest") {

            sort = {
                createdAt: 1
            };

        }

        if (sortBy === "amount") {

            sort = {
                totalAmount: -1
            };

        }

        // ===============================
        // TOTAL COUNT
        // ===============================

        const totalOrders = await Order.countDocuments(filter);

        // ===============================
        // FETCH ORDERS
        // ===============================

        const orders = await Order.find(filter)

            .populate(
                "branch",
                "name email contactNumber"
            )

            .populate(
                "subBranch",
                "name email contactNumber"
            )

            .populate(
                "createdBy",
                "name email role"
            )

            .populate(
                "user",
                "name email"
            )

            .sort(sort)

            .skip(skip)

            .limit(limit);

        // ===============================
        // RESPONSE
        // ===============================

        return res.status(200).json({

            success: true,

            message: "Orders fetched successfully.",

            pagination: {

                currentPage: page,

                pageSize: limit,

                totalOrders,

                totalPages: Math.ceil(totalOrders / limit),

                hasNextPage:
                    page < Math.ceil(totalOrders / limit),

                hasPreviousPage:
                    page > 1

            },

            data: orders

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }
};
exports.getAllOrders = async (req, res) => {

    try {

        const orders = await Order.find()

            .populate("user", "name phone email")

            .populate("branch", "name email contactNumber role")

            .populate("subBranch", "name email contactNumber role")

            .populate("createdBy", "name email role")

            .populate("address")

            .populate("items.product", "name slug images category subCategory subSubCategory brand")

            .sort({ createdAt: -1 });

        res.status(200).json({

            success: true,

            count: orders.length,

            data: orders

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// get order by user 

exports.getOrdersByUser = async (req, res) => {

    try {

        const { userId } = req.params;

        const orders = await Order.find({

            user: userId

        })

            .populate("user", "name phone email")

            .populate("address")

            .populate("statusHistory.updatedBy", "name role")

            .sort({ createdAt: -1 });

        if (!orders.length) {

            return res.status(404).json({

                success: false,

                message: "No orders found"

            });

        }

        res.status(200).json({

            success: true,

            count: orders.length,

            data: orders

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// gey branch by order 
exports.getBranchOrders = async (req, res) => {

    try {

        const { branchId } = req.params;

        const orders = await Order.find({

            branch: branchId

        })

        .populate("branch", "name email contactNumber role")

        .populate("createdBy", "name email role")

        .populate("user", "name phone email")

        .populate("address")

        .populate("statusHistory.updatedBy", "name role")

        .sort({ createdAt: -1 });

        if (!orders.length) {

            return res.status(404).json({

                success: false,

                message: "No orders found"

            });

        }

        res.status(200).json({

            success: true,

            count: orders.length,

            data: orders

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// get sub branch

exports.getSubBranchOrders = async (req, res) => {

    try {

        const { subBranchId } = req.params;

        const orders = await Order.find({

            subBranch: subBranchId

        })

        .populate("branch", "name email contactNumber role")

        .populate("subBranch", "name email contactNumber role")

        .populate("createdBy", "name email role")

        .populate("user", "name phone email")

        .populate("address")

        .populate("statusHistory.updatedBy", "name role")

        .sort({ createdAt: -1 });

        if (!orders.length) {

            return res.status(404).json({

                success: false,

                message: "No orders found"

            });

        }

        res.status(200).json({

            success: true,

            count: orders.length,

            data: orders

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// calculate 
exports.calculatePrice = async (req, res) => {

    try {

        const { product, variant, quantity } = req.body;

        if (!product || !variant || !quantity) {

            return res.status(400).json({
                success: false,
                message: "Product, Variant and Quantity are required."
            });

        }

        const productData = await Product.findById(product);

        if (!productData) {

            return res.status(404).json({
                success: false,
                message: "Product not found."
            });

        }

        const variantData = productData.variants.id(variant);

        if (!variantData) {

            return res.status(404).json({
                success: false,
                message: "Variant not found."
            });

        }

        const price = await calculateVariantPrice(variantData);

        return res.status(200).json({

            success: true,

            data: {

                goldRate: price.metalRate,

                goldValue: price.metalValue,

                wastageAmount: price.wastageAmount,

                stoneValue: price.stoneValue,

                makingCharge: price.makingCharges,

                discountAmount: price.discountAmount,

                gstAmount: price.gstAmount,

                unitPrice: price.finalPrice,

                totalPrice: price.finalPrice * quantity

            }

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


exports.deleteOrder = async (req, res) => {
    try {

        const { id } = req.params;

        // Check Order
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        // Delete Order
        await Order.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Order deleted successfully."
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
