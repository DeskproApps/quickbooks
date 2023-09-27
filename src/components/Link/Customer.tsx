import {
  useDeskproAppEvents,
  useInitialisedDeskproAppClient,
  useQueryWithClient,
} from "@deskpro/app-sdk";
import { AnyIcon, Button, Checkbox, Input, Stack } from "@deskpro/deskpro-ui";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useDebounce from "../../hooks/debounce";
import { useLinkCustomer } from "../../hooks/hooks";
import CustomerJson from "../../mapping/customer.json";
import { Title } from "../../styles";
import { FieldMapping } from "../FieldMapping/FieldMapping";
import { HorizontalDivider } from "../HorizontalDivider/HorizontalDivider";
import { LoadingSpinnerCenter } from "../LoadingSpinnerCenter/LoadingSpinnerCenter";
import { getCustomersByName } from "../../api/api";

export const LinkCustomer = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const { linkCustomer } = useLinkCustomer();
  const navigate = useNavigate();

  const { debouncedValue: debouncedText } = useDebounce(prompt, 300);

  useInitialisedDeskproAppClient((client) => {
    client.setTitle("Link Customer");

    client.registerElement("homeButton", {
      type: "home_button",
    });

    client.deregisterElement("plusButton");

    client.deregisterElement("menuButton");
  }, []);

  useDeskproAppEvents({
    async onElementEvent(id) {
      switch (id) {
        case "homeButton":
          navigate("/redirect");
      }
    },
  });

  const customersQuery = useQueryWithClient(
    ["getCustomers", debouncedText],
    (client) => getCustomersByName(client, debouncedText),
    {
      enabled: debouncedText.length > 2,
    }
  );

  const customers = customersQuery.data?.QueryResponse.Customer;

  return (
    <Stack gap={10} style={{ width: "100%" }} vertical>
      <Stack vertical gap={6} style={{ width: "100%" }}>
        <Input
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          placeholder="Enter Customer Name"
          type="text"
          leftIcon={faMagnifyingGlass as AnyIcon}
        />
        <Stack vertical style={{ width: "100%" }} gap={5}>
          <Stack
            style={{ width: "100%", justifyContent: "space-between" }}
            gap={5}
          >
            <Button
              onClick={() => linkCustomer(selectedCustomer as string)}
              disabled={selectedCustomer == null}
              text="Link Issue"
            ></Button>
            <Button
              disabled={selectedCustomer == null}
              text="Cancel"
              intent="secondary"
              onClick={() => setSelectedCustomer(null)}
            ></Button>
          </Stack>
          <HorizontalDivider full />
        </Stack>
        {customersQuery.isFetching ? (
          <LoadingSpinnerCenter />
        ) : customersQuery.isSuccess &&
          Array.isArray(customers) &&
          customers?.length !== 0 ? (
          <Stack vertical gap={5} style={{ width: "100%" }}>
            {customers?.map((customer, i) => {
              return (
                <Stack key={i} gap={6} style={{ width: "100%" }}>
                  <Stack style={{ marginTop: "2px" }}>
                    <Checkbox
                      checked={selectedCustomer === customer.Id}
                      onChange={() => {
                        if (selectedCustomer == null) {
                          setSelectedCustomer(customer.Id);
                        } else {
                          setSelectedCustomer(null);
                        }
                      }}
                    ></Checkbox>
                  </Stack>
                  <Stack style={{ width: "92%" }}>
                    <FieldMapping
                      fields={[customer]}
                      hasCheckbox={true}
                      metadata={CustomerJson.list}
                      idKey={CustomerJson.idKey}
                      externalChildUrl={CustomerJson.externalUrl}
                      childTitleAccessor={(e) => e.DisplayName}
                    />
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        ) : (
          customersQuery.isSuccess && <Title>No Customers Found.</Title>
        )}
      </Stack>
    </Stack>
  );
};
