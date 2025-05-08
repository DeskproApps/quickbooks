import { ENTITY_NAME } from "@/constants";
import { IDeskproClient } from "@deskpro/app-sdk";

interface Params {
    userId: string,
    customerId: string
}
export default async function setCustomerLink(client: IDeskproClient, params: Params): Promise<void> {

    const { userId, customerId } = params

    await client
        .getEntityAssociation(ENTITY_NAME, userId)
        .set(customerId)

}