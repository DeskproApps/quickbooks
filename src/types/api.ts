import { Dict } from "@/types/general";
import { ParamKeyValuePair } from "react-router-dom";

export type ApiRequestMethod = "GET" | "POST" | "PUT" | "DELETE";

export type RequestParams = {
  endpoint: string,
  /**
   * The realm ID (A.K.A. company ID) for the QuickBooks account.
   */
  realmId: string,
  method?: ApiRequestMethod,
  data?: string, // The stringified data object (JSON)
  headers?: Dict<string>,
  queryParams?: string | Dict<string> | ParamKeyValuePair[],
};

