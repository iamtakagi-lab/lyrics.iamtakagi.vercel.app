import "../styles/index.css";

export const App: React.FC<{
  Component: React.FC;
  pageProps: any;
}> = ({ Component, pageProps }) => <Component {...pageProps} />;

export default App;
