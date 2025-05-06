import { render } from '@testing-library/react';
import Container from './Container';

describe('Container', () => {
  it('should render with the correct styles', () => {
    const { container } = render(<Container>Test Container</Container>);
    const node = container.firstChild as HTMLElement;

    expect(node).toHaveStyle('min-height: 2em');
    expect(node).toHaveStyle('padding: 8px');
    expect(node).toHaveTextContent('Test Container');
  });
});