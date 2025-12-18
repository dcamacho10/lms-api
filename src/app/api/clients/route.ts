import { db } from "@/db/drizzle";
import { clients } from "@/db/schema";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const { name, address, phone } = await req.json();

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const [newClient] = await db.insert(clients).values({
            name,
            address,
            phone,
        }).returning();

        return NextResponse.json(newClient, { status: 201 });
    } catch (error) {
        console.error("Error creating client:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
