import { db } from "@/db/drizzle";
import { loans, clients } from "@/db/schema";
import { NextResponse } from "next/server";
import { lt, and, eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET() {
    try {
        const overdueLoans = await db
            .select({
                id: loans.id,
                principal: loans.principal,
                dueDate: loans.dueDate,
                clientName: clients.name,
            })
            .from(loans)
            .innerJoin(clients, eq(loans.clientId, clients.id))
            .where(
                and(
                    eq(loans.paid, false),
                    lt(loans.dueDate, new Date())
                )
            );

        return NextResponse.json(overdueLoans);
    } catch (error) {
        console.error("Error fetching overdue loans:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
