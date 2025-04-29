import { ContextData } from "@/types/deskpro";
import { IDeskproClient } from "@deskpro/app-sdk";
import getLinkedCustomerIds from "./getLinkedCustomerIds";
import getCustomerByEmail from "../quickbooks/getCustomerByEmail";
import setCustomerLink from "./setCustomerLink";

interface Params {
    companyId: string
    deskproUser: ContextData["user"]
}

export default async function tryToLinkCustomerAutomatically(client: IDeskproClient, params: Params): Promise<void> {
    const { companyId, deskproUser } = params

    if (!deskproUser || !deskproUser.id || !deskproUser.primaryEmail) {
        return
    }
    const linkedCustomerIds = await getLinkedCustomerIds(client, deskproUser.id)

    if (linkedCustomerIds.length <= 0) {
        return
    }

    const email = deskproUser.primaryEmail;

    const customer = await getCustomerByEmail(client, { companyId, email })

    if (!customer?.Id) {
        return
    }

    return setCustomerLink(client, { userId: deskproUser.id, customerId: customer.Id })

}