import { IDeskproClient } from "@deskpro/app-sdk";
import { QuickBooksCompany } from "@/types/quickbooks";
import baseRequest from "./baseRequest";

export default async function getCompanyInfo(client: IDeskproClient, companyId: string): Promise<QuickBooksCompany | null> {
        return await baseRequest<QuickBooksCompany>(client, { realmId: companyId, endpoint: `companyinfo/${companyId}` })
}