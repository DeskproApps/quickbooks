import { useState } from 'react';
import { LoadingSpinner, useDeskproElements, useDeskproLatestAppContext, useInitialisedDeskproAppClient } from '@deskpro/app-sdk';
import Container from '@/components/Container/Container';
import Title from '@/components/Title/Title';
import ErrorBlock from '@/components/ErrorBlock/ErrorBlock';
import QuickBooksLogo from '@/components/QuickBooksLogo/QuickBooksLogo';
import TextBlockWithLabel from '@/components/TextBlockWithLabel/TextBlockWithLabel';
import TwoSider from '@/components/TwoSider/TwoSider';
import { getCustomerByEmail } from '@/api/quickbooks';
import { placeholders } from '@/constants';
import { ContextData, ContextSettings } from '@/types/deskpro';
import { QuickBooksCustomer } from '@/types/quickbooks';

function ViewCustomersPage() {
    const { context } = useDeskproLatestAppContext<ContextData, ContextSettings>();
    const [isUsingSandbox, setIsUsingSandbox] = useState(false);
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
                path: '/home'
            }
        });
        registerElement('refresh', {type: 'refresh_button'});
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    useInitialisedDeskproAppClient(async client => {
        const sandboxState = (await client.getUserState(placeholders.IS_USING_SANDBOX))[0].data === true;

        setIsUsingSandbox(sandboxState);
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    useInitialisedDeskproAppClient(async client => {
        if (!context || !context.data?.user?.primaryEmail) {
            return;
        };

        try {
            const customer = await getCustomerByEmail(client, {
                companyId: context.settings.company_id,
                email: context.data.user.primaryEmail
            });

            if (!customer) {
                throw new Error('customer not found');
            };

            setCustomer(customer);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'unknown error';
            
            setError(`error fetching customer: ${errorMessage}`);
        };
    }, [context?.settings.company_id, context?.data?.user?.primaryEmail]);

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
                link={`https://${isUsingSandbox ? 'sandbox.' : ''}qbo.intuit.com/app/customerdetail?nameId=${customer.Id}`}
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