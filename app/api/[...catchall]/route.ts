import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return handleApiNotFound(req);
}

export async function POST(req: NextRequest) {
  return handleApiNotFound(req);
}

export async function PUT(req: NextRequest) {
  return handleApiNotFound(req);
}

export async function DELETE(req: NextRequest) {
  return handleApiNotFound(req);
}

export async function PATCH(req: NextRequest) {
  return handleApiNotFound(req);
}

function handleApiNotFound(req: NextRequest) {
  const requestId = "req_" + Math.random().toString(36).substring(2, 12);
  const path = req.nextUrl.pathname;

  return NextResponse.json(
    {
      statusCode: 404,
      error: "Not Found",
      message: `Cannot ${req.method} ${path} - Endpoint not registered in API Gateway`,
      timestamp: new Date().toISOString(),
      requestId,
      gateway: "curator-api-edge-01",
    },
    {
      status: 404,
      headers: {
        "X-Request-ID": requestId,
        "X-Gateway-Route": "api-v1-fallback",
      },
    }
  );
}
