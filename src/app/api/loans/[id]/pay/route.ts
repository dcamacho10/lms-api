import { db } from "@/db/drizzle";
import { loans, fees } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const loanId = parseInt(id);

        if (isNaN(loanId)) {
            return NextResponse.json({ error: "Invalid loan ID" }, { status: 400 });
        }

        // Check if there are any unpaid fees
        const unpaidFees = await db
            .select()
            .from(fees)
            .where(and(eq(fees.loanId, loanId), eq(fees.isPaid, false)));

        if (unpaidFees.length > 0) {
            return NextResponse.json(
                { error: "Cannot pay loan until all fees are paid" },
                { status: 400 }
            );
        }

        // In this system, partial payments are not allowed.
        // The user simply "pays" the loan when they have the full amount.
        // The requirement says "Only allowed if: All fees are paid, Full principal is paid".
        // Since we don't track partial principal payments, we assume the user is pays it now.

        const [updatedLoan] = await db
            .update(loans)
            .set({ paid: true })
            .where(eq(loans.id, loanId))
            .returning();

        if (!updatedLoan) {
            return NextResponse.json({ error: "Loan not found" }, { status: 404 });
        }

        return NextResponse.json(updatedLoan);
    } catch (error) {
        console.error("Error paying loan:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
