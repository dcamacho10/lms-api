import { db } from "@/db/drizzle";
import { clients } from "@/db/schema";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
    try {
        const allClients = await db.select().from(clients);
        return NextResponse.json(allClients);
    } catch (error) {
        console.error("Error fetching clients:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
