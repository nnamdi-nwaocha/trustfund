"use client";

import type React from "react";

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

  const handleUpdate = async (field: string, value: any) => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const isEmailChanged = field === "email" && value !== user?.email;

      // Call API to update user details
      const response = await fetch("/api/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [field]: value,
          isEmailChanged,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user details");
      }

      // Update user in context
      setUser(data.user);
      setSuccessMessage("Details updated successfully!");

      // If email was changed, prompt for verification
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
  };

  const countryOptions = countryList().getData();

  const SettingField = ({
    label,
    value,
    fieldName,
    currentValue,
    setCurrentValue,
    inputType = "text",
    customInput = null,
  }: {
    label: string;
    value: string;
    fieldName: string;
    currentValue: any;
    setCurrentValue: (value: any) => void;
    inputType?: string;
    customInput?: React.ReactNode;
  }) => (
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
  );

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
              value={user?.username || ""}
              fieldName="username"
              currentValue={username}
              setCurrentValue={setUsername}
            />

            <SettingField
              label="First Name"
              value={user?.first_name || ""}
              fieldName="first_name"
              currentValue={firstName}
              setCurrentValue={setFirstName}
            />

            <SettingField
              label="Last Name"
              value={user?.last_name || ""}
              fieldName="last_name"
              currentValue={lastName}
              setCurrentValue={setLastName}
            />

            <SettingField
              label="Phone Number"
              value={user?.phone_number || ""}
              fieldName="phone_number"
              currentValue={phoneNumber}
              setCurrentValue={setPhoneNumber}
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
              value={user?.country || ""}
              fieldName="country"
              currentValue={country}
              setCurrentValue={setCountry}
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
              value={user?.email || ""}
              fieldName="email"
              currentValue={email}
              setCurrentValue={setEmail}
              inputType="email"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
