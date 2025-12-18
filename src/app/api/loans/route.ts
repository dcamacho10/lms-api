import { db } from "@/db/drizzle";
import { loans } from "@/db/schema";
import { NextResponse } from "next/server";
import { addDays } from "date-fns";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const { clientId, principal, loanDate, monthlyFeeRate } = await req.json();

        if (!clientId || !principal) {
            return NextResponse.json({ error: "clientId and principal are required" }, { status: 400 });
        }

        const startDate = loanDate ? new Date(loanDate) : new Date();
        const dueDate = addDays(startDate, 30);

        const [newLoan] = await db.insert(loans).values({
            clientId,
            principal: principal.toString(),
            monthlyFeeRate: monthlyFeeRate ? (monthlyFeeRate / 100).toString() : "0.40",
            dueDate,
            createdAt: startDate,
            paid: false,
        }).returning();

        return NextResponse.json(newLoan, { status: 201 });
    } catch (error) {
        console.error("Error creating loan:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
