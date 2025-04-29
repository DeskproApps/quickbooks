import { IDeskproClient, proxyFetch } from "@deskpro/app-sdk";
import getQueryParams from "@/utils/getQueryParams";
import type { RequestParams } from "@/types/api";
import { IS_SANDBOX_ENVIRONMENT } from "@/constants";


/**
 * Wrapper fetch function for requests to the QuickBooks API.
 *
 * @template T - The type of the response data.
 * 
 * @throws {QuickBooksError} If the HTTP status code indicates a failed request (not 2xx or 3xx).
 */
export default async function baseRequest<T>(client: IDeskproClient, reqProps: RequestParams): Promise<T> {
    const { endpoint, realmId, data, method = "GET", queryParams = {}, headers: customHeaders } = reqProps

    const dpFetch = await proxyFetch(client)

    // Set the base URL based on the environment
    const baseUrl = IS_SANDBOX_ENVIRONMENT
        ? `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/${endpoint}`
        : `https://quickbooks.api.intuit.com/v3/company/${realmId}/${endpoint}`;
    const params = getQueryParams(queryParams);

    const requestUrl = `${baseUrl}?${params}`;
    const options: RequestInit = {
        method,
        body: data,
        headers: {
            "Authorization": "Bearer [user[oauth2/access_token]]",
            "Accept": "application/json",
            ...customHeaders,
            ...(data ? { "Content-Type": "application/json" } : {}),
        },
    }

    const res = await dpFetch(requestUrl, options);

    if (res.status < 200 || res.status > 399) {
        let errorData: unknown;
        const rawText = await res.text()

        try {
            errorData = JSON.parse(rawText)
        } catch {
            errorData = { message: "Non-JSON error response received", raw: rawText }
        }

        throw new QuickBooksError("Request failed", { statusCode: res.status, data: errorData })
    }

    try {
        return await res.json() as T
    } catch (e) {
        throw new QuickBooksError("Failed to parse JSON response", { statusCode: 500, data: e })
    }
}

export type QuickBooksErrorPayload = {
    statusCode: number;
    data?: unknown; // @todo: Add types to handle errors better
}

export class QuickBooksError extends Error {
    data: QuickBooksErrorPayload["data"]
    statusCode: QuickBooksErrorPayload["statusCode"]

    constructor(message: string, payload: QuickBooksErrorPayload) {
        super(message)
        this.name = "QuickBooksError"
        this.data = payload.data;
        this.statusCode = payload.statusCode
    }
}