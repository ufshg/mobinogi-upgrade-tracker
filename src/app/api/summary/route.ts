import { sql } from "@vercel/postgres";

export async function GET() {
  const { rows } = await sql`SELECT * FROM upgrade_results`;
  return Response.json(rows);
}
