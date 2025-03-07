import { useContext, useEffect, useState } from "react";
import { Typography, Box, CircularProgress } from "@mui/material";
import SummaryInput from "./SummaryInput";
import SummaryOutput from "./SummaryOutput";
import { useRequest } from "@src/hook/useRequest/useRequest";
import { UserContext } from "@src/App";
import InfoIcon from "@mui/icons-material/Info";

const Summary = () => {
  // Using context to access a function for displaying notifications
  const { setSnackbar } = useContext(UserContext);
  const [summaryOutputView, setSummaryOutputView] = useState<any>({
    isShowForecastOutput: false,
    forecastData: {},
    budgetValues: [],
  });

  const [savedFeatureNames, setSavedFeatureNames] = useState([]);

  const [
    fetchSavedFeaturesNames,
    fetchingSavedFeaturesNames,
    errorFetchingSavedFeaturesNames,
    savedFeaturesNamesApiResponse,
  ] = useRequest();

  // Fetch saved feature names when component mounts
  useEffect(() => {
    fetchSavedFeaturesNames(
      {
        url: `${import.meta.env.VITE_API_BASE_URL}/saved-features`,
      },
      true
    );
  }, []);

  // Update state when saved feature names are fetched or if there is an error
  useEffect(() => {
    if (
      errorFetchingSavedFeaturesNames &&
      errorFetchingSavedFeaturesNames.response?.status != 404
    ) {
      // Show error snackbar if unable to fetch saved feature names
      setSnackbar((pre: any) => ({
        ...pre,
        open: true,
        severity: "error",
        message: `Unable to fetch data. Please try again.`,
      }));
    }
    if (savedFeaturesNamesApiResponse) {
      // Set saved feature names in state
      setSavedFeatureNames(
        savedFeaturesNamesApiResponse.data.body.savedFeatureNames
      );
    }
  }, [savedFeaturesNamesApiResponse, errorFetchingSavedFeaturesNames]);

  return fetchingSavedFeaturesNames ? (
    // Display loading spinner while fetching saved feature names
    <Box className="flex w-full min-h-screen justify-center items-center">
      <CircularProgress />
    </Box>
  ) : savedFeatureNames.length === 0 ? (
    // Display message if no saved feature names are found
    <Box className="flex">
      <InfoIcon className="mt-2 text-blue-500" />
      <p className="p-1 text-lg  text-blue-500">
        {" "}
        No data found to create summary.
      </p>
    </Box>
  ) : (
    // Display summary input or output based on state
    <Box>
      <Typography className="pt-5 pl-5" variant="h4">
        Forecast Summary
      </Typography>
      <p className="pt-2 pl-5 text-zinc-400">
        Summary of forecasted primary data
      </p>
      {summaryOutputView.isShowForecastOutput ? (
        <SummaryOutput
          summaryOutputView={summaryOutputView}
          setSummaryOutputView={setSummaryOutputView}
        />
      ) : (
        <SummaryInput
          setSummaryOutputView={setSummaryOutputView}
          savedFeatureNames={savedFeatureNames}
        />
      )}
    </Box>
  );
};

export { Summary };
export default Summary;
