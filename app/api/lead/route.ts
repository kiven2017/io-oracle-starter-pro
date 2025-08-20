import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.formData().catch(() => null) || await req.json().catch(() => null);
  // TODO: 校验并落库（Supabase/Airtable/自建 DB），触发邮件（Resend/SendGrid）
  console.log("Lead form submission:", body);
  return NextResponse.json({ ok: true, received: true });
}
