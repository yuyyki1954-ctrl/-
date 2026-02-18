import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
    try {
        // @ts-ignore
        const db = getRequestContext().env.DB;

        const { results } = await db.prepare("SELECT * FROM users ORDER BY created_at DESC").all();

        return NextResponse.json({ users: results }, { status: 200 });
    } catch (error) {
        console.error("Fetch users error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
