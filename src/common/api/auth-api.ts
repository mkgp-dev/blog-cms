import { ApiError, buildBlogPath, requestJson } from "@/common/api/client";

type LoginResponse = {
    token?: string;
    accessToken?: string;
    data?: {
        token?: string;
        accessToken?: string;
    };
};

export async function login(credentials: { email: string; password: string }) {
    const response = await requestJson<LoginResponse>(
        buildBlogPath("/auth"),
        {
            method: "POST",
            body: JSON.stringify(credentials),
        },
        false
    );

    const token =
        response.data?.token ??
        response.token ??
        response.data?.accessToken ??
        response.accessToken;

    if (!token || typeof token !== "string") {
        throw new ApiError(500, "invalid_response", "Login response missing token");
    }

    return { token };
}
