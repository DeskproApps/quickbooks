import { IDeskproClient, proxyFetch } from "@deskpro/app-sdk";

import { IQueryResponse, RequestMethod } from "./types";
import { IInvoice } from "../types/invoice";
import { IBill } from "../types/bill";
import { IPurchaseOrder } from "../types/purchaseorder";
import { ICustomer } from "../types/customer";
import { IItem } from "../types/item";
import { getErrorMessage } from "../utils/utils";

export const getProductsAndServices = (
  client: IDeskproClient
): Promise<IQueryResponse<IItem, "Item">> => {
  return installedRequest(
    client,
    `company/__company_id__/query?query=SELECT * FROM Item`, //WHERE Type IN ['Inventory', 'Service', 'NonInventory']
    "GET"
  );
};

export const editInvoice = (
  client: IDeskproClient,
  data: Partial<IInvoice>
): Promise<{ Invoice: IInvoice }> => {
  return installedRequest(
    client,
    `company/__company_id__/invoice`,
    "POST",
    data
  );
};

export const createInvoice = (
  client: IDeskproClient,
  data: Partial<IInvoice>
): Promise<{ Invoice: IInvoice }> => {
  return installedRequest(
    client,
    `company/__company_id__/invoice`,
    "POST",
    data
  );
};

export const getInvoiceById = (
  client: IDeskproClient,
  id: string
): Promise<IQueryResponse<IInvoice, "Invoice">> => {
  return installedRequest(
    client,
    `company/__company_id__/query?query=SELECT * FROM Invoice WHERE Id = '${id}'`,
    "GET"
  );
};

export const getInvoicesByCustomerId = (
  client: IDeskproClient,
  id: string
): Promise<IQueryResponse<IInvoice, "Invoice">> => {
  return installedRequest(
    client,
    `company/__company_id__/query?query=SELECT * FROM Invoice WHERE CustomerRef = '${id}'`,
    "GET"
  );
};

export const getBillById = (
  client: IDeskproClient,
  id: string
): Promise<IQueryResponse<IBill, "Bill">> => {
  return installedRequest(
    client,
    `company/__company_id__/query?query=SELECT * FROM Bill WHERE Id = '${id}'`,
    "GET"
  );
};

export const getBillsByCustomerId = (
  client: IDeskproClient,
  id: string
): Promise<IQueryResponse<IBill, "Bill">> => {
  return installedRequest(
    client,
    `company/__company_id__/query?query=SELECT * FROM Bill WHERE VendorRef = '${id}'`,
    "GET"
  );
};

export const getPurchaseOrdersById = (
  client: IDeskproClient,
  id: string
): Promise<IQueryResponse<IPurchaseOrder, "PurchaseOrder">> => {
  return installedRequest(
    client,
    `company/__company_id__/query?query=SELECT * FROM PurchaseOrder WHERE Id = '${id}'`,
    "GET"
  );
};

export const editCustomer = (
  client: IDeskproClient,
  data: Partial<ICustomer>
): Promise<{ Customer: ICustomer }> => {
  return installedRequest(
    client,
    `company/__company_id__/customer`,
    "POST",
    data
  );
};

export const createCustomer = (
  client: IDeskproClient,
  data: Partial<ICustomer>
): Promise<{ Customer: ICustomer }> => {
  return installedRequest(
    client,
    `company/__company_id__/customer`,
    "POST",
    data
  );
};

export const getCustomerById = (
  client: IDeskproClient,
  id: string
): Promise<IQueryResponse<ICustomer, "Customer">> => {
  return installedRequest(
    client,
    `company/__company_id__/query?query=SELECT * FROM Customer WHERE Id = '${id}'`,
    "GET"
  );
};

export const getCustomersByEmail = (
  client: IDeskproClient,
  email: string
): Promise<IQueryResponse<ICustomer, "Customer">> => {
  return installedRequest(
    client,
    `company/__company_id__/query?query=SELECT * FROM Customer WHERE PrimaryEmailAddr = '${email}'`,
    "GET"
  );
};

export const getCustomersByName = (
  client: IDeskproClient,
  name: string
): Promise<IQueryResponse<ICustomer, "Customer">> => {
  return installedRequest(
    client,
    `company/__company_id__/query?query=SELECT * FROM Customer WHERE GivenName LIKE '%${name}%'`,
    "GET"
  );
};

const installedRequest = async (
  client: IDeskproClient,
  url: string,
  method: RequestMethod,
  data?: unknown
) => {
  const fetch = await proxyFetch(client);

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer [[oauth/global/access_token]]`,
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  let response = await fetch(
    `https://quickbooks.api.intuit.com/v3/${url.trim()}`,
    options
  );

  if ([400, 401, 403, 404].includes(response.status)) {
    let tokens;
    const refreshRequestOptions: RequestInit = {
      method: "POST",
      body: `grant_type=refresh_token&refresh_token=[[oauth/global/refresh_token]]`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic __client_id+':'+client_secret.base64__`,
      },
    };

    const refreshRes = await fetch(
      `https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer`,
      refreshRequestOptions
    );

    if (refreshRes.status !== 200) {
      refreshRequestOptions.body = `grant_type=refresh_token&refresh_token=__global_access_token.json("[refresh_token]")__`;

      const secondRefreshRes = await fetch(
        `https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer`,
        refreshRequestOptions
      );

      const secondRefreshData = await secondRefreshRes.json();

      if (secondRefreshRes.status !== 200) {
        throw new Error(
          JSON.stringify({
            status: secondRefreshRes.status,
            message: getErrorMessage(JSON.stringify(secondRefreshData)),
          })
        );
      }

      tokens = secondRefreshData;
    } else {
      tokens = await refreshRes.json();
    }

    await client.setState<string>(
      "oauth/global/access_token",
      tokens.access_token,
      {
        backend: true,
      }
    );

    await client.setState<string>(
      "oauth/global/refresh_token",
      tokens.refresh_token,
      {
        backend: true,
      }
    );

    options.headers = {
      ...options.headers,
      Authorization: `Bearer [[oauth/global/access_token]]`,
    };

    response = await fetch(
      `https://quickbooks.api.intuit.com/v3/${url.trim()}`,
      options
    );
  }

  if (isResponseError(response)) {
    throw new Error(
      JSON.stringify({
        status: response.status,
        message: await response.text(),
      })
    );
  }

  return response.json();
};

export const isResponseError = (response: Response) =>
  response.status < 200 || response.status >= 400;
