import { useState, useEffect, useMemo, useContext } from "react";
import SupportingModal from "@src/UI/SupportingVariableInfoPopup";
import Grid from "@mui/material/Grid";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import BorderColorTwoToneIcon from "@mui/icons-material/BorderColorTwoTone";
import { useRequest } from "@src/hook/useRequest/useRequest";
import CircularProgress from "@mui/material/CircularProgress";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import {
  Box,
  Breadcrumbs,
  Typography,
  TextField,
  Select,
  FormControl,
  FormHelperText,
  MenuItem,
  Tooltip,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import IconButton from "@mui/material/IconButton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { ForecastInputValidation } from "@src/lib/validation";
import Button from "@mui/material/Button";
import MonthRangePicker from "@src/UI/MonthRangePicker";
import { Link } from "react-router-dom";
import { Context } from "@src/components/Dashboard/NewForecast";
import dayjs from "dayjs";
// Define the props for the component
interface NewForeCastInputForm {
  fileInputData: {
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
  };
  setFileInputView: any;
  setNewForecastOutputView: any;
  isCompareToggle: boolean;
  isCompareLoading: boolean;
  setSnackbar: any;
  compareSuportingVariablesArray: any;
  setCompareSuportingVariablesArray: any;
  addNewFlag: boolean;
  setAddNewFlag: any;
  errorFetchingCompareForecast: any;
  savePresetFlag: boolean;
  setSavePresetFlag: any;
}

const NewForecastInputForm = (props: NewForeCastInputForm) => {
  // Destructure props
  const {
    fileInputData,
    setFileInputView,
    setNewForecastOutputView,
    isCompareToggle,
    isCompareLoading,
    setSnackbar,
    compareSuportingVariablesArray,
    setCompareSuportingVariablesArray,
    addNewFlag,
    setAddNewFlag,
    errorFetchingCompareForecast,
    savePresetFlag,
    setSavePresetFlag,
  } = props;

  // State variables
  const [showModal, setShowModal] = useState(false);
  const [supportingVariablesArray, setSupportingVariablesArray] = useState<any>(
    fileInputData.suportingVariables ? fileInputData.suportingVariables : []
  );
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState("");
  const [monthRangeError, setMonthRangeError] = useState({ error: false });
  const [suppurtingVariableError, setSuppurtingVariableError] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string>(
    fileInputData.isUploadedFromDB
      ? fileInputData.df1.columns[0]
      : fileInputData.df1.columns[1]
  );
  const { toDate, setToDate, fromDate, setFromDate } = useContext(Context);
  const [touched, setTouched] = useState({
    monthRangePicker: false,
    supportingVariable: false,
  });
  const [selectedValues, setSelectedValues] = useState([]);
  const [forecastName, setForecastName] = useState("");

  const [selectedFeatureChanged, setSelectedFeatureChanged] = useState(false);
  const [oldSelectedForecast, setOldSelectedForecast] = useState("");

  // Custom hook for fetching supporting variables data
  const [
    fetchSupportingVariables,
    fetchingSupportingVariables,
    ,
    supportingVariablesData,
  ] = useRequest();

  // Custom hook for saving preset card data
  const [
    savePresetCardData,
    savePresetCardDataLoading,
    errorsavePresetCardData,
    presetCardData,
  ] = useRequest();

  // Function to clear all supporting variables
  const onClearAll = () => {
    if (
      fileInputData.forecastName !== undefined &&
      fileInputData.selectedFeature !== ""
    ) {
      setSupportingVariablesArray(
        fileInputData.suportingVariables ? fileInputData.suportingVariables : []
      );
    } else {
      setSupportingVariablesArray([]);
    }
  };

  // Function to open modal
  const openModal = () => {
    setShowModal(true);
  };

  // Function to close modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Function to handle save preset click
  const onSavePresetClick = () => {
    savePresetCardData(
      {
        url: `${import.meta.env.VITE_API_BASE_URL}/presets`,
        method: "POST",
        data: {
          isUploadedFromDb: fileInputData.isUploadedFromDB,
          featureListFromDbWithEndDates:
            fileInputData.featureListFromDbWithEndDates,
          createdOn: new Date().valueOf(),
          forecastName: fileInputData.forecastName
            ? fileInputData?.forecastName
            : forecastName,
          featureType: selectedFeature,
          duration: {
            fromMonth: `${fromDate?.toDate().getFullYear()}-${
              Number(fromDate?.toDate().getMonth()) + 1
            }`,
            toMonth: `${toDate?.toDate().getFullYear()}-${
              Number(toDate?.toDate().getMonth()) + 1
            }`,
          },
          primaryFileName: fileInputData?.primaryFileName,
          supportingFileName: fileInputData?.supportingFileName,
          df1: fileInputData.df1,
          df2: fileInputData.df2,
          supportingVariables: supportingVariablesArray,
          sliderValue:
            sliderValue === -1 ? fileInputData.sliderValue : sliderValue,
        },
      },
      true
    );
  };

  // React hook form
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    mode: "all",
    defaultValues: {
      name:
        fileInputData.forecastName !== undefined
          ? fileInputData.forecastName
          : "",
      feature: selectedFeature,
    },
    resolver: zodResolver(ForecastInputValidation),
  });

  // Function to check if two arrays are equal
  const arraysAreEqual = (array1: any[], array2: any[]) => {
    if (array1.length !== array2.length) return false;

    // Sort both arrays
    const lowerCaseArray1 = array1.map((item) =>
      typeof item === "string" ? item.toLowerCase() : item
    );
    const lowerCaseArray2 = array2.map((item) =>
      typeof item === "string" ? item.toLowerCase() : item
    );

    const sortedLowerCaseArray1 = lowerCaseArray1.slice().sort();
    const sortedLowerCaseArray2 = lowerCaseArray2.slice().sort();

    for (let i = 0; i < sortedLowerCaseArray1.length; i++) {
      if (sortedLowerCaseArray1[i] !== sortedLowerCaseArray2[i]) {
        return false;
      }
    }
    return true;
  };

  // Function to submit form
  const onSubmitForm = async (values: { name: any; feature: any }) => {
    if (!monthRangeError.error && !suppurtingVariableError) {
      if (isCompareToggle) {
        if (
          !compareSuportingVariablesArray.some((array: any[]) =>
            arraysAreEqual(array, supportingVariablesArray)
          )
        ) {
          setAddNewFlag(true);
          setCompareSuportingVariablesArray((pre: any) => [
            ...pre,
            supportingVariablesArray,
          ]);
          setNewForecastOutputView((pre: any) => ({
            ...pre,
            selected_values: supportingVariablesArray,
          }));
        } else {
          setSnackbar((pre: any) => ({
            ...pre,
            open: true,
            severity: "info",
            message: "Forecast with the supporting variables is already added.",
          }));
        }
      } else {
        const date = new Date();
        let newselectedYear = date.getFullYear();
        setSelectedValues(supportingVariablesArray);
        setNewForecastOutputView((pre: any) => ({
          ...pre,
          disableSaveForecast: false,
          showForecastOutput: true,
          forecastName: values.name,
          getDataFromDB: fileInputData.isUploadedFromDB,
          primaryFileName: fileInputData?.primaryFileName,
          vall:
            fileInputData?.selectedFeature !== ""
              ? fileInputData.selectedFeature
              : values.feature,
          selected_values: supportingVariablesArray,
          slider_value:
            sliderValue === -1 ? fileInputData.sliderValue : sliderValue,
          selectedYear: selectedYear !== "" ? selectedYear : newselectedYear,
        }));
      }
    }
  };

  // Effect to update supporting variable error
  useEffect(() => {
    if (supportingVariablesArray.length > 0) {
      setSuppurtingVariableError(false);
    }
  }, [supportingVariablesArray]);

  // Effect to update selected feature changed
  useEffect(() => {
    if (fileInputData.selectedFeature && !selectedFeatureChanged) {
      setOldSelectedForecast(fileInputData.forecastName);
      setSelectedFeatureChanged(true);
    }
  }, [selectedFeatureChanged]);

  // Effect to update supporting variables array when compare toggle changes
  useEffect(() => {
    if (isCompareToggle) {
      setCompareSuportingVariablesArray((pre: any) => [...pre, selectedValues]);
    } else if (
      !isCompareToggle &&
      compareSuportingVariablesArray.length !== 0
    ) {
      setSupportingVariablesArray(() => selectedValues);
      setCompareSuportingVariablesArray(() => []);
    }
  }, [isCompareToggle]);

  // Effect to handle preset card data and errors
  useEffect(() => {
    if (presetCardData) {
      setSnackbar({
        open: true,
        severity: "success",
        message: presetCardData?.data.body.message,
      });
      setSavePresetFlag(true);
    }
    if (errorsavePresetCardData) {
      setSnackbar((pre: any) => ({
        ...pre,
        open: true,
        severity: "error",
        message: "error",
      }));
      setSavePresetFlag(false);
    }
  }, [presetCardData, setSnackbar, errorsavePresetCardData]);

  // Function to perform pre-submit checks
  const preSubmitCheck = () => {
    if (
      toDate !== null &&
      sliderValue != null &&
      sliderValue > 0 &&
      sliderValue < 18
    ) {
      setMonthRangeError(() => ({ error: false }));
    }
    if (
      (sliderValue == null && toDate == null) ||
      (sliderValue != null && sliderValue < 1) ||
      (sliderValue != null && sliderValue > 18)
    ) {
      setMonthRangeError(() => ({ error: true }));
    }
    if (supportingVariablesArray.length === 0) {
      setSuppurtingVariableError(true);
    }
  };

  // Effect to update month range error
  useEffect(() => {
    if (
      touched.monthRangePicker &&
      (sliderValue == null || sliderValue < 1 || sliderValue > 18)
    ) {
      setMonthRangeError(() => ({ error: true }));
    } else if (sliderValue != null && sliderValue > 0 && sliderValue <= 18) {
      setMonthRangeError(() => ({ error: false }));
    }
  }, [sliderValue, touched]);

  // Effect to update from duration

  useMemo(() => {
    if (fileInputData.isUploadedFromDB) {
      let featureListFromDbWithEndDates: any =
        fileInputData.featureListFromDbWithEndDates;

      // Original date string
      const originalDateStr = featureListFromDbWithEndDates[selectedFeature];

      // Create a Date object from the date string
      const originalDate = new Date(originalDateStr);

      // Create a new Date object for manipulation
      const newDate = new Date(originalDate);

      // Increment the month by one
      newDate.setMonth(newDate.getMonth() + 1);

      // Convert the new date back to ISO string format
      // const newDateStr = newDate.toISOString();
      setFromDate(dayjs(newDate));
      // setFromDuration(dayjs(newDate));
    } else {
      const columnIndex = fileInputData?.df1.columns.indexOf(selectedFeature);
      const data = fileInputData.df1.data;
      let lastAvilableData = data[data.length - 1];
      if (columnIndex > 0) {
        if (
          lastAvilableData[columnIndex] != undefined ||
          lastAvilableData[columnIndex] != null
        ) {
          // Original date string
          const originalDateStr = lastAvilableData[0];

          // Create a Date object from the date string
          const originalDate = new Date(originalDateStr);

          // Create a new Date object for manipulation
          const newDate = new Date(originalDate);

          // Increment the month by one
          newDate.setMonth(newDate.getMonth() + 1);

          // Convert the new date back to ISO string format
          const newDateStr = newDate.toISOString();
          setFromDate(dayjs(newDateStr));
          // setFromDuration(dayjs(newDateStr));
        } else {
          let tempIndex = data.length - 1;
          while (tempIndex > -1) {
            let Slast = data[tempIndex];
            if (Slast[columnIndex] == undefined || Slast[columnIndex] == null) {
              lastAvilableData = Slast;
              tempIndex--;
            } else {
              break;
            }
          }
          setFromDate(dayjs(lastAvilableData[0]));
        }
      }
    }
  }, [selectedFeature]);

  // Function to get supporting variables
  const getSupportingVaribles = (featureName: string) => {
    setSelectedFeature(featureName);
    fetchSupportingVariables(
      {
        url: `${
          import.meta.env.VITE_API_BASE_URL
        }/supporting-variables/${featureName.replace(/ /g, "")}`,
      },
      true
    );
  };

  // Effect to fetch supporting variables data
  useEffect(() => {
    if (fileInputData?.selectedFeature !== "") {
      getSupportingVaribles(fileInputData.selectedFeature);
    } else {
      fileInputData.isUploadedFromDB
        ? getSupportingVaribles(fileInputData.df1.columns[0])
        : getSupportingVaribles(fileInputData.df1.columns[1]);
    }
  }, []);

  // Memoized variables for supporting variables data
  const { supportingVariables, supportingVariablesDesc } = useMemo(() => {
    let supportingVariables;
    let supportingVariablesDesc;
    if (supportingVariablesData) {
      supportingVariables = Object.keys(
        JSON.parse(supportingVariablesData.data.body)
      );
      supportingVariablesDesc = JSON.parse(supportingVariablesData.data.body);
    }

    return { supportingVariables, supportingVariablesDesc };
  }, [supportingVariablesData]);

  // Function to handle edit file
  const onEditFile = () => {
    setFileInputView((preState: any) => ({
      ...preState,
      forecastName: undefined,
      selectedFeature: "",
      suportingVariables: [],
      showFileInputForm: true,
    }));
    setToDate(null);
    setNewForecastOutputView((preState: any) => ({
      ...preState,
      showForecastOutput: false,
    }));
  };

  // Effect to update save preset flag
  useEffect(() => {
    setSavePresetFlag(true);
  }, [
    fileInputData.forecastName,
    fileInputData.selectedFeature,
    supportingVariablesArray,
    toDate,
  ]);

  // Effect to handle error fetching compare forecast
  useEffect(() => {
    if (errorFetchingCompareForecast) {
      setSupportingVariablesArray((prevArray: any) => [...prevArray, "error"]);
      setSupportingVariablesArray((prevArray: any) => prevArray.slice(0, -1));
    }
  }, [errorFetchingCompareForecast]);

  // Render component
  return (
    <Box className=" h-full bg-gray-100 p-3 space-y-4">
      <Grid
        container
        direction="column"
        justifyContent="left"
        alignItems="left"
      >
        {showModal && (
          <SupportingModal
            closeModal={closeModal}
            showModal={showModal}
            supportingVariablesDesc={supportingVariablesDesc}
          />
        )}
        <div className="pl-2">
          <Breadcrumbs aria-label="breadcrumb">
            {selectedFeatureChanged ? (
              <Link className="text-sky-800" to="/savedpreset">
                Saved Preset
              </Link>
            ) : (
              <Link className="text-sky-800" to="/">
                Dashboard
              </Link>
            )}
            {selectedFeatureChanged ? (
              <Typography color="text.primary">
                {oldSelectedForecast}
              </Typography>
            ) : (
              <Typography color="text.primary">New forecast</Typography>
            )}
          </Breadcrumbs>
        </div>

        <Box justifyContent="left" alignItems="left">
          <Box className="flex items-end ">
            {fileInputData.isUploadedFromDB ? (
              <Tooltip title="File data uploaded from database">
                <CloudUploadOutlinedIcon />
              </Tooltip>
            ) : (
              <Tooltip title="File data uploaded locally">
                <DriveFolderUploadOutlinedIcon />
              </Tooltip>
            )}
            {selectedFeatureChanged ? (
              <h1 className="pt-4  text-xl ml-2 mr-4">
                {oldSelectedForecast}{" "}
              </h1>
            ) : (
              <h1 className="pt-4  text-xl ml-2 mr-4">New Forecast </h1>
            )}
          </Box>
          <p className="text-gray-700 text-sm ">
            This tool optimises forecasts based on Mean Absolute Percentage
            Error
          </p>
        </Box>
        <Box className="flex">
          <Box className="mr-16">
            <h6 className="pt-4 ">Primary Forecast File</h6>

            <p className="text-xs text-green-600">
              {fileInputData?.primaryFileName}
            </p>
          </Box>
          {!fileInputData.isUploadedFromDB && (
            <Box className="mr-4">
              <h6 className="pt-4 ">Supporting Variable File</h6>
              <p className="text-xs text-green-600">
                {fileInputData?.supportingFileName}
              </p>
            </Box>
          )}
          <Box>
            <Tooltip title="Edit Files">
              <IconButton
                disabled={isCompareToggle}
                onClick={() => {
                  onEditFile();
                }}
              >
                <BorderColorTwoToneIcon className="pt-2 mt-1" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <form
          onSubmit={handleSubmit(onSubmitForm)}
          className="w-full space-y-3"
        >
          <Box justifyContent="left" alignItems="left" marginTop="10px">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <>
                  {" "}
                  <h3 className="  mb-1 text-normal-700">
                    Forecast Name
                    <span className="text-md font-medium text-red-700 mb-2">
                      {" "}
                      *
                    </span>
                  </h3>{" "}
                  <TextField
                    error={!!errors.name}
                    disabled={isCompareToggle}
                    fullWidth
                    id="outlined-basic"
                    label=""
                    type="text"
                    variant="outlined"
                    placeholder="Please name your forecast"
                    helperText={errors.name?.message?.toString()}
                    {...field}
                    value={
                      fileInputData.forecastName && fileInputData.forecastName
                    }
                    onChange={(e) => {
                      // onClearAll();
                      field.onChange(e);
                      setForecastName(e.target.value);
                      fileInputData.forecastName = e.target.value;
                    }}
                  />
                </>
              )}
            />
          </Box>
          <Box justifyContent="left" alignItems="left">
            <h3 className="mb-2 text-normal-700">
              Select Feature From Primary Data
              <span className="text-md font-medium text-red-700 mb-2"> *</span>
            </h3>
            <Controller
              name="feature"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.feature}>
                  <Select
                    {...field}
                    labelId="feature"
                    disabled={isCompareToggle}
                    id="feature"
                    variant="outlined"
                    placeholder="Please select a feature"
                    onChange={(e) => {
                      // onClearAll();
                      field.onChange(e);
                      getSupportingVaribles(e.target.value);
                      fileInputData.selectedFeature = e.target.value;
                      setSupportingVariablesArray([]);
                    }}
                    fullWidth
                    value={
                      fileInputData.selectedFeature
                        ? fileInputData.selectedFeature
                        : selectedFeature
                    }
                  >
                    {fileInputData.isUploadedFromDB
                      ? fileInputData.df1.columns.map((name: any) => (
                          <MenuItem key={name} value={name}>
                            {name}
                          </MenuItem>
                        ))
                      : fileInputData.df1.columns
                          .slice(1, fileInputData.df1.columns.length)
                          .map((name: any) => (
                            <MenuItem key={name} value={name}>
                              {name}
                            </MenuItem>
                          ))}
                  </Select>
                  {errors.feature && (
                    <FormHelperText>{errors.feature.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Box>
          <Box justifyContent="left" alignItems="left" minWidth="45%">
            <h3 className=" text-normal-700">
              Select Duration
              <span className="text-md font-medium text-red-700 "> *</span>
            </h3>
            <MonthRangePicker
              isCompareToggle={isCompareToggle}
              touched={touched}
              setTouched={setTouched}
              monthRangeError={monthRangeError}
              sliderValue={sliderValue}
              setSliderValue={setSliderValue}
              setSelectedYear={setSelectedYear}
            />
          </Box>
          <Grid
            container
            direction="row"
            justifyContent="left"
            alignItems="left"
          >
            <Grid justifyContent="left" alignItems="left">
              <h3 className="pt-4 pl-2">
                Select Supporting Variables
                <span className="text-md font-medium text-red-700 mb-2">
                  {" "}
                  *
                </span>
              </h3>

              {suppurtingVariableError &&
                supportingVariablesArray.length === 0 && (
                  <p className="text-red-500 text-[13px] ml-3  ">
                    Please select supporting variable.
                  </p>
                )}
            </Grid>
            <Grid minWidth="25%">
              <Tooltip title="Supporting Variables Info">
                <IconButton onClick={openModal}>
                  <InfoOutlinedIcon className="pt-2 mt-1" />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid justifyContent="left" alignItems="left">
              <p
                className="text-sm underline cursor-pointer pt-4"
                onClick={onClearAll}
              >
                Clear All
              </p>
            </Grid>
          </Grid>

          {fetchingSupportingVariables ? (
            <Box className="w-full flex justify-center">
              <CircularProgress />
            </Box>
          ) : (
            <Grid container padding={1} spacing={0}>
              {supportingVariables?.map((variableName, key) => {
                return (
                  <Grid
                    className="[&_span]:text-[13px]"
                    key={key}
                    item
                    xs={12}
                    sm={6}
                    md={4}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          onClick={() => {
                            if (
                              supportingVariablesArray.includes(variableName)
                            ) {
                              setSupportingVariablesArray((prevState: any) =>
                                prevState.filter(
                                  (value: any) => value !== variableName
                                )
                              );
                            } else {
                              setSupportingVariablesArray((prevState: any) => [
                                ...prevState,
                                variableName,
                              ]);
                            }
                          }}
                          checked={supportingVariablesArray.includes(
                            variableName
                          )}
                          disabled={isCompareToggle ? addNewFlag : false}
                        />
                      }
                      label={variableName.replace("_", " ")}
                    />
                  </Grid>
                );
              })}
            </Grid>
          )}

          <Grid container className="flex justify-end">
            <Grid item className="contents " sm={12} md={4}>
              <Box className="mr-5 ">
                {savePresetCardDataLoading ? (
                  <CircularProgress size={24} className="mr-4" />
                ) : (
                  <Button
                    variant="outlined"
                    className="mr-5"
                    onClick={onSavePresetClick}
                    disabled={savePresetFlag}
                  >
                    Save Preset{" "}
                  </Button>
                )}
              </Box>
            </Grid>

            <Grid item className="contents " sm={12} md={6}>
              {isCompareLoading ? (
                <Box className="min-w-40 ">
                  <CircularProgress />
                </Box>
              ) : (
                <Button
                  variant="contained"
                  type="submit"
                  onClick={preSubmitCheck}
                  disabled={isCompareToggle ? addNewFlag : false}
                >
                  {isCompareToggle ? "Create and Add" : "Create Forecast"}
                </Button>
              )}
            </Grid>
          </Grid>
        </form>
      </Grid>
    </Box>
  );
};
export default NewForecastInputForm;
