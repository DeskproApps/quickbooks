import { z } from "zod";
import { IInvoice } from "../types/invoice";
import { IItem } from "../types/item";
import { createNestedObject } from "../utils/utils";

export const getMetadataBasedSchema = (
  fields: {
    name: string;
  }[],
  customInputs: {
    [key: string]: z.ZodTypeAny;
  }
) => {
  const newObj: {
    [key: string]: z.ZodTypeAny;
  } = {};

  for (const field of fields) {
    newObj[field.name] = z.string().optional();
  }

  const schema = z
    .object({
      ...newObj,
      ...customInputs,
    })
    .passthrough()
    .transform((obj) => {
      for (const key of Object.keys(obj)) {
        if (obj[key as keyof typeof obj] === "") {
          delete obj[key as keyof typeof obj];
        }
      }
      return obj;
    });

  return schema;
};

export const getCustomerSchema = (
  fields: {
    name: string;
  }[],
  customInputs: {
    [key: string]: z.ZodTypeAny;
  }
) => {
  const schema = getMetadataBasedSchema(fields, customInputs);

  return schema;
};

export const getInvoiceSchema = (
  fields: {
    name: string;
  }[],
  customInputs: {
    [key: string]: z.ZodTypeAny;
  },
  items: IItem[]
) => {
  const schema = getMetadataBasedSchema(fields, {
    ...customInputs,
    Line: z.array(
      z.object({
        Description: z.string().optional(),
        SalesItemLineDetail: z.object({
          ItemRef: z.object({
            value: z.string(),
          }),
          Qty: z.number(),
          UnitPrice: z.number(),
        }),
      })
    ),
  });

  const transformedSchema = schema.transform((obj: Partial<IInvoice>) => ({
    ...createNestedObject(obj),
    Line: obj.Line?.map((line, i) => ({
      ...line,
      Id: i,
      Amount:
        (line.SalesItemLineDetail?.Qty || 0) *
        (line.SalesItemLineDetail?.UnitPrice || 0),
      DetailType: "SalesItemLineDetail",
      SalesItemLineDetail: {
        ...line.SalesItemLineDetail,
        ItemRef: {
          name: items.find(
            (item) =>
              item.Id === obj.Line?.[i].SalesItemLineDetail?.ItemRef.name
          )?.Name,
          value: obj.Line?.[i].SalesItemLineDetail?.ItemRef.value,
        },
      },
    })),
  }));

  return transformedSchema;
};
