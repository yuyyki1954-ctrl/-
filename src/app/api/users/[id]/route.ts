import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = params.id;

        // @ts-ignore
        const db = getRequestContext().env.DB;

        const user = await db.prepare("SELECT id, name, email, created_at FROM users WHERE id = ?").bind(userId).first();

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error("Get user error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
