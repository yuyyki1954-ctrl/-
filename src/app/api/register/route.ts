import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
    try {
        const { id, name, email } = await req.json();

        if (!id || !name || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // @ts-ignore
        const db = getRequestContext().env.DB;

        // Check if ID already exists
        const existing = await db.prepare("SELECT id FROM users WHERE id = ?").bind(id).first();
        if (existing) {
            return NextResponse.json({ error: "User ID already exists" }, { status: 409 });
        }

        // Insert new user
        await db.prepare("INSERT INTO users (id, name, email) VALUES (?, ?, ?)").bind(id, name, email).run();

        return NextResponse.json({ message: "User created successfully" }, { status: 201 });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
