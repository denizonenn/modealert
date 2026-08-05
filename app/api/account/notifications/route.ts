import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();

  await prisma.user.update({
    where: { id: session.user.id },
    data: { emailOptOut: Boolean(body.emailOptOut) },
  });

  return NextResponse.json({ success: true });
}
