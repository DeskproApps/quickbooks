import { useRegisterElements } from '@/hooks/useRegisterElements';

function HomePage() {


    useRegisterElements(({ registerElement }) => {
        registerElement('refresh', { type: 'refresh_button' });
    }, []);

    return (
        <h1>Home</h1>
    );
};

export default HomePage;