import {
  useDeskproAppClient,
  useDeskproAppEvents,
  useDeskproLatestAppContext,
  useInitialisedDeskproAppClient,
  useQueryWithClient,
} from "@deskpro/app-sdk";
import { Button, H1, H5, Stack } from "@deskpro/deskpro-ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ZodTypeAny, z } from "zod";
import {
  createCustomer,
  createInvoice,
  editCustomer,
  editInvoice,
  getCustomerById,
  getCustomersByEmail,
  getInvoiceById,
  getProductsAndServices,
} from "../../api/api";
import { useLinkCustomer } from "../../hooks/hooks";
import { useQueryMutationWithClient } from "../../hooks/useQueryWithClient";
import CustomerJson from "../../mapping/customer.json";
import InvoiceJson from "../../mapping/invoice.json";
import { getCustomerSchema, getInvoiceSchema } from "../../schemas";
import { ICustomer } from "../../types/customer";
import { IInvoice } from "../../types/invoice";
import { IItem } from "../../types/item";
import { IJson } from "../../types/json";
import { DropdownSelect } from "../DropdownSelect/DropdownSelect";
import { FieldMappingInput } from "../FieldMappingInput/FieldMappingInput";
import { InputWithTitleRegister } from "../InputWithTitle/InputWithTitleRegister";
import { LoadingSpinnerCenter } from "../LoadingSpinnerCenter/LoadingSpinnerCenter";
import { parseJsonErrorMessage } from "../../utils/utils";

const customerInputs = CustomerJson.create;

const invoiceInputs = InvoiceJson.create;

type Props = {
  objectId?: string;
  objectName: "Invoice" | "Customer";
};

export const MutateObject = ({ objectId, objectName }: Props) => {
  const navigate = useNavigate();
  const [schema, setSchema] = useState<ZodTypeAny | null>(null);
  const { linkCustomer, getLinkedCustomer } = useLinkCustomer();
  const { context } = useDeskproLatestAppContext();
  const { client } = useDeskproAppClient();

  const correctJson = useMemo<IJson["create"]>(() => {
    switch (objectName) {
      case "Customer":
        return customerInputs;
      case "Invoice":
        return invoiceInputs;
    }
  }, [objectName]);

  const isEditMode = !!objectId;

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<Partial<IInvoice>>({
    resolver: zodResolver(schema as ZodTypeAny),
    defaultValues:
      objectName === "Invoice"
        ? ({ Line: [{}] } as Partial<IInvoice>)
        : ({} as Partial<ICustomer>),
  });

  const [line] = watch(["Line"]);

  const customer = useQueryWithClient(
    ["customer", objectId as string],
    (client) => getCustomerById(client, objectId as string),
    {
      enabled: isEditMode && objectName === "Customer",
    }
  );

  const invoice = useQueryWithClient(
    ["invoice", objectId as string],
    (client) => getInvoiceById(client, objectId as string),
    {
      enabled: isEditMode && objectName === "Invoice",
    }
  );

  const items = useQueryWithClient(
    ["items"],
    async (client) => getProductsAndServices(client),
    {
      enabled: objectName === "Invoice",
    }
  );

  useEffect(() => {
    if (
      !useLinkCustomer ||
      objectName !== "Invoice" ||
      isEditMode ||
      !context ||
      !client
    )
      return;

    (async () => {
      const linkedCustomer = await getLinkedCustomer();

      if (linkedCustomer) {
        setValue("CustomerRef.value", linkedCustomer?.[0]);

        return;
      }

      const customerByEmail = await getCustomersByEmail(
        client,
        context?.data.user.primaryEmail
      );

      if (!customerByEmail) throw new Error("No linked customer found");

      setValue(
        "CustomerRef.value",
        customerByEmail.QueryResponse.Customer[0].Id
      );
    })();
  }, [objectName, getLinkedCustomer, setValue, context, client, isEditMode]);

  const submitMutation = useQueryMutationWithClient<
    ICustomer | IInvoice,
    { Customer: ICustomer } | { Invoice: IInvoice }
  >(
    (client, data) => {
      switch (
        `${objectName}-${isEditMode}` as
          | "Customer-false"
          | "Customer-true"
          | "Invoice-false"
          | "Invoice-true"
      ) {
        case "Customer-false":
          return createCustomer(client, data as ICustomer);

        case "Customer-true":
          return editCustomer(client, data as ICustomer);

        case "Invoice-false":
          return createInvoice(client, data as IInvoice);

        case "Invoice-true":
          return editInvoice(client, data as IInvoice);
      }
    },
    {
      onError: (error) => {
        throw new Error(error as string);
      },
    }
  );

  useEffect(() => {
    if (
      !objectId ||
      (objectName === "Customer" && !customer.isSuccess) ||
      (objectName === "Invoice" && !invoice.isSuccess)
    )
      return;

    switch (objectName) {
      case "Customer":
        reset(customer.data?.QueryResponse.Customer[0]);
        break;
      case "Invoice":
        invoice.data?.QueryResponse.Invoice[0].Line.splice(-1, 1);
        reset(invoice.data?.QueryResponse.Invoice[0]);
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectName, objectId, customer.isSuccess, invoice.isSuccess]);

  useInitialisedDeskproAppClient(
    (client) => {
      if (!objectName) return;

      client.deregisterElement("plusButton");

      client.setTitle(`${isEditMode ? "Edit" : "Create"} ${objectName}`);

      client.deregisterElement("editButton");
    },
    [objectName, isEditMode]
  );

  useEffect(() => {
    if (!submitMutation.isSuccess) return;

    if (objectName === "Invoice") {
      navigate(
        `/view/single/${objectName}/${
          (submitMutation.data as { Invoice: IInvoice }).Invoice.Id
        }`
      );

      return;
    }

    const id = (submitMutation.data as { Customer: ICustomer }).Customer.Id;

    (async () => {
      !isEditMode && (await linkCustomer(id as string));

      navigate(`/redirect`);

      return;
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    submitMutation.isSuccess,
    navigate,
    objectId,
    isEditMode,
    linkCustomer,
    objectName,
  ]);

  useEffect(() => {
    if (
      !correctJson ||
      correctJson.length === 0 ||
      !objectName ||
      (objectName === "Invoice" && !items.isSuccess)
    )
      return;

    const newObj: { [key: string]: ZodTypeAny } = {};

    correctJson.forEach((field) => {
      if (field.required) {
        newObj[field.name] = z.string().nonempty();
      } else {
        newObj[field.name] = z.string().optional();
      }
    });

    setSchema(
      objectName === "Customer"
        ? getCustomerSchema(correctJson, newObj)
        : getInvoiceSchema(
            correctJson,
            newObj,
            items.data?.QueryResponse.Item as IItem[]
          )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, objectName, items.isSuccess]);

  useDeskproAppEvents({
    async onElementEvent(id) {
      switch (id) {
        case "homeButton":
          navigate("/redirect");

          break;
      }
    },
  });

  if (
    (!customer.isSuccess && objectName === "Customer" && isEditMode) ||
    (!invoice.isSuccess && objectName === "Invoice" && isEditMode) ||
    (!items.isSuccess && objectName === "Invoice") ||
    !correctJson
  )
    return <LoadingSpinnerCenter />;
  return (
    <form
      onSubmit={handleSubmit((data) => submitMutation.mutate(data))}
      style={{ width: "100%" }}
    >
      <Stack vertical style={{ width: "100%" }} gap={6}>
        <FieldMappingInput
          errors={errors}
          fields={correctJson}
          register={register}
          setValue={setValue}
          watch={watch}
        />
        {objectName === "Invoice" && (
          <>
            {line?.map((_, i) => (
              <>
                <H5>Line Item {i + 1}</H5>
                <InputWithTitleRegister
                  register={register(`Line.${i}.SalesItemLineDetail.Qty`, {
                    valueAsNumber: true,
                  })}
                  type="number"
                  title="Quantity"
                  required={true}
                  error={
                    !!errors[
                      `Line.${i}.SalesItemLineDetail.Qty` as keyof IInvoice
                    ]
                  }
                />
                <InputWithTitleRegister
                  register={register(
                    `Line.${i}.SalesItemLineDetail.UnitPrice`,
                    {
                      valueAsNumber: true,
                    }
                  )}
                  required={true}
                  type="number"
                  title="Unit Price"
                  error={
                    !!errors[
                      `Line.${i}.SalesItemLineDetail.UnitPrice` as keyof IInvoice
                    ]
                  }
                />
                <InputWithTitleRegister
                  register={register(`Line.${i}.Description`)}
                  type="text"
                  title="Description"
                  required={true}
                  error={!!errors[`Line.${i}.Description` as keyof IInvoice]}
                />
                <DropdownSelect
                  value={watch(`Line.${i}.SalesItemLineDetail.ItemRef.value`)}
                  title="Product/Service"
                  required={true}
                  data={items.data?.QueryResponse.Item.map((e) => ({
                    key: e.Name,
                    value: e.Id,
                  }))}
                  onChange={(e) =>
                    setValue(`Line.${i}.SalesItemLineDetail.ItemRef.value`, e)
                  }
                  error={
                    !!errors[
                      `Line.${i}.SalesItemLineDetail.ItemRef.value` as keyof IInvoice
                    ]
                  }
                />
              </>
            ))}
            <Stack justify="space-between" style={{ width: "100%" }}>
              <Button
                onClick={() =>
                  setValue(`Line.${line?.length || 0}`, {
                    DetailType: "SalesItemLineDetail",
                    Amount: 0,
                  })
                }
                text="Add Line Item"
              ></Button>
              <Button
                onClick={() =>
                  setValue(
                    `Line`,
                    (line?.length || 0) > 1
                      ? line?.slice(0, -1)
                      : [
                          {
                            DetailType: "SalesItemLineDetail",
                            Amount: 0,
                          },
                        ]
                  )
                }
                intent="secondary"
                text="Remove Line Item"
              ></Button>
            </Stack>
          </>
        )}
        <Stack style={{ width: "100%", justifyContent: "space-between" }}>
          <Button
            type="submit"
            data-testid="button-submit"
            text={objectId ? "Save" : "Create"}
            loading={submitMutation.isLoading}
            disabled={submitMutation.isLoading}
            intent="primary"
          ></Button>
          {!!objectId && (
            <Button
              text="Cancel"
              onClick={() => navigate(`/redirect`)}
              intent="secondary"
            ></Button>
          )}
        </Stack>
      </Stack>
      <H1>
        {!!submitMutation.error &&
          parseJsonErrorMessage(
            (submitMutation.error as { message: string }).message
          )}
      </H1>
    </form>
  );
};
