import { db } from "@/db/drizzle";
import { loans, clients, fees } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET() {
    try {
        const activeLoans = await db
            .select({
                id: loans.id,
                principal: loans.principal,
                monthlyFeeRate: loans.monthlyFeeRate,
                dueDate: loans.dueDate,
                clientName: clients.name,
            })
            .from(loans)
            .innerJoin(clients, eq(loans.clientId, clients.id))
            .where(eq(loans.paid, false));

        // For each loan, get unpaid fees
        const results = await Promise.all(
            activeLoans.map(async (loan) => {
                const unpaidFees = await db
                    .select({
                        amount: fees.amount,
                    })
                    .from(fees)
                    .where(and(eq(fees.loanId, loan.id), eq(fees.isPaid, false)));

                const totalFees = unpaidFees.reduce((sum, f) => sum + parseFloat(f.amount), 0);
                return {
                    ...loan,
                    totalOwed: parseFloat(loan.principal) + totalFees,
                    fees: totalFees,
                };
            })
        );

        return NextResponse.json(results);
    } catch (error) {
        console.error("Error fetching active loans:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
