import { createSearchParams } from "react-router-dom";
import { RequestParams } from "@/types/api";
import type { ParamKeyValuePair } from "react-router-dom";

/**
 * Converts various types of input data into a query string.
 *
 * @returns {string} The formatted query string or an empty string if input is invalid.
 */
export default function getQueryParams(data?: RequestParams["queryParams"]): string {

  if (!data) {
    return ""
  }

  // Return an empty string if the data is an empty array or object
  if ((Array.isArray(data) && data.length === 0) ||
    (typeof data === "object" && Object.keys(data).length === 0)) {
    return ""
  }

  if (typeof data === "string") {
    return data
  }

  // If the data is an array, format it using createSearchParams
  if (Array.isArray(data)) {
    return createSearchParams(data).toString();
  }

  // If the data is an object, convert the object into key-value pairs
  if (typeof data === "object" && data.constructor === Object) {
    const parsedQueryParams = Object.keys(data)
      .map<ParamKeyValuePair>((key) => ([key, (data)[key]]))
    return createSearchParams(parsedQueryParams).toString()
  }

  return ""
};