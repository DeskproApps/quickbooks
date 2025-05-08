import { IDeskproClient } from "@deskpro/app-sdk";
import { QuickBooksCustomer } from "@/types/quickbooks";
import baseRequest from "./baseRequest";

interface Params {
    text: string;
    companyId: string;
}

interface QuickBooksCustomerResponse {
    QueryResponse: {
        Customer?: QuickBooksCustomer[]
    }
}

export default async function getCustomersByQuery(client: IDeskproClient, params: Params): Promise<QuickBooksCustomer[]> {
    try {
        const { text, companyId } = params

        if (!text || text.trim().length < 3) {
            return []
        }

        const query = `SELECT * FROM Customer WHERE PrimaryEmailAddr LIKE '%${text}%'`

        const response = await baseRequest<QuickBooksCustomerResponse>(client,
            {
                realmId: companyId,
                endpoint: `query?query=${encodeURIComponent(query).replace(/'/g, "%27")}`,
            })

        return response.QueryResponse.Customer ?? []
    }

    catch (e) {
        return []
    }
}