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
      console.error("Validation failed: Missing required fields");
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const userId = getCookieValue(req.headers.get("cookie"), "user_id");
    if (!userId) {
      console.error("User ID not found in cookies");
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const supabase = getSupabase();

    // Fetch the current user to compare fields
    const { data: currentUser, error: fetchError } = await supabase
      .from("users")
      .select("email")
      .eq("id", userId)
      .single();

    if (fetchError) {
      console.error("Error fetching current user:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch current user details" },
        { status: 400 }
      );
    }

    console.log("Current user:", currentUser);

    // Prepare updates object
    const updates: any = {
      username,
      first_name,
      last_name,
      phone_number,
    };

    // Only update the email if it has changed
    if (isEmailChanged) {
      updates.email = email;
      updates.email_verified = false; // Set email_verified to false if email is changed
    }

    console.log("Updates object:", updates);

    // Update user details
    const { data: user, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    console.log("Database response:", { user, error });

    if (error) {
      if (error.code === "23505" && error.details.includes("email")) {
        // Handle unique constraint violation for email
        console.error("Unique constraint violation:", error);
        return NextResponse.json(
          { error: "This email is already in use" },
          { status: 400 }
        );
      }
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
        console.log("Verification email sent successfully");
      } catch (verificationError) {
        console.error("Error sending verification email:", verificationError);
        return NextResponse.json(
          { error: "Failed to send verification email" },
          { status: 500 }
        );
      }
    }

    console.log("User updated successfully:", user);
    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error("Error in update-user API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
