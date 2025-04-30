import { useDeskproElements } from '@deskpro/app-sdk';

function ViewCustomersPage() {
    useDeskproElements(({ clearElements, registerElement }) => {
        clearElements();
        registerElement('refresh', { type: 'refresh_button' });
    }, []);

    return (
        <h1>View Customers</h1>
    );
};

export default ViewCustomersPage;