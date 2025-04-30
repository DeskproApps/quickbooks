import { LoadingSpinner, useDeskproElements, useDeskproLatestAppContext, useInitialisedDeskproAppClient } from '@deskpro/app-sdk';
import Container from '@/components/Container/Container';
import Title from '@/components/Title/Title';
import { getCustomerByEmail } from '@/api/quickbooks';
import { ContextData, ContextSettings } from '@/types/deskpro';
import { useState } from 'react';
import { QuickBooksCustomer } from '@/types/quickbooks';
import ErrorBlock from '@/components/ErrorBlock';
import QuickBooksLogo from '@/components/QuickBooksLogo';
import { c } from 'vite/dist/node/moduleRunnerTransport.d-CXw_Ws6P';
import TextBlockWithLabel from '@/components/TextBlockWithLabel/TextBlockWithLabel';
import TwoSider from '@/components/TwoSider/TwoSider';

function ViewCustomersPage() {
    const { context } = useDeskproLatestAppContext<ContextData, ContextSettings>();
    const [customer, setCustomer] = useState<QuickBooksCustomer>();
    const [error, setError] = useState<string | null>(null);

    useInitialisedDeskproAppClient(client => {
        client.setTitle('View Customer');
    }, []);

    useDeskproElements(({ clearElements, registerElement }) => {
        clearElements();
        registerElement('home', {
            type: 'home_button',
            payload: {
                type: 'changePage',
                path: '/'
            }
        });
        registerElement('refresh', { type: 'refresh_button' });
    }, []);

    useInitialisedDeskproAppClient(async client => {
        if (!context) {
            return;
        };

        try {
            const customer = await getCustomerByEmail(client, {
                companyId: context.settings.company_id,
                email: context.data?.user?.primaryEmail || '',
            });

            if (!customer) {
                throw new Error('customer not found');
            };

            setCustomer(customer);
            console.log('Customer:', customer);
        } catch (error) {
            setError(`error fetching customer: ${error}`);
        };
    }, [context]);

    if (error) {
        return (
            <Container>
                <ErrorBlock>{error}</ErrorBlock>
            </Container>
        );
    };

    if (!customer) {
        return <LoadingSpinner />
    };

    return (
        <Container>
            <Title
                title={customer.DisplayName}
                icon={<QuickBooksLogo />}
                link={`https://qbo.intuit.com/app/customerdetail?nameId=${customer.Id}`}
            />
            <TextBlockWithLabel
                label='ID'
                text={customer.Id}
            />
            <TextBlockWithLabel
                label='Name'
                text={`${customer.GivenName} ${customer.FamilyName}`}
            />
            <TwoSider
                leftLabel='Balance'
                leftText={`${customer.Balance} ${customer.CurrencyRef.value}`}
                rightLabel='Balance with Jobs'
                rightText={`${customer.BalanceWithJobs} ${customer.CurrencyRef.value}`}
            />
            <TextBlockWithLabel
                label='Email'
                text={customer.PrimaryEmailAddr.Address}
            />
            <TextBlockWithLabel
                label='Phone'
                text={customer.PrimaryPhone.FreeFormNumber}
            />
            <TextBlockWithLabel
                label='Billing Address'
                text={`${customer.BillAddr.Line1}, ${customer.BillAddr.City}, ${customer.BillAddr.CountrySubDivisionCode}, ${customer.BillAddr.PostalCode}`}
            />
            <TextBlockWithLabel
                label='Shipping Address'
                text={`${customer.ShipAddr.Line1}, ${customer.ShipAddr.City}, ${customer.ShipAddr.CountrySubDivisionCode}, ${customer.ShipAddr.PostalCode}`}
            />
        </Container>
    );
};

export default ViewCustomersPage;