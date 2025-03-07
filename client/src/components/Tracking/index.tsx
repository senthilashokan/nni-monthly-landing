import { Box, Grid, CircularProgress, Divider } from "@mui/material";
import { useEffect, useState, useContext } from "react";
import TrackingOutput from "./TrackingOutput";
import TrackingInput from "./TrackingInput";
import Chart from "@src/assets/images/LineChart.png";
import { useRequest } from "@src/hook/useRequest/useRequest";
import { UserContext } from "@src/App";
import InfoIcon from "@mui/icons-material/Info";

const Tracking = () => {
  // useContext hook to access the UserContext and retrieve the setSnackbar function
  const { setSnackbar } = useContext(UserContext);

  // useState hook to manage state related to the forecast output view
  const [compareForecastOutputView, setCompareForecastOutputView] =
    useState<any>({
      showForecastOutput: false,
      forecastData: [],
      isLoading: false,
      forecastNames: [],
      BudgetValues: [],
    });

  // useState hook to manage state related to saved feature names
  const [savedFeatureNames, setSavedFeatureNames] = useState([]);

  // useRequest custom hook to handle fetching of saved feature names
  const [
    fetchSavedFeaturesNames,
    fetchingSavedFeaturesNames,
    errorFetchingSavedFeaturesNames,
    savedFeaturesNamesApiResponse,
  ] = useRequest();

  useEffect(() => {
    // Fetch saved feature names when component mounts
    fetchSavedFeaturesNames(
      {
        url: `${import.meta.env.VITE_API_BASE_URL}/saved-features`,
      },
      true
    );
  }, []);

  useEffect(() => {
    // Handle errors or set saved feature names when API response is received
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

  return fetchingSavedFeaturesNames ? (
    // Show loading spinner while fetching saved feature names
    <Box className="flex w-full min-h-screen justify-center items-center">
      <CircularProgress />
    </Box>
  ) : savedFeatureNames.length === 0 ? (
    // Show info icon and message if no saved feature names are found
    <Box className="flex">
      <InfoIcon className="mt-2 text-blue-500" />
      <p className="p-1 text-lg  text-blue-500">
        {" "}
        No data found for Tracking .
      </p>
    </Box>
  ) : (
    <Box>
      <Grid container className="">
        {/* Tracking input component */}
        <Grid item className=" " sm={12} md={4}>
          <TrackingInput
            setCompareForecastOutputView={setCompareForecastOutputView}
            savedFeatureNames={savedFeatureNames}
          />
        </Grid>
        {/* Divider */}
        <Divider orientation="vertical" flexItem />
        <Grid item className=" " sm={12} md={0.1}></Grid>

        {/* Tracking output component or chart */}
        <Grid item className=" " sm={12} md={7.8}>
          {compareForecastOutputView.isLoading ? (
            // Show loading spinner if output is loading
            <Box className=" min-h-screen flex justify-center items-center ">
              <CircularProgress />
            </Box>
          ) : compareForecastOutputView.showForecastOutput ? (
            // Show forecast output if available
            <TrackingOutput
              compareForecastOutputView={compareForecastOutputView}
            />
          ) : (
            // Show chart if forecast output is not available
            <div className="min-h-screen flex items-center justify-center">
              <img className="  " src={Chart} alt="Logo" />{" "}
            </div>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export { Tracking };
export default Tracking;
