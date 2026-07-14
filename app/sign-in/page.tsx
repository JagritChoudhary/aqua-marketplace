"use client";


import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {  useSignIn } from "@clerk/nextjs";
import { Card,CardContent,CardFooter,CardHeader,CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye,EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Alert,AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function SignIn(){
    const{signIn}=useSignIn()
const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

async function submit(e:React.SubmitEvent<HTMLFormElement>){
    e.preventDefault()
try {
    await signIn.create({
        identifier:emailAddress,
        password
    })
    await signIn.finalize({
        navigate:async ({decorateUrl}) => {
            router.push(decorateUrl("/dashboard"))
        }
    })
} catch (error:unknown) {
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
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
    style={{backgroundImage:"url('/images/bg.jpg')"}}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Sign In to Todo Master
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full cursor-pointer">
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );

}