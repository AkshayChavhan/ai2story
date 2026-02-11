import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDeviceInfo, getClientIp } from "@/lib/auth-utils";
import { sendNewDeviceAlert } from "@/lib/email";

/**
 * POST /api/auth/record-login
 * Records login history with device info and IP address.
 * Sends a security alert email if a new device is detected.
 * Must be called after successful signIn().
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userAgent = request.headers.get("user-agent");
    const deviceInfo = getDeviceInfo(userAgent);
    const ipAddress = getClientIp(request.headers);

    // Check if this is a new device by comparing with recent logins
    const recentLogins = await prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const isNewDevice = !recentLogins.some((login) => {
      const info = login.deviceInfo as { browser?: string; os?: string };
      return (
        info?.browser === deviceInfo.browser && info?.os === deviceInfo.os
      );
    });

    // Record login history
    await prisma.loginHistory.create({
      data: {
        userId,
        deviceInfo,
        ipAddress,
        sessionId: (session as any).sessionId || "unknown",
      },
    });

    // Send security alert if new device detected (skip for first-ever login)
    if (isNewDevice && recentLogins.length > 0 && session.user.email) {
      await sendNewDeviceAlert(session.user.email, deviceInfo, ipAddress);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Record login error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record login" },
      { status: 500 }
    );
  }
}
