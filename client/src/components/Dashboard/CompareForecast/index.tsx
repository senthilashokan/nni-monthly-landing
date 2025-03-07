import { useState, useEffect, useContext } from "react";
import CompareForecastInput from "./CompareForecastInput";
import CompareForecastOutput from "./CompareForecastOutput";
import { Box, Grid } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Chart from "@src/assets/images/LineChart.png";
import InfoIcon from "@mui/icons-material/Info";
import { useRequest } from "@src/hook/useRequest/useRequest";
import { UserContext } from "@src/App";

const CompareForecast = () => {
  const { setSnackbar } = useContext(UserContext);
  const [compareForecastOutputView, setCompareForecastOutputView] =
    useState<any>({
      showForecastOutput: false,
      firstForecastData: [],
      compareForecastData: [],
      isLoading: false,
      forecastNames: [],
    });
  const [savedFeatureNames, setSavedFeatureNames] = useState([]);

  const [
    fetchSavedFeaturesNames,
    fetchingSavedFeaturesNames,
    errorFetchingSavedFeaturesNames,
    savedFeaturesNamesApiResponse,
  ] = useRequest();

  useEffect(() => {
    fetchSavedFeaturesNames(
      {
        url: `${import.meta.env.VITE_API_BASE_URL}/saved-features`,
      },
      true
    );
  }, []);

  useEffect(() => {
    if (
      errorFetchingSavedFeaturesNames &&
      errorFetchingSavedFeaturesNames.response?.status != 404
    ) {
      setSnackbar((pre: any) => ({
        ...pre,
        open: true,
        severity: "error",
        message: `Unable to fetch data. Please try again.`,
      }));
    }
    if (savedFeaturesNamesApiResponse) {
      setSavedFeatureNames(
        savedFeaturesNamesApiResponse.data.body.savedFeatureNames
      );
    }
  }, [savedFeaturesNamesApiResponse, errorFetchingSavedFeaturesNames]);

  const [duration, setDuration] = useState({
    fromMonth: "2024-2",
    toMonth: "",
  });

  return fetchingSavedFeaturesNames ? (
    <Box className="flex w-full min-h-screen justify-center items-center">
      <CircularProgress />
    </Box>
  ) : savedFeatureNames.length === 0 ? (
    <Box className="flex">
      <InfoIcon className="mt-2 text-blue-500" />
      <p className="p-1 text-lg  text-blue-500"> No data found to compare.</p>
    </Box>
  ) : (
    <Box className="CompareForecastContainer min-h-screen">
      <Grid container className="">
        <Grid item className=" " sm={12} md={4}>
          <CompareForecastInput
            setCompareForecastOutputView={setCompareForecastOutputView}
            duration={duration}
            setDuration={setDuration}
            savedFeatureNames={savedFeatureNames}
          />
        </Grid>
        <Grid item className=" " sm={12} md={8}>
          {compareForecastOutputView.isLoading ? (
            <Box className=" min-h-screen flex justify-center items-center ">
              <CircularProgress />
            </Box>
          ) : compareForecastOutputView.showForecastOutput ? (
            <CompareForecastOutput
              duration={duration}
              compareForecastOutputView={compareForecastOutputView}
              forecastNames={compareForecastOutputView.forecastNames}
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
export { CompareForecast };
export default CompareForecast;
