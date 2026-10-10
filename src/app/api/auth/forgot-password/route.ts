import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";

const forgotSchema = z.object({
  email: z.string().email("Valid email address is required"),
});

// Temporary in-memory token map for password recovery
const resetTokens = new Map<string, { email: string; expires: number }>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = forgotSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid email" },
        { status: 400 }
      );
    }

    const { email } = result.data;
    const token = crypto.randomBytes(24).toString("hex");
    const expires = Date.now() + 15 * 60 * 1000; // 15 minutes expiry

    resetTokens.set(token, { email, expires });

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been dispatched.",
      resetToken: token, // Provided in development for seamless testing
    });
  } catch {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
