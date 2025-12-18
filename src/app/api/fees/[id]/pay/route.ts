import { db } from "@/db/drizzle";
import { fees } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const feeId = parseInt(id);

        if (isNaN(feeId)) {
            return NextResponse.json({ error: "Invalid fee ID" }, { status: 400 });
        }

        const [updatedFee] = await db
            .update(fees)
            .set({ isPaid: true })
            .where(eq(fees.id, feeId))
            .returning();

        if (!updatedFee) {
            return NextResponse.json({ error: "Fee not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Fee paid successfully", fee: updatedFee });
    } catch (error) {
        console.error("Error paying fee:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
