import { useState } from 'react';
import { Link, LoadingSpinner, useDeskproElements, useDeskproLatestAppContext, useInitialisedDeskproAppClient } from '@deskpro/app-sdk';
import Container from '@/components/Container/Container';
import ErrorBlock from '@/components/ErrorBlock/ErrorBlock';
import Title from '@/components/Title/Title';
import QuickBooksLogo from '@/components/QuickBooksLogo/QuickBooksLogo';
import TextBlockWithLabel from '@/components/TextBlockWithLabel/TextBlockWithLabel';
import { getCustomerByEmail } from '@/api/quickbooks';
import { placeholders } from '@/constants';
import { ContextData, ContextSettings } from '@/types/deskpro';
import { QuickBooksCustomer } from '@/types/quickbooks';

function HomePage() {
    const { context } = useDeskproLatestAppContext<ContextData, ContextSettings>();
    const [isUsingSandbox, setIsUsingSandbox] = useState(false);
    const [customer, setCustomer] = useState<QuickBooksCustomer>();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useInitialisedDeskproAppClient(client => {
        client.setTitle('Home');
    });

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
            setIsLoading(true);

            const customer = await getCustomerByEmail(client, {
                companyId: context.settings.company_id,
                email: context.data.user.primaryEmail
            });

            if (customer) setCustomer(customer);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'unknown error';
            
            setError(`error finding linked customer: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        };
    }, [context]);

    const ItemTitle = ({ title }: {title: string}) => (
        <Link href='#/customers/view'>
            {title}
        </Link>
    );

    if (isLoading) {
        return <LoadingSpinner />
    };

    if (error) {
        return (
            <Container>
                <ErrorBlock>{error}</ErrorBlock>
            </Container>
        );
    };

    if (!customer?.Id) {
        return (
            <Container>
                <p>No Linked Customer</p>
            </Container>
        );
    };

    return (
        <Container>
            <Title
                title={<ItemTitle title={customer.DisplayName} />}
                icon={<QuickBooksLogo />}
                link={`https://${isUsingSandbox ? 'sandbox.' : ''}qbo.intuit.com/app/customerdetail?nameId=${customer.Id}`}
            />
            <TextBlockWithLabel
                label='Name'
                text={`${customer.GivenName} ${customer.FamilyName}`}
            />
            <TextBlockWithLabel
                label='Email'
                text={customer.PrimaryEmailAddr.Address}
            />
        </Container>
    );
};

export default HomePage;