import { ENTITY_NAME } from "@/constants";
import { IDeskproClient } from "@deskpro/app-sdk";

export default async function getLinkedCustomerIds(client?: IDeskproClient, userId?: string): Promise<string[]> {
    if (!userId || !client) {
        return []
    }

    const linkedIds = await client.getEntityAssociation(ENTITY_NAME, userId).list()
    return linkedIds
}