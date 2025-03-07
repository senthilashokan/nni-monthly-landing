import { useEffect, useState, useContext } from "react"; // Importing necessary hooks from React
import {
  Box,
  Breadcrumbs,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Select,
  Typography,
} from "@mui/material"; // Importing MUI components
import MonthRangePicker from "@src/UI/MonthRangePicker"; // Importing MonthRangePicker component
import { Link } from "react-router-dom"; // Importing Link component from react-router-dom
import dayjs from "dayjs"; // Importing dayjs for date manipulation
import { useRequest } from "@src/hook/useRequest/useRequest"; // Importing custom hook for making requests
import InfoIcon from "@mui/icons-material/Info"; // Importing InfoIcon from MUI icons
import { UserContext } from "@src/App"; // Importing UserContext from App component

// Interface for props of CompareForecastInput component
interface CompareForecastInputInterface {
  setCompareForecastOutputView: any; // Function to set compare forecast output view
  duration: any; // Duration object
  setDuration: any; // Function to set duration
  savedFeatureNames: string[]; // Array of saved feature names
}

// CompareForecastInput component
const CompareForecastInput = (props: CompareForecastInputInterface) => {
  const {
    setCompareForecastOutputView,
    duration,
    setDuration,
    savedFeatureNames,
  } = props; // Destructuring props
  const { setSnackbar } = useContext(UserContext); // Accessing UserContext for displaying snackbar messages
  const [
    fetchForecastToCompare,
    fetchingForecastToCompare,
    errorFetchingForecastToCompare,
    forecastToCompareApiResponse,
    forecastToCompareClearResponse,
  ] = useRequest(); // Custom hook for fetching forecast data to compare
  const [
    fetchCompareForecastData,
    fetchingCompareForecastData,
    errorFetchingCompareForecastData,
    compareForecastDataApiResponse,
  ] = useRequest(); // Custom hook for fetching compare forecast data

  // Effect to update loading state in compare forecast output view
  useEffect(() => {
    setCompareForecastOutputView((pre: any) => ({
      ...pre,
      isLoading: fetchingCompareForecastData,
    }));
  }, [fetchingCompareForecastData]);

  // State for month range error
  const [monthRangeError, setMonthRangeError] = useState<{
    error: boolean;
    message: string;
  }>({
    error: false,
    message: "",
  });

  // State for forecast selection error
  const [forecastSelectionError, setForecastSelectionError] = useState<{
    error: boolean;
    message: string;
  }>({
    error: false,
    message: "",
  });

  // State for selected forecasts array
  const [selectedForecastArray, setSelectedForecastArray] = useState<any>([]);

  // State for year error
  const [yearError, setYearError] = useState(false);

  // State for selected feature
  const [selectedFeature, setSelectedFeature] = useState(savedFeatureNames[0]);

  // State for tracking touched fields
  const [touched, setTouched] = useState({
    monthRangePicker: false,
    compareForecastName: false,
  });

  // Handler for feature selection change
  const handleChange = (event: any) => {
    setCompareForecastOutputView((pre: any) => ({
      ...pre,
      showForecastOutput: false,
    }));
    setForecastSelectionError((pre) => ({
      ...pre,
      error: false,
      message: "",
    }));
    setSelectedFeature(event.target.value);
    forecastToCompareClearResponse();
  };

  // Handler for comparing forecasts
  const handleCompareForecast = () => {
    if (selectedForecastArray.length === 0) {
      setForecastSelectionError((pre) => ({
        ...pre,
        error: true,
        message: "Please select forecasts to compare",
      }));
    } else if (selectedForecastArray.length === 1) {
      setForecastSelectionError((pre) => ({
        ...pre,
        error: true,
        message: "At least 2 forecasts are needed for comparison.",
      }));
    } else {
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

  // Effect to check year error based on selected forecasts and duration
  useEffect(() => {
    if (
      new Date(duration.toMonth).getFullYear() === new Date().getFullYear() &&
      selectedForecastArray.length > 4
    ) {
      setYearError(true);
    } else if (
      new Date(duration.toMonth).getFullYear() ===
        new Date().getFullYear() + 1 &&
      selectedForecastArray.length > 2
    ) {
      setYearError(true);
    } else {
      setYearError(false);
    }
  }, [selectedForecastArray]);

  // Effect to handle forecast comparison response
  useEffect(() => {
    if (compareForecastDataApiResponse) {
      const forecastNames = Object.keys(
        compareForecastDataApiResponse?.data?.body
      );
      const forecastData = Object.values(
        compareForecastDataApiResponse?.data?.body
      );
      let firstForecastData = forecastData[0];
      forecastData.shift();
      let compareForecastData = forecastData;
      setCompareForecastOutputView((pre: any) => ({
        ...pre,
        showForecastOutput: true,
        firstForecastData,
        compareForecastData,
        forecastNames,
      }));
      setSnackbar((pre: any) => ({
        ...pre,
        open: true,
        severity: "success",
        message: "Forecasts compared successfully.",
      }));
    }
    if (errorFetchingCompareForecastData) {
      setSnackbar((pre: any) => ({
        ...pre,
        open: true,
        severity: "error",
        message: "Unable to fetch forecast data. Please try again.",
      }));
    }
  }, [errorFetchingCompareForecastData, compareForecastDataApiResponse]);

  const onSubmitForm = () => {
    setSelectedForecastArray(() => []);
    setForecastSelectionError((pre) => ({
      ...pre,
      error: false,
      message: "",
    }));
    forecastToCompareClearResponse();
    if (duration.fromMonth === "" || duration.toMonth === "") {
      setMonthRangeError((pre) => ({
        ...pre,
        error: true,
        message: "Please select duration.",
      }));
    } else if (!monthRangeError.error) {
      fetchForecastToCompare(
        {
          url: `${import.meta.env.VITE_API_BASE_URL}/all-forecast-names`,
          method: "POST",
          data: {
            // email: 'whta@novonordisk.com',
            duration: {
              fromMonth: duration.fromMonth,
              toMonth: duration.toMonth,
            },
            featureType: selectedFeature,
          },
          params: {
            match: "compare",
          },
        },
        true
      );
    }
  };

  // Function to calculate month difference between two dates
  const getMonthDifference = (startDate: any, endDate: any) => {
    var startYear = startDate.getFullYear();
    var startMonth = startDate.getMonth();
    var endYear = endDate.getFullYear();
    var endMonth = endDate.getMonth();

    // Calculate the difference in months
    var monthDifference =
      (endYear - startYear) * 12 + (endMonth - startMonth) + 1;

    return monthDifference;
  };

  // Effect to validate duration and update month range error
  useEffect(() => {
    setCompareForecastOutputView((pre: any) => ({
      ...pre,
      showForecastOutput: false,
    }));
    forecastToCompareClearResponse();
    var difference = getMonthDifference(
      new Date(duration.fromMonth),
      new Date(duration.toMonth)
    );
    if (difference <= 0) {
      setMonthRangeError((pre) => ({
        ...pre,
        error: true,
        message: "Please select valid duration.",
      }));
    } else if (difference > 24) {
      setMonthRangeError((pre) => ({
        ...pre,
        error: true,
        message: "Duration can't exceed 24 months.",
      }));
    } else {
      setMonthRangeError((pre) => ({
        ...pre,
        error: false,
        message: "",
      }));
    }
  }, [duration]);

  // Function to clear selected forecasts
  const onClearAll = () => {
    setSelectedForecastArray([]);
  };

  // Rendering the component
  return (
    <Box className=" min-h-screen bg-gray-100 p-3 space-y-4">
      <Grid
        container
        direction="column"
        justifyContent="left"
        alignItems="left"
      >
        <div className="pl-2">
          <Breadcrumbs aria-label="breadcrumb">
            <Link className="text-sky-800" to="/">
              Dashboard
            </Link>
            <Typography color="text.primary">Compare Forecasts</Typography>
          </Breadcrumbs>
        </div>
        <Box justifyContent="left" alignItems="left" className="pl-2">
          <h1 className="pt-4  text-xl">Compare Forecast</h1>
          <p className="text-gray-700 text-sm ">
            Forecasts can be compared with the similar primary data feature
          </p>
          <Box justifyContent="left" alignItems="left" marginTop="50px">
            <h3 className="mb-2 text-normal-700">
              Select Feature From Primary Data
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
          <Box
            justifyContent="left"
            alignItems="left"
            minWidth="45%"
            className="mt-6"
          >
            <h3 className=" text-normal-700">
              Select Duration
              <span className="text-md font-medium text-red-700 "> *</span>
            </h3>
            <MonthRangePicker
              isCompare={true}
              touched={touched.monthRangePicker}
              setTouched={setTouched}
              monthRangeError={monthRangeError}
              fromDate={dayjs(new Date())}
              fromDuration={duration.fromMonth}
              setDuration={setDuration}
            />
          </Box>
          <div className="mb-5 mt-10 w-full flex justify-start">
            {fetchingForecastToCompare ? (
              <CircularProgress />
            ) : (
              <Button onClick={onSubmitForm} variant="outlined">
                Proceed
              </Button>
            )}
          </div>
          {yearError &&
            (new Date(duration.toMonth).getFullYear() ===
            new Date().getFullYear() ? (
              <Box className="flex">
                <InfoIcon className="mt-2 text-blue-500" />
                <p className="p-1 text-lg  text-blue-500">
                  {" "}
                  For the current year max 4 forecasts can be compared.
                </p>
              </Box>
            ) : (
              <Box className="flex">
                <InfoIcon className="mt-2 text-blue-500" />
                <p className="p-1 text-lg  text-blue-500">
                  {" "}
                  For the next year max 2 forecasts can be compared.
                </p>
              </Box>
            ))}

          {errorFetchingForecastToCompare?.response?.status === 404 ? (
            <Box className="flex">
              <InfoIcon className="mt-2 text-blue-500" />
              <p className="p-1 text-lg  text-blue-500">
                {" "}
                No forecast was found for the duration. Please change the
                duration and try again.
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
                                firstForecastData: [],
                                compareForecastData: [],
                              }));

                              setForecastSelectionError((pre) => ({
                                ...pre,
                                error: false,
                                message: "",
                              }));
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
              <Box className="flex justify-end">
                <Button
                  disabled={yearError}
                  variant="contained"
                  onClick={handleCompareForecast}
                >
                  Compare Forecasts
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

export default CompareForecastInput; // Exporting CompareForecastInput component
