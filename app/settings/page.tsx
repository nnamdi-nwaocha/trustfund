"use client";

import React, { memo, useCallback } from "react";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Select from "react-select";
import countryList from "react-select-country-list";
import { ArrowLeft, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SettingFieldProps {
  label: string;
  value: string;
  fieldName: string;
  currentValue: any;
  setCurrentValue: (value: any) => void;
  inputType?: string;
  customInput?: React.ReactNode;
  editingField: string | null;
  setEditingField: (field: string | null) => void;
  handleUpdate: (field: string, value: any) => Promise<void>;
  loading: boolean;
}

const SettingField = memo(
  ({
    label,
    value,
    fieldName,
    currentValue,
    setCurrentValue,
    inputType = "text",
    customInput = null,
    editingField,
    setEditingField,
    handleUpdate,
    loading,
  }: SettingFieldProps) => (
    <div className="py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {editingField === fieldName ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-auto">
              {customInput || (
                <Input
                  type={inputType}
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  className="w-full"
                  required
                  autoFocus
                />
              )}
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <Button
                size="sm"
                onClick={() => handleUpdate(fieldName, currentValue)}
                disabled={loading}
                className="h-9"
              >
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingField(null)}
                className="h-9"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full sm:w-auto">
            <span className="text-gray-900 dark:text-gray-100 mr-4 truncate max-w-[200px] sm:max-w-none">
              {value || "Not set"}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingField(fieldName)}
            >
              Edit
            </Button>
          </div>
        )}
      </div>
      <Separator className="mt-4" />
    </div>
  )
);

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const router = useRouter();

  const [editingField, setEditingField] = useState<string | null>(null);
  const [username, setUsername] = useState(user?.username || "");
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || "");
  const [email, setEmail] = useState(user?.email || "");
  const [country, setCountry] = useState(
    countryList()
      .getData()
      .find((c) => c.label === user?.country) || null
  );
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpdate = useCallback(
    async (field: string, value: any) => {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      try {
        const isEmailChanged =
          field === "email" &&
          value.trim().toLowerCase() !== user?.email.trim().toLowerCase();

        const response = await fetch("/api/update-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: field === "username" ? value : username,
            first_name: field === "first_name" ? value : firstName,
            last_name: field === "last_name" ? value : lastName,
            phone_number: field === "phone_number" ? value : phoneNumber,
            country: field === "country" ? value : country?.label,
            email: field === "email" ? value.trim().toLowerCase() : email,
            isEmailChanged,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update user details");
        }

        setUser(data.user);
        setSuccessMessage("Details updated successfully!");

        if (isEmailChanged) {
          setSuccessMessage(
            "Details updated successfully! Please verify your new email."
          );
        }

        setEditingField(null);
      } catch (error: any) {
        setErrorMessage(error.message || "Failed to update details");
      } finally {
        setLoading(false);
      }
    },
    [user, username, firstName, lastName, phoneNumber, country, email, setUser]
  );

  const countryOptions = countryList().getData();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button
        variant="ghost"
        className="mb-6 group flex items-center"
        onClick={() => router.push("/dashboard")}
      >
        <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
        Back to Dashboard
      </Button>

      <Card className="shadow-lg border-gray-200 dark:border-gray-800">
        <CardHeader>
          <h1 className="text-2xl font-bold">Account Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your personal information and preferences
          </p>
        </CardHeader>

        <CardContent>
          {successMessage && (
            <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {errorMessage && (
            <Alert className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div>
            <SettingField
              label="Username"
              value={username}
              fieldName="username"
              currentValue={username}
              setCurrentValue={setUsername}
              editingField={editingField}
              setEditingField={setEditingField}
              handleUpdate={handleUpdate}
              loading={loading}
            />

            <SettingField
              label="First Name"
              value={firstName}
              fieldName="first_name"
              currentValue={firstName}
              setCurrentValue={setFirstName}
              editingField={editingField}
              setEditingField={setEditingField}
              handleUpdate={handleUpdate}
              loading={loading}
            />

            <SettingField
              label="Last Name"
              value={lastName}
              fieldName="last_name"
              currentValue={lastName}
              setCurrentValue={setLastName}
              editingField={editingField}
              setEditingField={setEditingField}
              handleUpdate={handleUpdate}
              loading={loading}
            />

            <SettingField
              label="Phone Number"
              value={phoneNumber}
              fieldName="phone_number"
              currentValue={phoneNumber}
              setCurrentValue={setPhoneNumber}
              editingField={editingField}
              setEditingField={setEditingField}
              handleUpdate={handleUpdate}
              loading={loading}
              customInput={
                <div className="w-full">
                  <PhoneInput
                    country={"us"}
                    value={phoneNumber}
                    onChange={(phone) => setPhoneNumber(phone)}
                    containerClass="w-full"
                    inputClass="!w-full"
                  />
                </div>
              }
            />

            <SettingField
              label="Country"
              value={country?.label || ""}
              fieldName="country"
              currentValue={country}
              setCurrentValue={setCountry}
              editingField={editingField}
              setEditingField={setEditingField}
              handleUpdate={handleUpdate}
              loading={loading}
              customInput={
                <div className="w-full sm:w-64">
                  <Select
                    options={countryOptions}
                    value={country}
                    onChange={(selectedOption) => setCountry(selectedOption)}
                    className="w-full"
                    classNamePrefix="react-select"
                  />
                </div>
              }
            />

            <SettingField
              label="Email"
              value={email}
              fieldName="email"
              currentValue={email}
              setCurrentValue={setEmail}
              editingField={editingField}
              setEditingField={setEditingField}
              handleUpdate={handleUpdate}
              loading={loading}
              inputType="email"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
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

    // Skip updating the email if it hasn't changed
    const updates: any = {
      username,
      first_name,
      last_name,
      phone_number,
    };

    if (email !== currentUser.email) {
      updates.email = email;
      updates.email_verified = false; // Set email_verified to false if email is changed
    }

    // Update user details
    const { data: user, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      if (error.code === "23505" && error.details.includes("email")) {
        // Handle unique constraint violation for email
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
    if (email !== currentUser.email) {
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
