import { ReactElement } from "react";
import { IJson } from "../types/json";
import { formatDate } from "../utils/dateUtils";
import { getObjectValue, makeFirstLetterUppercase } from "../utils/utils";
import { CustomTag } from "../components/CustomTag/CustomTag";

export const useMapFieldValues = () => {
  const mapFieldValues = (
    metadataFields: IJson["list"][0] | IJson["single"][0],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: any
  ) => {
    return metadataFields.map((metadataField) => {
      let value: string | ReactElement;

      switch (metadataField.type) {
        case "date":
          value = field[metadataField.name]
            ? formatDate(new Date(field[metadataField.name] as string))
            : "-";

          break;

        case "label": {
          value = (
            <CustomTag title={field[metadataField.name] as string}></CustomTag>
          );

          break;
        }

        case "key":
          value = getObjectValue(field, metadataField.name);

          break;

        case "address":
          value = `${field.BillAddr.Line1 ?? ""} ${
            field.BillAddr.Line2 ?? ""
          } ${field.BillAddr.City ?? ""} ${field.BillAddr.PostalCode ?? ""} ${
            field.BillAddr.Country ?? ""
          }`;

          break;

        case "text":
          value = makeFirstLetterUppercase(field[metadataField.name] as string);

          break;

        case "currency":
          value = `${getObjectValue(field, metadataField.name)} ${
            field.CurrencyRef?.value
          }`;

          break;

        case "lineitem":
          value = "lineitem";

          break;

        case "invoice":
          value = field[metadataField.name] || "Not Sent";

          break;

        default:
          if (metadataField.name in field) {
            value = field[metadataField.name] as string;
          } else {
            value = "-";
          }
      }

      return {
        key: metadataField.label,
        value,
      };
    });
  };

  return { mapFieldValues };
};
