"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignUp } from "@clerk/nextjs";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function SignUp() {
  const { signUp } = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function Submit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await signUp.create({
        emailAddress,
        password,
      });
      await signUp.verifications.sendEmailCode();

      setPendingVerification(true);
    } catch (error: unknown) {
      console.log(error);
      if (typeof error === "object" && error !== null && "errors" in error) {
        const clerkError = error as {
          errors: { message: string }[];
        };
        setError(clerkError.errors[0]?.message ?? "Something went wrong");
      } else {
        setError("something went wrong");
      }
    }
  }

  async function onVerify(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      await signUp.verifications.verifyEmailCode({
        code,
      });
      await signUp.finalize({
        navigate: async ({ decorateUrl }) => {
          const url = decorateUrl("/dashboard");
          router.push(url);
        },
      });
    } catch (error: unknown) {
      console.log(error);
      if (typeof error === "object" && error !== null && "errors" in error) {
        const clerkError = error as {
          errors: { message: string }[];
        };
        setError(clerkError.errors[0]?.message ?? "Something went wrong");
      } else {
        setError("something went wrong");
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-violet-400">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Sign Up for 
            Aqua-Marketplace
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!pendingVerification ? (
            <form onSubmit={Submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={emailAddress}
                  onChange={(e) => {
                    setEmailAddress(e.target.value);
                  }}
                  required
                ></Input>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    required
                  ></Input>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500"></EyeOff>
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500"></Eye>
                    )}
                  </button>
                </div>
              </div>
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <Button type="submit" className="w-full">
                Sign Up
              </Button>
            </form>
          ) : (
            <form onSubmit={onVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                  }}
                  placeholder="Enter email code"
                  required
                ></Input>
              </div>
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <Button type="submit" className="w-full">
                Verify
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={"/sign-in"}
              className="font-medium text-primary hover:underline"
            >
              Sign-in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
