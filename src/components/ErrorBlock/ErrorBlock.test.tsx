import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import ErrorBlock from './ErrorBlock';

const mockTheme = {
  colors: {
    white: '#FFFFFF',
    red100: '#FF0000'
  }
};

describe('ErrorBlock', () => {
  it('should render with the correct styles', () => {
    const { container } = render(
      <ThemeProvider theme={mockTheme}>
        <ErrorBlock>Test ErrorBlock</ErrorBlock>
      </ThemeProvider>
    );
    const node = container.firstChild as HTMLElement;

    expect(node).toHaveStyle('width: 100%');
    expect(node).toHaveStyle('margin-bottom: 8px');
    expect(node).toHaveStyle('padding: 4px 6px');
    expect(node).toHaveStyle('border-radius: 4px');
    expect(node).toHaveStyle('font-size: 12px');
    expect(node).toHaveStyle(`color: ${mockTheme.colors.white}`);
    expect(node).toHaveStyle(`background-color: ${mockTheme.colors.red100}`);
  });

  it('should render children correctly', () => {
    const { getByText } = render(
      <ThemeProvider theme={mockTheme}>
        <ErrorBlock>Test ErrorBlock</ErrorBlock>
      </ThemeProvider>
    );

    expect(getByText('Test ErrorBlock')).toBeInTheDocument();
  });
});