// filepath: c:\Users\picks\Downloads\devSpace\bank-app-pr2\app\api\send-email\route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, subject, html } = await req.json();

    const data = await resend.emails.send({
      from: "Trustfund <noreply@ideate.cc>",
      to: email,
      subject,
      html,
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
