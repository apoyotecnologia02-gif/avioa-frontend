import { parseResponseData } from "@/utils/parse-response-data.util";
import { NextResponse } from "next/server";

const UPDATE_PROFILE_URL = `${process.env.NEXT_PUBLIC_API_URL}/admin/users/update-profile`;

export async function PATCH(request: Request) {
  try {
    const contentType = request.headers.get("content-type");
    const authorization = request.headers.get("authorization");

    let fetchBody: BodyInit;
    let fetchHeaders: Record<string, string> = {
      ...(authorization ? { authorization: authorization } : {}),
    };

    if (contentType?.includes("multipart/form-data")) {
      const fd = await request.formData();
      fetchBody = fd;
    } else {
      const body = await request.json();
      fetchBody = JSON.stringify(body);
      fetchHeaders["Content-Type"] = "application/json";
    }

    console.log("fetchBody", fetchBody);

    const response = await fetch(UPDATE_PROFILE_URL, {
      method: "PATCH",
      headers: fetchHeaders,
      body: fetchBody,
    });

    const data = await parseResponseData(response);

    if (!response.ok) {
      return new NextResponse(JSON.stringify(data), {
        status: response.status,
      });
    }

    return new NextResponse(JSON.stringify(data), {
      status: 200,
    });
  } catch (error) {
    return Response.json(
      { message: "Error al actualizar el perfil" },
      { status: 500 },
    );
  }
}
