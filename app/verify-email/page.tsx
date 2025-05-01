"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { verifyEmailToken } from "@/lib/token-service";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setVerifying(false);
        setError(
          "Invalid verification link. Please request a new verification email."
        );
        return;
      }

      try {
        const userId = await verifyEmailToken(token);

        if (userId) {
          setSuccess(true);
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        } else {
          setError(
            "Verification link is invalid or has expired. Please request a new verification email."
          );
        }
      } catch (err) {
        console.error("Error verifying email:", err);
        setError(
          "An error occurred while verifying your email. Please try again later."
        );
      } finally {
        setVerifying(false);
      }
    }

    verifyToken();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {verifying ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p>Verifying your email address...</p>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-green-600 font-medium">
                Your email has been successfully verified!
              </p>
              <p>You will be redirected to the login page in a few seconds.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-12 w-12 text-red-500" />
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {!verifying && (
            <Link href="/login" passHref>
              <Button>Redirecting to dashboard</Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
