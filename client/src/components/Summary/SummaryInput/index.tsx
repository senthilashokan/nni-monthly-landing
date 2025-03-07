import { useContext, useEffect, useState } from "react";
import { useRequest } from "@src/hook/useRequest/useRequest";
import {
  Box,
  Grid,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Button,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import MonthRangePicker from "@src/UI/MonthRangePicker";
import { UserContext } from "@src/App";
import dayjs from "dayjs";

interface SummaryInputInterface {
  setSummaryOutputView: any;
  savedFeatureNames: string[];
}

const SummaryInput = (props: SummaryInputInterface) => {
  // Destructuring props
  const { setSummaryOutputView, savedFeatureNames } = props;

  // State variables
  const { setSnackbar } = useContext(UserContext);
  const [touched, setTouched] = useState({
    monthRangePicker: false,
    supportingVariable: false,
  });
  const [monthRangeError, setMonthRangeError] = useState<{
    error: boolean;
    message: string;
  }>({
    error: false,
    message: "",
  });
  const [duration, setDuration] = useState({
    fromMonth: `${new Date().getFullYear()}-01`,
    toMonth: "",
  });
  const [selectedFeatureName, setSelectedFeatureName] = useState<string>("");
  const [selectedPrimaryFeatureArray, setSelectedPrimaryFeatureArray] =
    useState<string[]>([]);
  const [primaryFeatureValueArray, setPrimaryFeatureValueArray] = useState<any>(
    []
  );
  const [secondarySelectedObject, setsecondarySelectedObject] = useState<any>(
    {}
  );

  // Custom hook for making API requests
  const [
    fetchForecastToCompare,
    fetchingForecastToCompare,
    errorFetchingForecastToCompare,
    forecastToCompareApiResponse,
    forecastToCompareClearResponse,
  ] = useRequest();

  const [
    fetchBudgetValues,
    fetchingBudgetValues,
    errorFetchingBudgetValues,
    budgetValuesApiResponse,
    budgetValuesClearResponse,
  ] = useRequest();

  const [
    fetchForecastTableData,
    fetchingForecastTableData,
    errorFetchingForecastTableData,
    forecastTableDataApiResponse,
    forecastTableDataClearResponse,
  ] = useRequest();

  //For Input Page
  useEffect(() => {
    // Handling forecast fetching errors
    if (errorFetchingForecastToCompare) {
      setPrimaryFeatureValueArray((prev: []) => [...prev, []]);
      setsecondarySelectedObject((prevState: any) => ({
        ...prevState,
        [selectedFeatureName]: [],
      }));
      setSnackbar((pre: any) => ({
        ...pre,
        open: true,
        severity: "error",
        message: `Unable to fetch forecast data for ${selectedFeatureName}. Please try again.`,
      }));
      forecastToCompareClearResponse();
    }
    if (forecastToCompareApiResponse?.status === 200) {
      setPrimaryFeatureValueArray((prev: []) => [
        ...prev,
        forecastToCompareApiResponse.data.body,
      ]);
      setsecondarySelectedObject((prevState: any) => ({
        ...prevState,
        [selectedFeatureName]: [],
      }));
      forecastToCompareClearResponse();
    }
  }, [forecastToCompareApiResponse, errorFetchingForecastToCompare]);

  //For Output Page
  useEffect(() => {
    // Handling errors for fetching forecast table data or budget values
    if (errorFetchingForecastTableData || errorFetchingBudgetValues) {
      setSnackbar((pre: any) => ({
        ...pre,
        open: true,
        severity: "error",
        message: `Unable to Create Summary. Please try again.`,
      }));
    }
    // If both forecast table data and budget values are available
    if (forecastTableDataApiResponse && budgetValuesApiResponse) {
      // Parsing and processing the budget values data
      const y: any = Object.values(
        JSON.parse(JSON.parse(budgetValuesApiResponse.data.body).response).data
      );
      let budgetValuesArray: any = [];
      y.map((budgetValue: any) => {
        let d = budgetValue
          .filter((entry: any) => {
            const date = new Date(entry[0]);
            return date.getFullYear() === new Date().getFullYear();
          })
          .map((entry: any) => entry.slice(2));
        budgetValuesArray.push(d.flat());
      });
      // Updating the summary output view with forecast data and budget values
      setSummaryOutputView((prevState: any) => ({
        ...prevState,
        ["forecastData"]: forecastTableDataApiResponse.data.body,
        ["isShowForecastOutput"]: true,
        ["budgetValues"]: budgetValuesArray,
      }));
    }
  }, [
    forecastTableDataApiResponse,
    errorFetchingForecastTableData,
    errorFetchingBudgetValues,
    budgetValuesApiResponse,
  ]);

  // Function to fetch available forecast data
  const getAvailableForecastData = async (featureName: string) => {
    await fetchForecastToCompare(
      {
        url: `${import.meta.env.VITE_API_BASE_URL}/all-forecast-names`,
        method: "POST",
        data: {
          duration: {
            fromMonth: duration.fromMonth,
            toMonth: duration.toMonth,
          },
          featureType: featureName,
        },
        params: { match: "summary" },
      },
      true
    );
  };

  // Function to handle clearing all selections
  const onClearAll = () => {
    setSelectedPrimaryFeatureArray([]);
    setPrimaryFeatureValueArray([]);
    setsecondarySelectedObject({});
    setSummaryOutputView({
      isShowForecastOutput: false,
      forecastData: {},
      budgetValues: [],
    });
  };

  // Function to check if an object is included in the secondary selected object
  const checkIncludeSecondarySelectedObject = (
    firstObject: any,
    firstArray: any
  ) => {
    // logic here
    let array1 = secondarySelectedObject[firstObject];

    if (!array1) {
      return false;
    } else if (
      array1.some(
        (item: any) => JSON.stringify(item) === JSON.stringify(firstArray)
      )
    ) {
      return true;
    } else {
      return false;
    }
  };

  // Function to handle forecast selection change
  const handleForecastSelectionChange = (keyName: string, value: any) => {
    const array1 = secondarySelectedObject[keyName];
    if (
      array1 &&
      array1.some((item: any) => JSON.stringify(item) === JSON.stringify(value))
    ) {
      let filterData = secondarySelectedObject[keyName].filter(
        (data: any) => JSON.stringify(data) !== JSON.stringify(value)
      );
      return setsecondarySelectedObject((prevStateData: any) => ({
        ...prevStateData,
        [keyName]: filterData,
      }));
    } else {
      if (array1.length == 2) {
        setSnackbar((pre: any) => ({
          ...pre,
          open: true,
          severity: "warning",
          message: `Can not select more than two forecast data for a single feature.`,
        }));
      } else {
        setsecondarySelectedObject((prevState: any) => ({
          ...prevState,
          [keyName]: [...prevState[keyName], value],
        }));
      }
    }
  };

  // Function to format payload for summary creation
  const formatPayloadForSummary = async () => {
    // Remove keys with empty arrays
    let filteredData = Object.keys(secondarySelectedObject)
      .filter((key) => secondarySelectedObject[key].length > 0)
      .reduce((obj: any, key) => {
        obj[key] = secondarySelectedObject[key];
        return obj;
      }, {});
    let filterDataKeys = Object.keys(filteredData);
    if (filterDataKeys.length) {
      fetchBudgetValues(
        {
          url: `${import.meta.env.VITE_API_BASE_URL}/approved-budget`,
          method: "POST",
          data: {
            Selected_account: filterDataKeys,
          },
        },
        true
      );
      fetchForecastTableData(
        {
          url: `${import.meta.env.VITE_API_BASE_URL}/summary-forecast`,
          method: "POST",
          data: filteredData,
        },
        true
      );
      forecastTableDataClearResponse();
      budgetValuesClearResponse();
    } else {
      setSnackbar((pre: any) => ({
        ...pre,
        open: true,
        severity: "info",
        message: "Need to select forecast for creating summary",
      }));
    }
  };

  //For handling Date Month Picker
  useEffect(() => {
    onClearAll();
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
      setSelectedPrimaryFeatureArray([]);
    } else if (difference > 24) {
      setMonthRangeError((pre) => ({
        ...pre,
        error: true,
        message: "Duration can't exceed 24 months.",
      }));
      setSelectedPrimaryFeatureArray([]);
    } else {
      setMonthRangeError((pre) => ({
        ...pre,
        error: false,
        message: "",
      }));
      setSelectedPrimaryFeatureArray([]);
    }
  }, [duration]);

  //For getting  month difference
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

  return (
    <Box className=" h-full p-3 space-y-4">
      {/* Month Year Year Range Container */}
      <Box
        justifyContent="left"
        alignItems="left"
        minWidth="45%"
        className="w-10"
      >
        <h3 className="pt-4 pl-2 text-normal-700">
          Select Duration
          <span className="text-md font-medium text-red-700 "> *</span>
        </h3>
        <MonthRangePicker
          isCompare={true}
          isSummary={true}
          touched={touched.monthRangePicker}
          setTouched={setTouched}
          monthRangeError={monthRangeError}
          fromDate={dayjs(new Date())}
          fromDuration={duration.fromMonth}
          setDuration={setDuration}
        />
      </Box>

      {/* Select Supporting Variables Container */}
      {!(
        monthRangeError.error ||
        !dayjs(duration.fromMonth).isValid() ||
        !dayjs(duration.toMonth).isValid()
      ) && (
        <Box>
          <Grid
            container
            direction="row"
            justifyContent="left"
            alignItems="left"
          >
            <Grid justifyContent="left" alignItems="left">
              <h3 className="pt-4 pl-2 text-normal-700">
                Select Account Group
                <span className="text-md font-medium text-red-700 mb-2">
                  {" "}
                  *
                </span>
              </h3>
            </Grid>

            <Grid justifyContent="left" alignItems="left">
              <p
                className="text-md underline cursor-pointer pt-4 ml-10"
                onClick={onClearAll}
              >
                Clear All
              </p>
            </Grid>
          </Grid>
          {/* Supporting Variables Grid */}
          <Box className="grid">
            {fetchingForecastToCompare ? (
              <CircularProgress key={2000} />
            ) : (
              <Grid container spacing={2} className="ml-2 gap-y-1">
                {savedFeatureNames.map((item, index) => {
                  return (
                    <Grid item xs={6} md={3} key={index}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            onClick={() => {
                              if (selectedPrimaryFeatureArray.includes(item)) {
                                let indexToRemove =
                                  selectedPrimaryFeatureArray.indexOf(item);
                                setSelectedPrimaryFeatureArray(
                                  (prevState: any) =>
                                    prevState.filter(
                                      (value: any) => value !== item
                                    )
                                );
                                setPrimaryFeatureValueArray((prevState: any) =>
                                  prevState.filter(
                                    (_: any, index: number) =>
                                      index !== indexToRemove
                                  )
                                );
                                setsecondarySelectedObject((prevState: any) => {
                                  const { [item]: _, ...newState } = prevState;
                                  return newState;
                                });
                              } else {
                                setSelectedFeatureName(item);
                                getAvailableForecastData(item);
                                setSelectedPrimaryFeatureArray(
                                  (prevState: any) => [...prevState, item]
                                );
                              }
                            }}
                            checked={selectedPrimaryFeatureArray.includes(item)}
                            disabled={
                              monthRangeError.error ||
                              !dayjs(duration.fromMonth).isValid() ||
                              !dayjs(duration.toMonth).isValid()
                            }
                          ></Checkbox>
                        }
                        label={item}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        </Box>
      )}
      {selectedPrimaryFeatureArray.length === 0 ? (
        <></>
      ) : (
        <Box>
          <Grid
            container
            direction="row"
            justifyContent="left"
            alignItems="left"
          >
            <Grid justifyContent="left" alignItems="left">
              <h3 className="pt-4 pl-2 text-base font-medium">
                Available Forecasts
                <span className="text-md font-medium text-red-700 mb-2">
                  {" "}
                  *
                </span>
              </h3>
            </Grid>
          </Grid>

          {fetchingForecastToCompare ? (
            <CircularProgress key={2000} />
          ) : (
            <Box className="grid">
              {selectedPrimaryFeatureArray.length <= 0 ? (
                <></>
              ) : (
                selectedPrimaryFeatureArray.map(
                  (selectedPrimaryFeature, selectedPrimaryFeatureIndex) => {
                    return (
                      <>
                        <h3 className="pt-4 pl-2 text-base font-medium text-[#1F67F4]">
                          {selectedPrimaryFeature}
                        </h3>
                        <Grid container spacing={2} className="ml-2 w-full">
                          {primaryFeatureValueArray[
                            selectedPrimaryFeatureIndex
                          ] &&
                          primaryFeatureValueArray[selectedPrimaryFeatureIndex]
                            .length > 0 ? (
                            primaryFeatureValueArray[
                              selectedPrimaryFeatureIndex
                            ].map(
                              (
                                primaryFeatureValue: any,
                                primaryFeatureIndex: number
                              ) => {
                                return (
                                  <Grid
                                    item
                                    xs={6}
                                    md={4}
                                    className=""
                                    key={primaryFeatureIndex}
                                  >
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          key={primaryFeatureIndex}
                                          onClick={() => {
                                            handleForecastSelectionChange(
                                              selectedPrimaryFeature,
                                              primaryFeatureValue
                                            );
                                          }}
                                          checked={checkIncludeSecondarySelectedObject(
                                            selectedPrimaryFeature,
                                            primaryFeatureValue
                                          )}
                                        ></Checkbox>
                                      }
                                      label={primaryFeatureValue.forecastName}
                                    />
                                  </Grid>
                                );
                              }
                            )
                          ) : (
                            <Box className="flex mt-4 ml-6">
                              <InfoIcon className="mt-1 text-blue-500" />
                              <p className="p-1 text-lg  text-blue-500">
                                {" "}
                                No forecast data available.
                              </p>
                            </Box>
                          )}
                        </Grid>
                      </>
                    );
                  }
                )
              )}
            </Box>
          )}
          <Box className="flex justify-center mt-4">
            {fetchingBudgetValues || fetchingForecastTableData ? (
              <CircularProgress key={2000} />
            ) : (
              <Button variant="contained" onClick={formatPayloadForSummary}>
                Create Summary
              </Button>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SummaryInput;
