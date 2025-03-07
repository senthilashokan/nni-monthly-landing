import { useCallback, useState } from "react";
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
// import { UserContext } from 'App';
export const useRequest = (): [
  (config: AxiosRequestConfig, authorize?: boolean) => Promise<void>,
  boolean,
  AxiosError | null,
  AxiosResponse | null,
  () => void
] => {
  // const { user } = useContext(UserContext);
  const [loading, setLoding] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);
  const [data, setData] = useState<AxiosResponse | null>(null);

  const getData = (url: string, { headers, ...rest }: AxiosRequestConfig) =>
    axios.get(url, { headers: headers, ...rest });

  const postData = (
    url: string,
    data: unknown,
    { headers, ...rest }: AxiosRequestConfig
  ) => {
    return axios.post(url, data, { headers: headers, ...rest });
  };

  const putData = (
    url: string,
    data: unknown,
    { headers, ...rest }: AxiosRequestConfig
  ) => axios.put(url, data, { headers: headers, ...rest });

  const deleteData = (url: string, { headers, ...rest }: AxiosRequestConfig) =>
    axios.delete(url, { headers: headers, ...rest });

  const resetResponse = useCallback(() => {
    setData(null);
  }, []);

  const execute = useCallback(
    async (
      { method, url, data, headers, ...rest }: AxiosRequestConfig,
      authorize?: boolean
    ) => {
      if (!url) throw new Error("URL is missing");
      setError(null);
      setLoding(true);

      try {
        let response: AxiosResponse | null = null;

        const requestConfig: AxiosRequestConfig = {
          headers: {
            ...headers,
            ...(authorize
              ? {
                  Authorization: sessionStorage.getItem("id_token"),
                  Group: sessionStorage.getItem("User_group"),
                }
              : {}),
          },
          ...rest,
        };
        switch (method) {
          case "POST":
            response = await postData(url, data, requestConfig);
            break;
          case "PUT":
            response = await putData(url, data, requestConfig);
            break;
          case "DELETE":
            response = await deleteData(url, requestConfig);
            break;
          default:
            response = await getData(url, requestConfig);
            break;
        }

        setData(response);
      } catch (error: any) {
        setError(error);
      } finally {
        setLoding(false);
      }
    },
    []
  );

  return [execute, loading, error, data, resetResponse];
};
