import { Resend } from "resend";

// Initialize Resend with API key
const resend = new Resend("re_LSWEg1LD_NCNyewgghxoQnAY5hDkHDrmp");

// Email templates
export async function sendVerificationEmail(email: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verificationUrl = `${appUrl}/verify-email?token=${token}`;
  console.log("Verification URL:", verificationUrl);

  const response = await fetch("/api/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      subject: "Verify your Trustfund account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1E88E5; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Trustfund</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for signing up with Trustfund. Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #1E88E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
            </div>
            <p>If you didn't create an account with us, you can safely ignore this email.</p>
            <p>This link will expire in 24 hours.</p>
            <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
            <p style="word-break: break-all;">${verificationUrl}</p>
          </div>
          <div style="text-align: center; padding: 20px; color: #757575; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Trustfund. All rights reserved.</p>
          </div>
        </div>
      `,
    }),
  });
  console.log("Response from email API:", response);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to send email");
  }

  return await response.json();
}

export async function sendPasswordResetEmail(email: string, token: string) {
  // Make sure we have a valid app URL, default to localhost if not provided
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${appUrl}/reset-password?token=${token}`;
  console.log("Reset URL:", resetUrl);
  console.log("Email:", email);

  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        subject: "Reset your Trustfund password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1E88E5; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Trustfund</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
              <h2>Reset Your Password</h2>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #1E88E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
              </div>
              <p>If you didn't request a password reset, you can safely ignore this email.</p>
              <p>This link will expire in 1 hour.</p>
              <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
              <p style="word-break: break-all;">${resetUrl}</p>
            </div>
            <div style="text-align: center; padding: 20px; color: #757575; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Trustfund. All rights reserved.</p>
            </div>
          </div>
        `,
      }),
    });

    console.log("Response from email API:", response);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send email");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in sendPasswordResetEmail:", error);
    throw error;
  }
}
