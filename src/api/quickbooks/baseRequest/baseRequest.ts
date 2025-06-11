import { IDeskproClient, proxyFetch } from "@deskpro/app-sdk";
import { QuickBooksFaultError } from "@/types/quickbooks";
import getQueryParams from "@/utils/getQueryParams";
import type { RequestParams } from "@/types/api";
import { placeholders } from '@/constants';
import refreshAccessToken from '../refreshAccessToken';

/**
 * Wrapper fetch function for requests to the QuickBooks API.
 *
 * @template T - The type of the response data.
 * 
 * @throws {QuickBooksError} If the HTTP status code indicates a failed request (not 2xx or 3xx).
 */
export default async function baseRequest<T>(client: IDeskproClient, reqProps: RequestParams): Promise<T> {
    const { endpoint, realmId, data, method = "GET", queryParams = {}, headers: customHeaders } = reqProps

    const isUsingGlobalProxy = (await client.getUserState<boolean>("isUsingGlobalProxy"))[0]?.data ?? false

    const dpFetch = await proxyFetch(client)

    // Check if the endpoint already contains query parameters
    const hasRawQueryParams = endpoint.includes('?')

    // Set the base URL based on the environment
    const baseUrl = (await client.getUserState(placeholders.IS_USING_SANDBOX))[0].data === true
        ? `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/${endpoint}`
        : `https://quickbooks.api.intuit.com/v3/company/${realmId}/${endpoint}`

    let requestUrl: string;

    if (hasRawQueryParams) {
        // Ignore the queryParams if some are in the endpoint string
        requestUrl = baseUrl
    } else {
        // If no query params, add the queryParams as usual
        const params = getQueryParams(queryParams)
        requestUrl = `${baseUrl}?${params}`
    }

    async function makeRequest(): Promise<Response> {
        const options: RequestInit = {
            method,
            body: data,
            headers: {
                "Authorization": `Bearer [user[${placeholders.OAUTH2_ACCESS_TOKEN_PATH}]]`,
                "Accept": "application/json",
                ...customHeaders,
                ...(data ? { "Content-Type": "application/json" } : {}),
            },
        }

        return await dpFetch(requestUrl, options)
    }

    let response = await makeRequest()

    // We cannot refresh the access token if we are using the global proxy
    // because the client id and secret key will not be available.
    if (response.status === 401 && !isUsingGlobalProxy) {
        try {
            await refreshAccessToken(client)
            response = await makeRequest()

        } catch (refreshError) {
            throw new QuickBooksError('failed to refresh access token', { statusCode: 401, data: refreshError });
        };
    };

    if (response.status < 200 || response.status > 399) {
        let errorData: unknown;
        const rawText = await response.text()

        try {
            errorData = JSON.parse(rawText)
        } catch {
            errorData = { message: "Non-JSON error response received", raw: rawText }
        }

        throw new QuickBooksError("Request failed", { statusCode: response.status, data: errorData })
    }

    try {
        return await response.json() as T
    } catch (e) {
        throw new QuickBooksError("Failed to parse JSON response", { statusCode: 500, data: e })
    }
}

export type QuickBooksErrorPayload = {
    statusCode: number
    data?: unknown
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

export function isQuickBooksFaultError(data: unknown): data is QuickBooksFaultError {
    if (typeof data !== "object" || data === null) {
        return false
    }

    const maybeFault = (data as Record<string, unknown>)["Fault"] ?? (data as Record<string, unknown>)["fault"]

    return (
        typeof maybeFault === "object" &&
        maybeFault !== null &&
        typeof (maybeFault as Record<string, unknown>)["type"] === "string"
    );
};