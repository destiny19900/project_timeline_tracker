import { createGlobalStyle } from 'styled-components';
import { Theme } from '@mui/material/styles';

export const GlobalStyles = createGlobalStyle<{ theme: Theme }>`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition: background-color 0.3s ease;
    background-color: ${({ theme }) => theme.palette.background.default};
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.palette.background.default};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.palette.primary.main};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.palette.primary.dark};
  }

  .fade-enter {
    opacity: 0;
  }

  .fade-enter-active {
    opacity: 1;
    transition: opacity 300ms ease-in;
  }

  .fade-exit {
    opacity: 1;
  }

  .fade-exit-active {
    opacity: 0;
    transition: opacity 300ms ease-in;
  }
`; 