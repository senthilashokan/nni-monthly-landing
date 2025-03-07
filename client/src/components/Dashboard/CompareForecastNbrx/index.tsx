import { useState, useEffect, useContext } from "react";
import CompareForecastInput from "./CompareForecastNbrxInput";
import { Box, Grid } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Chart from "@src/assets/images/LineChart.png";
import InfoIcon from "@mui/icons-material/Info";
import { useRequest } from "@src/hook/useRequest/useRequest";
import { UserContext } from "@src/App";
import NewForecastOutput from "../NewForecastNbrx/NewForecastOutput";

const CompareForecastNbrx = () => {
  const { setSnackbar } = useContext(UserContext);
  const [savedBrandNames, setSavedBrandNames] = useState<Array<string>>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [outputView, setOutputView] = useState<any>({
    showOutput: false,
    outputData: {},
    outputDataForCompare: {
      ModelTypes: [],
      NbrxForecasts: [],
      ModelNames: [],
      BoundsArray: [],
    },
  });
  const [
    fetchSavedData,
    fetchingSavedData,
    errorFetchingSavedData,
    savedDataApiResponse,
  ] = useRequest();

  useEffect(() => {
    fetchSavedData(
      {
        url: `${import.meta.env.VITE_API_BASE_URL}/product-forecast-names`,
      },
      true
    );
  }, []);

  useEffect(() => {
    if (errorFetchingSavedData) {
      setSnackbar((pre: any) => ({
        ...pre,
        open: true,
        severity: "error",
        message: `Unable to fetch data. Please try again.`,
      }));
    }
    if (savedDataApiResponse) {
      setSavedBrandNames(Object.keys(savedDataApiResponse.data));
      if (Object.keys(savedDataApiResponse.data).length > 0) {
        setSelectedBrand(Object.keys(savedDataApiResponse.data)[0]);
      }
    }
  }, [savedDataApiResponse, errorFetchingSavedData]);

  return fetchingSavedData ? (
    <Box className="flex w-full min-h-screen justify-center items-center">
      <CircularProgress />
    </Box>
  ) : savedBrandNames.length === 0 ? (
    <Box className="flex">
      <InfoIcon className="mt-2 text-blue-500" />
      <p className="p-1 text-lg  text-blue-500"> No data found to compare.</p>
    </Box>
  ) : (
    <Box className="CompareForecastNbrxContainer min-h-screen">
      <Grid container className="">
        <Grid item className=" " sm={12} md={4}>
          <CompareForecastInput
            savedBrandNames={savedBrandNames}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            inputData={savedDataApiResponse?.data}
            setOutputView={setOutputView}
          />
        </Grid>
        <Grid item className=" " sm={12} md={8}>
          {/* {compareForecastOutputView.isLoading ? (
            <Box className=" min-h-screen flex justify-center items-center ">
              <CircularProgress />
            </Box>
          ) :  */}
          {outputView.showOutput ? (
            // <CompareForecastOutput />
            <NewForecastOutput
              isCompareToggle={true}
              isCompareDashboard={true}
              setInputView={() => {}}
              setOutputView={() => {}}
              forecastName={"Compared Forecasts"}
              outputData={outputView.outputData}
              outputDataForCompare={outputView.outputDataForCompare}
              saveForecast={() => []}
              loadingForSaveForecast={false}
              setDataToSaveOnCompare={() => {}}
            />
          ) : (
            <div className="min-h-screen flex items-center justify-center">
              <img className="  " src={Chart} alt="Logo" />{" "}
            </div>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default CompareForecastNbrx;
