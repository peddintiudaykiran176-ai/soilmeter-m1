
import { connection, NextResponse } from "next/server";
import { sql } from "../../lib/db";

export async function GET() {
  await connection();

  try {
    const result = await sql`
      SELECT
        NOW() AS server_time,
        current_database() AS database_name
    `;

    return NextResponse.json({
      success: true,
      message: "Neon database connected successfully!",
      database: result[0].database_name,
      serverTime: result[0].server_time,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Neon database connection failed",
      },
      { status: 500 }
    );
  }
}
