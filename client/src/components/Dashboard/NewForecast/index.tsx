import { createContext, useState, useEffect, useMemo } from "react";
import FileInputForm from "./FileInputForm";
import NewForecastInputForm from "./NewForecastInputForm";
import NewForecastOutput from "./NewForecastOutput";
import Chart from "@src/assets/images/LineChart.png";
import { Box, Grid } from "@mui/material";
import { useRequest } from "@src/hook/useRequest/useRequest";
import CircularProgress from "@mui/material/CircularProgress";
import NotFound from "@src/assets/images/404.png";
import dayjs, { Dayjs } from "dayjs";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useLocation } from "react-router-dom";

// Defining ContextType for context
interface ContextType {
  toDate: any;
  fromDate: any;
  setFromDate: (data: Dayjs | null) => void;
  setToDate: (date: Dayjs | null) => void;
}

const initialDate: Dayjs | null = null;
// Creating context
export const Context = createContext<ContextType>({
  toDate: initialDate,
  fromDate: initialDate,
  setFromDate: () => {},
  setToDate: () => {},
});

const NewForecast = () => {
  // State variables
  const [toDate, setToDate] = useState<dayjs.Dayjs | null>(initialDate);
  const [fromDate, setFromDate] = useState<dayjs.Dayjs | null>(initialDate);
  const [isCompareToggle, setIsCompareToggle] = useState(false);
  const [compareSuportingVariablesArray, setCompareSuportingVariablesArray] =
    useState<any>([]);
  const [addNewFlag, setAddNewFlag] = useState(true);
  const [savePresetFlag, setSavePresetFlag] = useState(true);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    severity: any;
    message: string;
  }>({
    open: false,
    severity: "",
    message: "",
  });

  // Location hook to access route state
  const location = useLocation();
  const savedData = location.state?.savedData;

  // State for file input view
  const [fileInputView, setFileInputView] = useState<{
    showFileInputForm: boolean;
    isUploadedFromDB: boolean;
    featureListFromDbWithEndDates: Object;
    primaryFileName: string;
    supportingFileName: string;
    df1: any;
    df2: any;
    forecastName: any;
    selectedFeature: string;
    suportingVariables: any;
    sliderValue: number;
  }>({
    showFileInputForm: true,
    isUploadedFromDB: false,
    featureListFromDbWithEndDates: {},
    primaryFileName: "",
    supportingFileName: "",
    df1: { coumns: [], index: [], value: [] },
    df2: { coumns: [], index: [], value: [] },
    forecastName: undefined,
    selectedFeature: "",
    suportingVariables: [],
    sliderValue: 0,
  });

  // State for new forecast output view
  const [newForecastOutputView, setNewForecastOutputView] = useState({
    showForecastOutput: false,
    saveForecast: false,
    disableSaveForecast: true,
    selectedForecastSupportingVariables: [],
    newData: [],
    getDataFromDB: false,
    primaryFileName: "",
    forecastName: "",
    vall: "",
    selected_values: [],
    slider_value: null,
    selectedYear: "",
  });

  // Custom hook for making API requests
  const [
    fetchNewForecast,
    fetchingNewForcast,
    errorFetchingNewForecast,
    forecastApiData,
  ] = useRequest();
  const [
    fetchCompareForecast,
    fetchingCompareForcast,
    errorFetchingCompareForecast,
    compareForecastApiResponse,
    resetCompareData,
  ] = useRequest();
  const [
    saveForecast,
    saveingNewForcast,
    errorSaveingNewForecast,
    savedForecastData,
  ] = useRequest();

  // Memoizing API input data
  const { apiInputData } = useMemo(() => {
    let apiInputData = {
      getDataFromDB: false,
      primaryFileName: "",
      df1: "",
      df2: "",
      vall: "",
      selected_values: [],
      slider_value: null,
    };
    if (newForecastOutputView.showForecastOutput) {
      apiInputData["getDataFromDB"] = newForecastOutputView.getDataFromDB;
      apiInputData["primaryFileName"] = newForecastOutputView.primaryFileName;
      apiInputData["df1"] = JSON.stringify(fileInputView.df1);
      apiInputData["df2"] = JSON.stringify(fileInputView.df2);
      apiInputData["vall"] = newForecastOutputView.vall;
      apiInputData["selected_values"] = newForecastOutputView.selected_values;
      apiInputData["slider_value"] = newForecastOutputView.slider_value;
    }

    return { apiInputData };
  }, [
    newForecastOutputView.getDataFromDB,
    newForecastOutputView.primaryFileName,
    newForecastOutputView.showForecastOutput,
    newForecastOutputView.vall,
    newForecastOutputView.selected_values,
    newForecastOutputView.slider_value,
    fileInputView,
  ]);

  // Effect to fetch new forecast data
  useEffect(() => {
    if (apiInputData.vall !== "" && !isCompareToggle) {
      fetchNewForecast(
        {
          url: `${import.meta.env.VITE_API_BASE_URL}/forecast`,
          method: "POST",
          data: apiInputData,
        },
        true
      );
    }
  }, [apiInputData]);

  // Memoizing refined response data
  const { refinedResponse } = useMemo(() => {
    const refinedResponse: any = [];

    if (forecastApiData) {
      let tempRes = JSON.parse(forecastApiData.data.body);
      JSON.parse(tempRes.response).data.forEach((row: any) => {
        let temp = {
          MONTH: "",
          ACTUAL: 0,
          FORECAST: 0,
        };
        temp.MONTH = row[0];
        temp.ACTUAL = row[1];
        temp.FORECAST = row[2];
        refinedResponse.push(temp);
      });
      setSnackbar((pre) => ({
        ...pre,
        open: true,
        severity: "success",
        message: "Forecast has been successfully created.",
      }));
      setSavePresetFlag(false);
    }
    return {
      refinedResponse,
    };
  }, [forecastApiData]);

  // Memoizing save forecast input data
  const { saveForecastInputData } = useMemo(() => {
    let saveForecastInputData: any = {
      isUploadedFromDb: false,
      createdOn: 0,
      primaryFileName: "",
      supportingFileName: "",
      forecastName: "",
      featureType: "",
      duration: { fromMonth: dayjs.Dayjs, toMonth: dayjs.Dayjs },
      supportingVariables: [],
      apiResponseData: [],
    };

    if (fileInputView && newForecastOutputView && refinedResponse) {
      saveForecastInputData.isUploadedFromDb = fileInputView.isUploadedFromDB;
      saveForecastInputData.createdOn = new Date().valueOf();
      saveForecastInputData.primaryFileName = fileInputView.primaryFileName;
      saveForecastInputData.supportingFileName =
        fileInputView.supportingFileName;
      saveForecastInputData.forecastName = newForecastOutputView.forecastName;
      saveForecastInputData.featureType = newForecastOutputView.vall;
      saveForecastInputData.duration.fromMonth = `${fromDate
        ?.toDate()
        .getFullYear()}-${Number(fromDate?.toDate().getMonth()) + 1}`;
      saveForecastInputData.duration.toMonth = `${toDate
        ?.toDate()
        .getFullYear()}-${Number(toDate?.toDate().getMonth()) + 1}`;
      saveForecastInputData.supportingVariables = isCompareToggle
        ? newForecastOutputView.selectedForecastSupportingVariables
        : newForecastOutputView.selected_values;
      saveForecastInputData.apiResponseData = isCompareToggle
        ? newForecastOutputView.newData
        : refinedResponse;
    }
    return { saveForecastInputData };
  }, [fileInputView, newForecastOutputView, refinedResponse, toDate]);

  // Effect to save forecast data
  useEffect(() => {
    if (newForecastOutputView.saveForecast) {
      saveForecast(
        {
          url: `${import.meta.env.VITE_API_BASE_URL}/save`,
          method: "POST",
          data: saveForecastInputData,
        },
        true
      );
      setNewForecastOutputView((pre) => ({ ...pre, saveForecast: false }));
    }
  }, [newForecastOutputView, saveForecastInputData, fileInputView]);

  // Effect to handle saved forecast data
  useEffect(() => {
    if (savedForecastData) {
      setSnackbar((pre) => ({
        ...pre,
        open: true,
        severity: "success",
        message: savedForecastData.data.body.message,
      }));
    }
    if (errorSaveingNewForecast) {
      setSnackbar((pre) => ({
        ...pre,
        open: true,
        severity: "error",
        message: "error",
      }));
    }
  }, [savedForecastData, errorSaveingNewForecast]);

  // Effect to handle saved data from route state
  useEffect(() => {
    if (savedData) {
      const {
        df1,
        df2,
        primary_file_name,
        supporting_file_name,
        forecast_name,
        feature_type,
        supporting_variables,
        duration,
        slider_value,
        isUploadedFromDb,
        featureListFromDbWithEndDates,
      } = savedData;
      setFileInputView((prevState) => ({
        ...prevState,
        df1: df1,
        df2: df2,
        primaryFileName: primary_file_name,
        supportingFileName: supporting_file_name,
        forecastName: forecast_name,
        selectedFeature: feature_type,
        showFileInputForm: false,
        suportingVariables: supporting_variables,
        sliderValue: slider_value,
        isUploadedFromDB: isUploadedFromDb,
        featureListFromDbWithEndDates: featureListFromDbWithEndDates,
      }));
      setFromDate(dayjs(duration.fromMonth));
      setToDate(dayjs(duration.toMonth));
    }
  }, [savedData]);

  // Effect to fetch compare forecast data
  useEffect(() => {
    if (isCompareToggle) {
      fetchCompareForecast(
        {
          url: `${import.meta.env.VITE_API_BASE_URL}/compare`,
          method: "POST",
          data: apiInputData,
        },
        true
      );
    }
  }, [apiInputData]);

  // Effect to reset compare forecast data
  useEffect(() => {
    if (!isCompareToggle) {
      resetCompareData();
    }
  }, [isCompareToggle]);

  // Effect to handle error when fetching compare forecast data
  useEffect(() => {
    if (errorFetchingCompareForecast) {
      setSnackbar((pre) => ({
        ...pre,
        open: true,
        severity: "error",
        message: "Unable to fetch data to Compare Forecast . Please try again.",
      }));
      setCompareSuportingVariablesArray((prevArray: string | any[]) =>
        prevArray.slice(0, -1)
      );
    }
  }, [errorFetchingCompareForecast]);

  // Memoizing compare forecast data
  const { compareForecastData } = useMemo(() => {
    let compareForecastData;
    if (compareForecastApiResponse) {
      compareForecastData = JSON.parse(compareForecastApiResponse?.data.body);
      setSnackbar((pre) => ({
        ...pre,
        open: true,
        severity: "success",
        message: "A new forecast has been added for comparison",
      }));
    }
    return { compareForecastData };
  }, [compareForecastApiResponse]);

  // Effect to handle error when fetching new forecast data
  useEffect(() => {
    if (errorFetchingNewForecast) {
      setSnackbar((pre) => ({
        ...pre,
        open: true,
        severity: "error",
        message: "Unable to fetch forecast data. Please try again..",
      }));
      setSavePresetFlag(true);
    }
  }, [errorFetchingNewForecast]);

  // Return JSX
  return (
    <Context.Provider value={{ toDate, fromDate, setFromDate, setToDate }}>
      <Box className="newForecastContainer min-h-screen">
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((pre) => ({ ...pre, open: false }))}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar((pre) => ({ ...pre, open: false }))}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
        <Grid container className="">
          <Grid item className=" " sm={12} md={4}>
            {fileInputView.showFileInputForm ? (
              <FileInputForm setFileInputView={setFileInputView} />
            ) : (
              <NewForecastInputForm
                fileInputData={fileInputView}
                setFileInputView={setFileInputView}
                setNewForecastOutputView={setNewForecastOutputView}
                isCompareToggle={isCompareToggle}
                isCompareLoading={fetchingCompareForcast}
                setSnackbar={setSnackbar}
                compareSuportingVariablesArray={compareSuportingVariablesArray}
                setCompareSuportingVariablesArray={
                  setCompareSuportingVariablesArray
                }
                setAddNewFlag={setAddNewFlag}
                addNewFlag={addNewFlag}
                errorFetchingCompareForecast={errorFetchingCompareForecast}
                savePresetFlag={savePresetFlag}
                setSavePresetFlag={setSavePresetFlag}
              />
            )}
          </Grid>
          <Grid item className=" " sm={12} md={8}>
            {newForecastOutputView.showForecastOutput ? (
              fetchingNewForcast || Object.keys(apiInputData).length === 0 ? (
                <Box className="min-h-screen flex justify-center items-center">
                  <CircularProgress />
                </Box>
              ) : errorFetchingNewForecast ? (
                <div className="">
                  <img className="  " src={NotFound} alt="Logo" />{" "}
                </div>
              ) : refinedResponse.length === 0 ? (
                <Box className="min-h-screen flex justify-center items-center">
                  <CircularProgress />
                </Box>
              ) : (
                <NewForecastOutput
                  apiData={refinedResponse}
                  newForecastOutputView={newForecastOutputView}
                  setNewForecastOutputView={setNewForecastOutputView}
                  saveingNewForcast={saveingNewForcast}
                  setIsCompareToggle={setIsCompareToggle}
                  isCompareToggle={isCompareToggle}
                  isCompareLoading={fetchingCompareForcast}
                  selectedYear={newForecastOutputView.selectedYear}
                  forecastName={newForecastOutputView.forecastName}
                  compareForecastData={compareForecastData}
                  compareSuportingVariablesArray={
                    compareSuportingVariablesArray
                  }
                  addNewFlag={addNewFlag}
                  setAddNewFlag={setAddNewFlag}
                />
              )
            ) : (
              <div className="min-h-screen flex items-center justify-center">
                <img className="  " src={Chart} alt="Logo" />{" "}
              </div>
            )}
          </Grid>
        </Grid>
      </Box>
    </Context.Provider>
  );
};

export { NewForecast };
export default NewForecast;
