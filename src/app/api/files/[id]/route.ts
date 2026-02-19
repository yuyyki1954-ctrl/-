import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const fileId = params.id;

        // @ts-ignore
        const db = getRequestContext().env.DB;

        const file = await db.prepare("SELECT filename, data FROM files WHERE id = ?").bind(fileId).first();

        if (!file) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        // Convert number array (if that's how D1 returns blob in some environments) or standard buffer
        // Cloudflare D1 returns ArrayBuffer for BLOBs usually.
        // We create a response with the correct headers.

        const headers = new Headers();
        headers.set("Content-Disposition", `attachment; filename="${file.filename}"`);
        headers.set("Content-Type", "application/octet-stream");

        return new NextResponse(file.data as any, { status: 200, headers });
    } catch (error) {
        console.error("Download error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
