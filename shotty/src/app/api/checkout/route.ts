import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { priceId, amount, productName } = body;

    const lineItems = priceId
      ? [{ price: priceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: "jpy",
              product_data: {
                name: productName ?? "Shotty プレミアムプラン",
              },
              unit_amount: amount ?? 500,
            },
            quantity: 1,
          },
        ];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: "https://shotty.net/success",
      cancel_url: "https://shotty.net/cancel",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout エラー:", error);
    return NextResponse.json(
      { error: "Checkout セッションの作成に失敗しました" },
      { status: 500 }
    );
  }
}
