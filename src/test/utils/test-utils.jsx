import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { OfflineProvider } from '../../context/OfflineContext';

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(ui, options = {}) {
  const {
    route = '/',
    authProviderProps = {},
    ...renderOptions
  } = options;

  // Set initial route
  window.history.pushState({}, 'Test page', route);

  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        <OfflineProvider>
          <AuthProvider {...authProviderProps}>
            {children}
          </AuthProvider>
        </OfflineProvider>
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Re-export everything from testing-library
 */
export * from '@testing-library/react';
export { renderWithProviders as render };

