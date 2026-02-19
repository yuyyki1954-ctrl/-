import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        // @ts-ignore
        const db = getRequestContext().env.DB;

        let query = "SELECT id, user_id, filename, size, uploaded_at FROM files";
        const params = [];

        if (userId) {
            query += " WHERE user_id = ?";
            params.push(userId);
        }

        query += " ORDER BY uploaded_at DESC";

        const { results } = await db.prepare(query).bind(...params).all();

        return NextResponse.json({ files: results }, { status: 200 });
    } catch (error) {
        console.error("List files error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const userId = formData.get("userId") as string;

        if (!file || !userId) {
            return NextResponse.json({ error: "File and User ID are required" }, { status: 400 });
        }

        if (file.size > 1024 * 1024) { // 1MB limit check
            return NextResponse.json({ error: "File size exceeds 1MB limit for this prototype" }, { status: 413 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        // @ts-ignore
        const db = getRequestContext().env.DB;

        // Use a simpler approach for BLOB insertion if possible, or bind the array buffer
        // D1 via workers-sdk supports ArrayBuffer for BLOBs
        await db.prepare("INSERT INTO files (user_id, filename, data, size) VALUES (?, ?, ?, ?)")
            .bind(userId, file.name, arrayBuffer, file.size)
            .run();

        return NextResponse.json({ message: "File uploaded successfully" }, { status: 201 });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { fileId, userId } = await req.json();

        if (!fileId || !userId) {
            return NextResponse.json({ error: "File ID and User ID are required" }, { status: 400 });
        }

        // @ts-ignore
        const db = getRequestContext().env.DB;

        // Verify ownership before deleting
        const file = await db.prepare("SELECT * FROM files WHERE id = ? AND user_id = ?").bind(fileId, userId).first();

        if (!file) {
            return NextResponse.json({ error: "File not found or access denied" }, { status: 404 });
        }

        await db.prepare("DELETE FROM files WHERE id = ?").bind(fileId).run();

        return NextResponse.json({ message: "File deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
