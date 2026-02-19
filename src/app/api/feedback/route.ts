import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        // @ts-ignore
        const db = getRequestContext().env.DB;

        let query = "SELECT id, user_id, content, created_at FROM feedback";
        const params = [];

        if (userId) {
            query += " WHERE user_id = ?";
            params.push(userId);
        }

        query += " ORDER BY created_at DESC";

        const { results } = await db.prepare(query).bind(...params).all();

        return NextResponse.json({ feedback: results }, { status: 200 });
    } catch (error) {
        console.error("Get feedback error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId, content } = await req.json();

        if (!userId || !content) {
            return NextResponse.json({ error: "User ID and content are required" }, { status: 400 });
        }

        // @ts-ignore
        const db = getRequestContext().env.DB;

        await db.prepare("INSERT INTO feedback (user_id, content) VALUES (?, ?)")
            .bind(userId, content)
            .run();

        return NextResponse.json({ message: "Feedback submitted successfully" }, { status: 201 });
    } catch (error) {
        console.error("Submit feedback error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
