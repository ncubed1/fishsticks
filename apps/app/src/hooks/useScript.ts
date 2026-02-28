import { useEffect } from 'react';

const useScript = (url, isModule = false) => {
  useEffect(() => {
    const script = document.createElement('script');

    script.type = isModule ? 'module' : 'text/javascript';
    script.src = url;
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
  }, [url, isModule]);
};

export default useScript;