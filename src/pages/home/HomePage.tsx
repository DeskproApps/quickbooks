import { useRegisterElements } from '@/hooks/useRegisterElements';

function HomePage() {


    useRegisterElements(({ registerElement }) => {
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

    return (
        <h1>Home</h1>
    );
};

export default HomePage;