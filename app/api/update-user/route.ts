import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { sendVerificationEmail } from "@/lib/email-service";

function getCookieValue(
  cookieHeader: string | null,
  cookieName: string
): string | undefined {
  if (!cookieHeader) return undefined;
  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const cookie = cookies.find((c: string) => c.startsWith(`${cookieName}=`));
  return cookie ? decodeURIComponent(cookie.split("=")[1]) : undefined;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      username,
      first_name,
      last_name,
      phone_number,
      email,
      isEmailChanged,
    } = body;

    // Validate input fields
    if (!username || !first_name || !last_name || !phone_number || !email) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const userId = getCookieValue(req.headers.get("cookie"), "user_id");
    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const supabase = getSupabase();

    // Update user details
    const { data: user, error } = await supabase
      .from("users")
      .update({
        username,
        first_name,
        last_name,
        phone_number,
        email,
        ...(isEmailChanged && { email_verified: false }), // Set email_verified to false if email is changed
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error);
      return NextResponse.json(
        { error: "Failed to update user details" },
        { status: 400 }
      );
    }

    // Trigger email verification if email is updated
    if (isEmailChanged) {
      try {
        await sendVerificationEmail(email, userId); // Reuse your existing email verification logic
      } catch (verificationError) {
        console.error("Error sending verification email:", verificationError);
        return NextResponse.json(
          { error: "Failed to send verification email" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error("Error in update-user API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
