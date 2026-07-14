import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import{auth} from "@clerk/nextjs/server"




export async function POST(req:NextRequest){
const{userId} = await auth()
if (!userId) {
    return NextResponse.json({error:"unauthorised"},{status:401})
}
}