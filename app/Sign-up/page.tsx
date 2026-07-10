import { Card,CardAction,CardContent,CardDescription,CardFooter,CardHeader,CardTitle } from "@/components/ui/card";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { ReactEventHandler, useState } from "react";
import Link from "next/link";




function SignUp(){
const{signUp}=useSignUp()
const[emailAddress,setEmailAddress] = useState("")
const[password,setPassword] = useState("")
const[pendingVerification,setPendingVerification] = useState(false)
const[showPassword,setShowPassword] = useState(false)
const[code,setCode] = useState("")
const [error,setError] = useState("")
const router = useRouter()

async function Submit(e:React.SubmitEvent<HTMLFormElement>){
e.preventDefault()
try {
    await signUp.create({
        emailAddress,
        password
    })
    await signUp.verifications.sendEmailCode()

    setPendingVerification(true)
} catch (error :unknown) {
    console.log(error);
      if (typeof error === "object" && error !== null && "errors" in error) {
        const clerkError = error as {
          errors: { message: string }[];
        };
        setError(clerkError.errors[0]?.message ?? "Something went wrong");
      } else {
        setError("something went wrong");}
}
}

async function onVerify(e:React.SubmitEvent<HTMLFormElement>){
    try {
       await  signUp.verifications.verifyEmailCode({
            code
        })
        await signUp.finalize({
            navigate:async({decorateUrl})=>{
                const url = decorateUrl("/dashboard")
                  router.push(url)
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
        setError("something went wrong");}
    }
}
}