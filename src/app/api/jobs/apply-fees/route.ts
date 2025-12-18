import { db } from "@/db/drizzle";
import { loans, fees } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and, lt, desc, sql } from "drizzle-orm";
import { startOfMonth, endOfMonth, isAfter } from "date-fns";

export const runtime = "nodejs";

export async function POST() {
    try {
        const now = new Date();

        // 1. Get all unpaid loans
        const unpaidLoans = await db
            .select()
            .from(loans)
            .where(eq(loans.paid, false));

        for (const loan of unpaidLoans) {
            // Rule 2.2: If loan is unpaid after 30 days (due_date)
            if (isAfter(now, loan.dueDate)) {

                // Check for monthly fee in the current calendar month
                const monthStart = startOfMonth(now);
                const monthEnd = endOfMonth(now);

                const [existingMonthlyFee] = await db
                    .select()
                    .from(fees)
                    .where(
                        and(
                            eq(fees.loanId, loan.id),
                            eq(fees.type, "monthly"),
                            sql`${fees.createdAt} >= ${monthStart} AND ${fees.createdAt} <= ${monthEnd}`
                        )
                    )
                    .limit(1);

                if (!existingMonthlyFee) {
                    // Add monthly fee = principal * rate
                    const rate = parseFloat(loan.monthlyFeeRate);
                    const amount = (parseFloat(loan.principal) * rate).toFixed(2);
                    await db.insert(fees).values({
                        loanId: loan.id,
                        amount,
                        type: "monthly",
                        isPaid: false,
                    });
                }

                // Rule: If a monthly fee is unpaid: Apply a daily penalty of 10% of the unpaid monthly fee.
                // Get all unpaid monthly fees for this loan
                const unpaidMonthlyFees = await db
                    .select()
                    .from(fees)
                    .where(
                        and(
                            eq(fees.loanId, loan.id),
                            eq(fees.type, "monthly"),
                            eq(fees.isPaid, false)
                        )
                    );

                for (const mFee of unpaidMonthlyFees) {
                    // Add daily penalty = unpaid monthly fee * 0.10
                    const penaltyAmount = (parseFloat(mFee.amount) * 0.10).toFixed(2);
                    await db.insert(fees).values({
                        loanId: loan.id,
                        amount: penaltyAmount,
                        type: "daily",
                        isPaid: false,
                    });
                }
            }
        }

        return NextResponse.json({ message: "Fees applied successfully" });
    } catch (error) {
        console.error("Error applying fees:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
