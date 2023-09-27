import {
  useDeskproAppEvents,
  useDeskproLatestAppContext,
  useInitialisedDeskproAppClient,
  useQueryWithClient,
} from "@deskpro/app-sdk";
import {
  getCustomerById,
  getCustomersByEmail,
  getInvoicesByCustomerId,
} from "../api/api";
import { LoadingSpinnerCenter } from "../components/LoadingSpinnerCenter/LoadingSpinnerCenter";
import { H1, Stack } from "@deskpro/deskpro-ui";
import { useState } from "react";
import { FieldMapping } from "../components/FieldMapping/FieldMapping";

import customerJson from "../mapping/customer.json";
import invoiceJson from "../mapping/invoice.json";
import { useNavigate } from "react-router-dom";
import { useLinkCustomer } from "../hooks/hooks";

export const Main = () => {
  const navigate = useNavigate();
  const { context } = useDeskproLatestAppContext();
  const [customerId, setCustomerId] = useState<string | null | undefined>(
    undefined
  );

  const { getLinkedCustomer } = useLinkCustomer();

  useInitialisedDeskproAppClient((client) => {
    client.setTitle("QuickBooks");

    client.registerElement("homeButton", {
      type: "home_button",
    });

    client.deregisterElement("menuButton");

    client.deregisterElement("link");

    client.deregisterElement("plusButton");

    client.registerElement("menuButton", {
      type: "menu",
      items: [
        {
          title: "Unlink Customer",
          payload: {
            type: "changePage",
            page: "/",
          },
        },
      ],
    });

    client.deregisterElement("editButton");

    client.registerElement("refreshButton", {
      type: "refresh_button",
    });
  }, []);

  useDeskproAppEvents({
    async onElementEvent(id) {
      switch (id) {
        case "menuButton":
          navigate("/findOrCreate");
          break;
        case "homeButton":
          navigate("/refresh");
          break;
      }
    },
  });

  useInitialisedDeskproAppClient(() => {
    (async () => {
      if (!context) return;

      const linkedCustomer = await getLinkedCustomer();

      if (!linkedCustomer || linkedCustomer.length === 0) {
        setCustomerId(null);

        return;
      }

      setCustomerId(linkedCustomer[0]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  const customerQuery = useQueryWithClient(
    ["user", customerId, context?.data.user.primaryEmail],
    (client) =>
      customerId === null
        ? getCustomersByEmail(client, context?.data.user.primaryEmail)
        : getCustomerById(client, customerId as string),
    {
      enabled: customerId !== undefined && !!context?.data.user.primaryEmail,
      onSuccess: (data) => {
        if (!data?.QueryResponse.Customer) return;

        setCustomerId(data?.QueryResponse.Customer[0].Id);
      },
    }
  );

  const invoicesQuery = useQueryWithClient(
    [
      "invoicesByCustomerId",
      customerId as string,
      customerQuery.isSuccess.toString(),
    ],
    (client) => getInvoicesByCustomerId(client, customerId as string),
    { enabled: !!customerId && customerQuery.isSuccess }
  );

  if (customerQuery.isFetching || invoicesQuery.isFetching) {
    return <LoadingSpinnerCenter />;
  }

  if (
    !customerQuery.data?.QueryResponse.Customer ||
    customerQuery.data?.QueryResponse.Customer.length === 0
  ) {
    return (
      <H1>
        No customer was found under email {context?.data.user.primaryEmail}
      </H1>
    );
  }

  const customer = customerQuery.data?.QueryResponse.Customer;
  const invoices = invoicesQuery.data?.QueryResponse.Invoice;

  return (
    <Stack vertical gap={10}>
      <Stack style={{ width: "100%" }}>
        <FieldMapping
          fields={customer ?? []}
          metadata={customerJson.single}
          idKey="Id"
          internalChildUrl={customerJson.internalChildUrl}
          externalChildUrl={customerJson.externalUrl}
          childTitleAccessor={(e) => e.FullyQualifiedName}
        />
      </Stack>
      <FieldMapping
        fields={invoices ?? []}
        title={`Invoices (${invoices?.length ?? 0})`}
        internalUrl={invoiceJson.internalUrl + customerId}
        metadata={invoiceJson.list}
        idKey={invoiceJson.idKey}
        internalChildUrl={invoiceJson.internalChildUrl}
        externalUrl={invoiceJson.externalUrl}
        childTitleAccessor={(e) => e.DocNumber ?? e.Id}
      />
    </Stack>
  );
};
