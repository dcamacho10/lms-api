import { db } from "@/db/drizzle";
import { loans, fees } from "@/db/schema";
import { NextResponse } from "next/server";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { startOfYear, endOfYear, format, startOfMonth, endOfMonth } from "date-fns";

export const runtime = "nodejs";

export async function GET() {
    try {
        const now = new Date();
        const yearStart = startOfYear(now);
        const yearEnd = endOfYear(now);

        // Fetch loans issued this year
        const loansThisYear = await db
            .select({
                amount: loans.principal,
                createdAt: loans.createdAt,
                paid: loans.paid,
                updatedAt: loans.updatedAt,
            })
            .from(loans)
            .where(and(gte(loans.createdAt, yearStart), lte(loans.createdAt, yearEnd)));

        // Fetch fees paid this year
        const feesPaidThisYear = await db
            .select({
                amount: fees.amount,
                updatedAt: fees.updatedAt,
            })
            .from(fees)
            .where(
                and(
                    eq(fees.isPaid, true),
                    gte(fees.updatedAt, yearStart),
                    lte(fees.updatedAt, yearEnd)
                )
            );

        // Process data into 12 months
        const monthlyData = Array.from({ length: 12 }, (_, i) => {
            const date = new Date(now.getFullYear(), i, 1);
            return {
                month: format(date, "MMMM"),
                monthShort: format(date, "MMM"),
                loaned: 0,
                recovered: 0,
                earnings: 0,
            };
        });

        loansThisYear.forEach((loan) => {
            const m = new Date(loan.createdAt);
            const monthIndex = m.getMonth();
            monthlyData[monthIndex].loaned += parseFloat(loan.amount);

            // If loan is paid, it counts as recovered capital
            // Note: Since we only track one 'updatedAt' for the whole loan, 
            // we check if it was paid this year.
            if (loan.paid && loan.updatedAt &&
                loan.updatedAt >= yearStart && loan.updatedAt <= yearEnd) {
                const paidMonthIndex = new Date(loan.updatedAt).getMonth();
                monthlyData[paidMonthIndex].recovered += parseFloat(loan.amount);
            }
        });

        feesPaidThisYear.forEach((fee) => {
            const monthIndex = new Date(fee.updatedAt).getMonth();
            monthlyData[monthIndex].earnings += parseFloat(fee.amount);
        });

        const totalLoaned = monthlyData.reduce((sum, m) => sum + m.loaned, 0);
        const totalEarnings = monthlyData.reduce((sum, m) => sum + m.earnings, 0);
        const totalRecovered = monthlyData.reduce((sum, m) => sum + m.recovered, 0);

        return NextResponse.json({
            year: now.getFullYear(),
            totalLoaned,
            totalEarnings,
            totalRecovered,
            monthlyData,
        });
    } catch (error) {
        console.error("Error fetching balance stats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
