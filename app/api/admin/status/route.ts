import { NextResponse } from "next/server"
import { isAdminUser } from "@/lib/admin"
import { getRequestUser } from "@/lib/request-auth"

export async function GET(request: Request) {
  try {
    const user = await getRequestUser(request)
    return NextResponse.json({ isAdmin: isAdminUser(user) })
  } catch {
    return NextResponse.json({ isAdmin: false })
  }
}
