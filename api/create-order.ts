import Razorpay from "razorpay";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount } = req.body;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string
    });

    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: "INR"
    });

    return res.status(200).json(order);

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
