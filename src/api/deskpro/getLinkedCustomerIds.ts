import { IDeskproClient } from "@deskpro/app-sdk";

export default async function getLinkedCustomerIds(client?: IDeskproClient, userId?: string): Promise<string[]> {
    if (!userId || !client) {
        return []
    }

    const linkedIds = await client.getEntityAssociation("linkedSmartsheetTasks", userId).list()
    return linkedIds
}