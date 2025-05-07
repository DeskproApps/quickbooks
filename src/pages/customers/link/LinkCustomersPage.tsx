import { Button, P5, Radio, Stack, TProps, TSpan } from "@deskpro/deskpro-ui";
import { ContextData, ContextSettings } from "@/types/deskpro";
import { ExternalIconLink, HorizontalDivider, LoadingSpinner, Search, useDeskproAppClient, useDeskproElements, useDeskproLatestAppContext, useInitialisedDeskproAppClient } from "@deskpro/app-sdk";
import { FC, PropsWithChildren, useCallback, useState } from "react";
import { getCustomersByQuery } from "@/api/quickbooks";
import { QuickBooksCustomer } from "@/types/quickbooks";
import { setCustomerLink } from "@/api/deskpro";
import { ThemeProps } from "@/types/general";
import { useNavigate } from "react-router-dom";
import QuickBooksLogo from "@/components/QuickBooksLogo/QuickBooksLogo";
import styled from "styled-components";
import { placeholders } from '@/constants';

const RadioBox = styled(Radio)`
  width: 12px;
`;

const Secondary: FC<PropsWithChildren<Omit<TProps, "type">> & {
    type?: TProps["type"],
}> = styled(TSpan).attrs({ type: "p1" })`
  color: ${({ theme }: ThemeProps) => theme.colors.grey60};
`;

export default function LinkCustomersPage() {
    const navigate = useNavigate()
    const { context } = useDeskproLatestAppContext<ContextData, ContextSettings>()
    const { client } = useDeskproAppClient()
    const deskproUser = context?.data?.user
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [isFetchingCustomers, setIsFetchingCustomers] = useState<boolean>(false)
    const [isLinkingCustomers, setIsLinkingCustomers] = useState<boolean>(false)
    const [customers, setCustomers] = useState<QuickBooksCustomer[]>([])
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
    const [isUsingSandbox, setIsUsingSandbox] = useState(false);

    useInitialisedDeskproAppClient(client => {
        client.setTitle('Link Customers');
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    useInitialisedDeskproAppClient(async client => {
        if (!context) {
            return;
        };

        const sandboxState = (await client.getUserState(placeholders.IS_USING_SANDBOX))[0].data === true;

        setIsUsingSandbox(sandboxState);
    }, []);

    useDeskproElements(({ clearElements, registerElement }) => {
        clearElements();
        registerElement('refresh', { type: 'refresh_button' });
        registerElement('menu', {
            type: 'menu',
            items: [
                {
                    title: 'Log Out',
                    payload: {
                        type: 'logOut'
                    }
                }
            ]
        });
    }, []);

    useInitialisedDeskproAppClient(client => {
        void (async () => {
            if (!searchQuery || searchQuery.trim().length < 3 || !context?.settings.company_id) {
                setCustomers([])
                return
            }

            setIsFetchingCustomers(true)

            try {
                const response = await getCustomersByQuery(client,
                    {
                        companyId: context.settings.company_id,
                        text: searchQuery
                    })

                setCustomers(response)

                // Reset selectedCustomerId if it's not in the new customer list
                if (selectedCustomerId && !response.find((c) => c.Id === selectedCustomerId)) {
                    setSelectedCustomerId(null)
                }
            } catch (error) {
                setCustomers([])
            } finally {
                setIsFetchingCustomers(false)
            }
        })();
    }, [searchQuery]);

    const onLinkButtonClick = useCallback(() => {
        if (!client || !deskproUser?.id || !selectedCustomerId) {
            return
        }

        setIsLinkingCustomers(true)

        setCustomerLink(client, { userId: deskproUser.id, customerId: selectedCustomerId })
            .then(() => { void navigate("/customer/view") })
            .catch(() => { { void navigate('/') } })
            .finally(() => {
                setIsLinkingCustomers(false)
            })


    }, [client, deskproUser?.id, navigate, selectedCustomerId])

    const onCancelButtonClick = useCallback(() => {
        void navigate("/customer/view")
    }, [navigate])


    return (<>
        <Stack vertical style={{ width: "100%" }} padding={12} gap={6}>
            <Search isFetching={isFetchingCustomers} onChange={(value) => { setSearchQuery(value) }} inputProps={{ placeholder: "Enter email" }} />

            <Stack style={{ width: "100%" }} justify="space-between" gap={6}>
                <Button
                    type="button"
                    text="Link Customer"
                    disabled={!selectedCustomerId || isLinkingCustomers}
                    loading={isLinkingCustomers}
                    onClick={onLinkButtonClick}
                />
                <Button
                    type="button"
                    text="Cancel"
                    intent="secondary"
                    onClick={onCancelButtonClick}
                />
            </Stack>
        </Stack>


        <HorizontalDivider />

        {isFetchingCustomers ?

            <LoadingSpinner /> :

            customers.length === 0
                ? (
                    <div style={{ padding: 12 }}>No customers found</div>
                ) :
                customers.map((customer) => {
                    return (
                        <Stack padding={12} gap={5}>
                            <RadioBox
                                checked={selectedCustomerId === customer.Id}
                                onChange={() => { setSelectedCustomerId(customer.Id); }}
                            />


                            <div style={{ width: 'calc(100% - 12px - 6px)', marginTop: "-5px", flexGrow: 1 }}>
                                <P5>
                                    <Button intent="minimal" onClick={(e: MouseEvent) => {
                                        e.preventDefault()
                                        setSelectedCustomerId(customer.Id)
                                    }} text={customer.DisplayName} />
                                </P5>

                                <Stack gap={10} wrap="nowrap" style={{ justifyContent: "space-between", width: "100%" }} >
                                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        <Secondary type="p5">{customer.PrimaryEmailAddr.Address}</Secondary>
                                    </div>
                                </Stack>
                            </div>

                            <ExternalIconLink href={`https://${isUsingSandbox ? 'sandbox.' : ''}qbo.intuit.com/app/customerdetail?nameId=${customer.Id}`} icon={<QuickBooksLogo />} />
                        </Stack>)
                })
        }
    </>)
};