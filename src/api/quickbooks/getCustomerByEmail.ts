import { IDeskproClient } from "@deskpro/app-sdk";
import baseRequest from "./baseRequest";
import { QuickBooksCustomer } from "@/types/quickbooks";

interface Params {
    email: string
    companyId: string
}

interface QuickBooksCustomerResponse {
    QueryResponse: {
        Customer?: QuickBooksCustomer[]
    }
}
export default async function getCustomerByEmail(client: IDeskproClient, params: Params): Promise<QuickBooksCustomer | null> {

    try {
        const { email, companyId } = params

        const query = `SELECT * FROM Customer WHERE PrimaryEmailAddr = '${email}'`

        const response = await baseRequest<QuickBooksCustomerResponse>(client,
            {
                realmId: companyId,
                endpoint: `query?query=${encodeURIComponent(query).replace(/'/g, "%27")}`
            })

        const customer = response.QueryResponse.Customer?.[0] ?? null
        return customer
    } catch (e) {
        return null
    }






}