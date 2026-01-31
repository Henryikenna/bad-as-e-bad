import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { answer } = await request.json();
    const timestamp = new Date().toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
    });

    const isYes = answer === "yes";

    const subject = isYes
      ? "She said YES ❤️"
      : "Alexis said No";

    const body = isYes
      ? `Congratulations, Henry.\n\nAlexis said YES to being your Valentine.\n\nThe midnight stars, the montage—it all worked.\n\nNow go tell her how much this means to you.`
      : `Response: NO\nTimestamp: ${timestamp}\n\nYou asked with honesty. She answered with honesty.\n\nThe experience you built still showed her what she means to you.\n\nNothing changes.`;

    await resend.emails.send({
      from: "Valentine <onboarding@segwae.com>",
      to: "ikennaunegbu10@gmail.com",
      subject,
      text: body,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
