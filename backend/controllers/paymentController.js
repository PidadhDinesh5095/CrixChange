import Razorpay from "razorpay";
import dotenv from 'dotenv';

dotenv.config();
const  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


export const createOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        console.log("Creating order for amount:", amount);
        const options = {
            amount: amount * 100, 
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };
        const order = await razorpayInstance.orders.create(options);
        console.log("Order created:", order);
        res.status(200).json({
            success: true,
            message: 'Order created successfully',
            order
        }); 

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order'
        });
    }
};