import { useEffect, useState, useContext, useMemo } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useRequest } from "@src/hook/useRequest/useRequest";
import InfoIcon from "@mui/icons-material/Info";
import { UserContext } from "@src/App";

interface CompareForecastInputInterface {
  setCompareForecastOutputView: any;
  savedFeatureNames: string[];
}

const TrackingInput = (props: CompareForecastInputInterface) => {
  const { setCompareForecastOutputView, savedFeatureNames } = props;
  const { setSnackbar } = useContext(UserContext);
  const [selectedForecastArray, setSelectedForecastArray] = useState<any>([]);
  const [selectedFeature, setSelectedFeature] = useState(savedFeatureNames[0]);
  const [forecastSelectionError, setForecastSelectionError] = useState<{
    error: boolean;
    message: string;
  }>({
    error: false,
    message: "",
  });
  // Custom hook for making API requests
  const [
    fetchForecastToCompare,
    fetchingForecastToCompare,
    errorFetchingForecastToCompare,
    forecastToCompareApiResponse,
    forecastToCompareClearResponse,
  ] = useRequest();
  const [
    fetchCompareForecastData,
    fetchingCompareForecastData,
    errorFetchingCompareForecastData,
    compareForecastDataApiResponse,
  ] = useRequest();
  const [
    fetchBudgetValues,
    fetchingBudgetValues,
    errorFetchingBudgetValues,
    budgetValuesApiResponse,
  ] = useRequest();

  // Fetch budget values when selectedFeature changes
  useEffect(() => {
    fetchBudgetValues(
      {
        url: `${import.meta.env.VITE_API_BASE_URL}/approved-budget`,
        method: "POST",
        data: {
          Selected_account: [selectedFeature],
        },
      },
      true
    );
  }, [selectedFeature]);

  // Memoized values for BudgetValues and disableFlag
  const { BudgetValues, disableFlag } = useMemo(() => {
    let BudgetValues;
    let disableFlag: boolean = false;
    if (errorFetchingBudgetValues) {
      disableFlag = true;
      // Show error snackbar
      setSnackbar((pre: any) => ({
        ...pre,
        open: true,
        severity: "error",
        message: `Unable to fetch budget values for ${selectedFeature}. Please try again.`,
      }));
    }
    if (budgetValuesApiResponse) {
      const y: any = Object.values(
        JSON.parse(JSON.parse(budgetValuesApiResponse.data.body).response).data
      )[0];
      BudgetValues = y
        .filter((entry: any) => {
          const date = new Date(entry[0]);
          return date.getFullYear() === new Date().getFullYear();
        })
        .map((entry: any) => entry.slice(1));
    }
    return { BudgetValues, disableFlag };
  }, [budgetValuesApiResponse, errorFetchingBudgetValues]);

  // Update loading state in compareForecastOutputView when fetchingCompareForecastData changes
  useEffect(() => {
    setCompareForecastOutputView((pre: any) => ({
      ...pre,
      isLoading: fetchingCompareForecastData,
    }));
  }, [fetchingCompareForecastData]);

  // Handler for selecting a different feature
  const handleChange = (event: any) => {
    setCompareForecastOutputView((pre: any) => ({
      ...pre,
      showForecastOutput: false,
    }));
    setSelectedFeature(event.target.value);
    forecastToCompareClearResponse();
  };

  // Handler for fetching and comparing forecasts
  const handleCompareForecast = () => {
    if (selectedForecastArray.length === 0) {
      // Show error message if no forecasts are selected
      setForecastSelectionError((pre) => ({
        ...pre,
        error: true,
        message: "Please select forecasts to compare",
      }));
    } else {
      // Fetch and compare forecasts
      fetchCompareForecastData(
        {
          url: `${import.meta.env.VITE_API_BASE_URL}/compare-forecast`,
          method: "POST",
          data: selectedForecastArray,
        },
        true
      );
    }
  };

  // Handle the response after fetching and comparing forecasts
  useEffect(() => {
    if (compareForecastDataApiResponse) {
      // Extract forecast names and data
      const forecastNames = Object.keys(
        compareForecastDataApiResponse?.data?.body
      );
      const forecastDataUnfiltered = Object.values(
        compareForecastDataApiResponse?.data?.body
      );
      const forecastValues = forecastDataUnfiltered.map((array: any) =>
        array.filter((item: any) =>
          item.MONTH.includes(new Date().getFullYear())
        )
      );
      const forecastData = forecastValues.map((array: any) =>
        array.map((item: any) => item.FORECAST)
      );
      // Update state and show success snackbar
      setCompareForecastOutputView((pre: any) => ({
        ...pre,
        showForecastOutput: true,
        forecastData,
        forecastNames,
        BudgetValues,
      }));
      setSnackbar((pre: any) => ({
        ...pre,
        open: true,
        severity: "success",
        message: "Forecasts tracked successfully.",
      }));
    }
    if (errorFetchingCompareForecastData) {
      // Show error snackbar if unable to fetch forecast data
      setSnackbar((pre: any) => ({
        ...pre,
        open: true,
        severity: "error",
        message: "Unable to fetch forecast data. Please try again.",
      }));
    }
  }, [errorFetchingCompareForecastData, compareForecastDataApiResponse]);

  // Handler for form submission
  const onSubmitForm = () => {
    setSelectedForecastArray(() => []);
    forecastToCompareClearResponse();
    if (budgetValuesApiResponse) {
      // Fetch forecast names to compare
      fetchForecastToCompare(
        {
          url: `${import.meta.env.VITE_API_BASE_URL}/all-forecast-names`,
          method: "POST",
          data: {
            featureType: selectedFeature,
          },
          params: {
            match: "track",
          },
        },
        true
      );
    }
  };

  const onClearAll = () => {
    setSelectedForecastArray([]);
  };

  return (
    <Box className=" min-h-screen  p-3 space-y-4">
      <Grid
        container
        direction="column"
        justifyContent="left"
        alignItems="left"
      >
        <Box justifyContent="left" alignItems="left" className="pl-2">
          {/* Title */}
          <Typography className="" variant="h4" gutterBottom>
            Track Forecasts
          </Typography>
          {/* Description */}
          <p className="text-gray-700 text-sm">
            Track and compare your forecast performances
          </p>
          {/* Feature selection */}
          <Box justifyContent="left" alignItems="left" marginTop="50px">
            <h3 className="mb-2 text-normal-700">
              Select Account Group
              <span className="text-md font-medium text-red-700 mb-2"> *</span>
            </h3>
            <FormControl fullWidth>
              <Select value={selectedFeature} onChange={handleChange}>
                {savedFeatureNames.map((feature, index) => (
                  <MenuItem key={index} value={feature}>
                    {feature}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          {/* Proceed button */}
          <div className="mb-5 mt-10 w-full flex justify-start">
            {fetchingForecastToCompare || fetchingBudgetValues ? (
              <CircularProgress />
            ) : (
              <Button
                disabled={disableFlag}
                onClick={onSubmitForm}
                variant="outlined"
              >
                Proceed
              </Button>
            )}
          </div>
          {/* Information and error messages */}
          {selectedForecastArray.length > 4 && (
            <Box className="flex">
              <InfoIcon className="mt-2 text-blue-500" />
              <p className="p-1 text-lg  text-blue-500">
                Max 4 forecasts can be tracked at a time.
              </p>
            </Box>
          )}
          {errorFetchingForecastToCompare?.response?.status === 404 ? (
            <Box className="flex">
              <InfoIcon className="mt-2 text-blue-500" />
              <p className="p-1 text-lg  text-blue-500">
                No forecast was found. Please try again.
              </p>
            </Box>
          ) : forecastToCompareApiResponse ? (
            <>
              <Box className="flex w-full">
                <h3 className=" text-normal-700 w-1/2">
                  Select Forecasts
                  <span className="text-md font-medium text-red-700 mb-2">
                    {" "}
                    *
                  </span>
                </h3>
                <p
                  className="text-sm underline cursor-pointer w-16 "
                  onClick={onClearAll}
                >
                  Clear All
                </p>
              </Box>
              {forecastSelectionError.error && (
                <p className="text-red-500 text-[13px]  ">
                  {forecastSelectionError.message}
                </p>
              )}
              <Box className="grid">
                {/* Checkbox for each forecast */}
                {forecastToCompareApiResponse?.data.body.map(
                  (
                    item: { forecastName: string; createdOn: number },
                    index: number
                  ) => {
                    return (
                      <FormControlLabel
                        key={index}
                        control={
                          <Checkbox
                            onClick={() => {
                              setCompareForecastOutputView((pre: any) => ({
                                ...pre,
                                showForecastOutput: false,
                              }));
                              setForecastSelectionError((pre) => ({
                                ...pre,
                                error: false,
                                message: "",
                              }));
                              // Toggle selected forecast
                              if (selectedForecastArray.includes(item)) {
                                setSelectedForecastArray((pre: any) =>
                                  pre.filter(
                                    (value: any) =>
                                      value.createdOn !== item.createdOn
                                  )
                                );
                              } else {
                                setSelectedForecastArray((pre: any) => [
                                  ...pre,
                                  item,
                                ]);
                              }
                            }}
                            checked={selectedForecastArray.includes(item)}
                          />
                        }
                        label={item?.forecastName}
                      />
                    );
                  }
                )}
              </Box>
              {/* Track Forecasts button */}
              <Box className="flex justify-end">
                <Button
                  disabled={selectedForecastArray.length > 4}
                  variant="contained"
                  onClick={handleCompareForecast}
                >
                  Track Forecasts
                </Button>
              </Box>
            </>
          ) : (
            <></>
          )}
        </Box>
      </Grid>
    </Box>
  );
};

export default TrackingInput;
