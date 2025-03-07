import {
  Box,
  Breadcrumbs,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Slider,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { Controller, useForm } from "react-hook-form";
import { ForecastInputValidationNbrx } from "@src/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useContext, useEffect, useState } from "react";
import BorderColorTwoToneIcon from "@mui/icons-material/BorderColorTwoTone";
import { useRequest } from "@src/hook/useRequest/useRequest";
import Loader from "@src/UI/Loader";
import { UserContext } from "@src/App";

const NewForecastInputForm = (props: any) => {
  const { setInputView, setOutputView, inputView, outputView, createForecast } =
    props;
  // Accessing context for handling snackbar messages
  const { setSnackbar } = useContext(UserContext);
  const [
    fetchNbrxModelNames,
    fetchingNbrxModelNames,
    errorFetchingNbrxModelNames,
    nbrxForecastAPIResponse,
  ] = useRequest();
  // const nbrxForecastAPIResponse = ["darts", "prophet", "unbounded"];
  const [boundsMaxValue, setBoundsMaxValue] = useState(80000);

  // React hook form
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    clearErrors,
  } = useForm({
    mode: "all",
    defaultValues: {
      name: "",
      product: "",
      model: "",
    },
    resolver: zodResolver(ForecastInputValidationNbrx),
  });

  useEffect(() => {
    if (inputView.isCompareToggle) {
      setValue("model", "");
      clearErrors();
    } else {
      setValue("model", inputView.inputData.model_type);
      clearErrors();
    }
  }, [inputView.isCompareToggle]);

  useEffect(() => {
    fetchNbrxModelNames(
      {
        url: `https://pkndypm8t4.execute-api.us-east-1.amazonaws.com/dev/nbrx-models`,
      },
      true
    );
  }, []);

  useEffect(() => {
    if (errorFetchingNbrxModelNames) {
      onEditFileClick();
      setSnackbar((pre: any) => ({
        ...pre,
        open: true,
        severity: "error",
        message: `Error fetching model names. Please try again.`,
      }));
    }
  }, [errorFetchingNbrxModelNames]);

  const onSubmitForm = () => {
    createForecast();
  };

  const resetOutput = () => {
    setOutputView(() => ({
      showOutput: false,
      outputData: {},
      outputDataForCompare: {
        NbrxHistoryArray: [],
        NbrxForecasts: [],
        ModelNames: [],
        ModelTypes: [],
        BoundsArray: [],
      },
    }));
  };

  const onEditFileClick = () => {
    setInputView(() => ({
      showFileInput: true,
      inputData: {
        getDataFromDB: false,
        primaryFileName: "",
        secondaryFileName: "",
        history_trx_df: "",
        history_nbrx_df: "",
        forecastName: "",
        product: "",
        bounds: [0, 0],
        model_type: "",
      },
    }));
    resetOutput();
  };

  const handleBoundsChange = (
    _: Event,
    newValue: number | number[],
    activeThumb: number
  ) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    if (activeThumb === 0) {
      inputView.isCompareToggle
        ? setInputView((pre: any) => ({
            ...pre,
            inputDataCompareToggle: {
              ...pre.inputDataCompareToggle,
              bounds: [
                Math.min(
                  newValue[0],
                  inputView.inputDataCompareToggle.bounds[1] - 0
                ),
                inputView.inputDataCompareToggle.bounds[1],
              ],
            },
          }))
        : setInputView((pre: any) => ({
            ...pre,
            inputData: {
              ...pre.inputData,
              bounds: [
                Math.min(newValue[0], inputView.inputData.bounds[1] - 0),
                inputView.inputData.bounds[1],
              ],
            },
          }));
    } else {
      inputView.isCompareToggle
        ? setInputView((pre: any) => ({
            ...pre,
            inputDataCompareToggle: {
              ...pre.inputDataCompareToggle,
              bounds: [
                inputView.inputDataCompareToggle.bounds[0],
                Math.max(
                  newValue[1],
                  inputView.inputDataCompareToggle.bounds[0] + 0
                ),
              ],
            },
          }))
        : setInputView((pre: any) => ({
            ...pre,
            inputData: {
              ...pre.inputData,
              bounds: [
                inputView.inputData.bounds[0],
                Math.max(newValue[1], inputView.inputData.bounds[0] + 0),
              ],
            },
          }));
    }
  };
  return (
    <Box className=" h-full bg-gray-100 p-3 space-y-4">
      <Grid
        container
        direction="column"
        justifyContent="left"
        alignItems="left"
      >
        <Box className="pl-2">
          <Breadcrumbs aria-label="breadcrumb">
            <Link className="text-sky-800" to="/">
              Dashboard
            </Link>

            <Typography color="text.primary">New forecast</Typography>
          </Breadcrumbs>
        </Box>

        <Box justifyContent="left" alignItems="left">
          <Box className="flex items-end ">
            {inputView.getDataFromDB ? (
              <Tooltip title="File data uploaded from database">
                <CloudUploadOutlinedIcon />
              </Tooltip>
            ) : (
              <Tooltip title="File data uploaded locally">
                <DriveFolderUploadOutlinedIcon />
              </Tooltip>
            )}
            <h1 className="pt-4  text-xl ml-2 mr-4">New Forecast </h1>
          </Box>
          <p className="text-gray-700 text-sm ">NBRx/Trx</p>
        </Box>
        <Box className="flex">
          <Box className="mr-16">
            <h6 className="pt-4 ">Primary Forecast File</h6>

            <p className="text-xs text-green-600">
              {inputView.inputData.primaryFileName}
            </p>
          </Box>
          {!inputView.inputData.isUploadedFromDB && (
            <Box className="mr-4">
              <h6 className="pt-4 ">Supporting Variable File</h6>
              <p className="text-xs text-green-600">
                {inputView.inputData.secondaryFileName}
              </p>
            </Box>
          )}
          <Box>
            <Tooltip title="Edit Files">
              <IconButton
                disabled={inputView.isCompareToggle}
                onClick={() => {
                  onEditFileClick();
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
                    disabled={inputView.isCompareToggle}
                    fullWidth
                    id="outlined-basic"
                    label=""
                    type="text"
                    variant="outlined"
                    placeholder="Please name your forecast"
                    helperText={errors.name?.message?.toString()}
                    {...field}
                    // defaultValue={field.name}
                    value={inputView.inputData.forecastName}
                    onChange={(e: { target: { value: string } }) => {
                      // onClearAll();
                      field.onChange(e);
                      resetOutput();
                      setInputView((pre: any) => ({
                        ...pre,
                        inputData: {
                          ...pre.inputData,
                          forecastName: e.target.value,
                        },
                      }));
                      // setForecastName(e.target.value);
                      // fileInputData.forecastName = e.target.value;
                    }}
                  />
                </>
              )}
            />
          </Box>
          <Box justifyContent="left" alignItems="left">
            <h3 className="mb-2 text-normal-700">
              Select a brand for forecast
              <span className="text-md font-medium text-red-700 mb-2"> *</span>
            </h3>
            <Controller
              name="product"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.product}>
                  <Select
                    {...field}
                    labelId="feature"
                    disabled={inputView.isCompareToggle}
                    id="feature"
                    variant="outlined"
                    placeholder="Please select a feature"
                    onChange={(e) => {
                      // onClearAll();
                      field.onChange(e);
                      resetOutput();
                      setInputView((pre: any) => ({
                        ...pre,
                        inputData: {
                          ...pre.inputData,
                          product: e.target.value,
                        },
                      }));
                    }}
                    fullWidth
                    value={inputView.inputData.product}
                  >
                    {JSON.parse(inputView.inputData.history_trx_df)
                      .columns.slice(
                        1,
                        JSON.parse(inputView.inputData.history_trx_df).columns
                          .length
                      )
                      .map((name: any) => (
                        <MenuItem key={name} value={name}>
                          {name}
                        </MenuItem>
                      ))}
                  </Select>
                  {errors.product && (
                    <FormHelperText>{errors.product.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Box>

          <Box justifyContent="left" alignItems="left" className="w-full">
            <h3 className="mb-2 text-normal-700">
              Select a model for forecast
              <span className="text-md font-medium text-red-700 mb-2"> *</span>
            </h3>

            {fetchingNbrxModelNames ? (
              <Loader />
            ) : (
              <Controller
                name="model"
                control={control}
                render={({ field }) => (
                  <FormControl className="w-full" error={!!errors.model}>
                    {errors.model && (
                      <FormHelperText>{errors.model.message}</FormHelperText>
                    )}
                    <RadioGroup
                      {...field}
                      aria-labelledby="model-label"
                      value={
                        inputView.isCompareToggle
                          ? inputView.inputDataCompareToggle.model_type
                          : inputView.inputData.model_type
                      }
                      onChange={(e) => {
                        field.onChange(e);
                        if (!inputView.isCompareToggle) {
                          resetOutput();
                        }
                        if (inputView.isCompareToggle) {
                          setInputView((pre: any) => ({
                            ...pre,
                            inputDataCompareToggle: {
                              ...pre.inputDataCompareToggle,
                              model_type: e.target.value,
                              bounds: [0, 0],
                            },
                          }));
                        } else {
                          setInputView((pre: any) => ({
                            ...pre,
                            inputData: {
                              ...pre.inputData,
                              model_type: e.target.value,
                              bounds: [0, 0],
                            },
                          }));
                        }
                      }}
                      name="model"
                    >
                      {nbrxForecastAPIResponse?.data.forecastingModels.map(
                        (modelName: string, index: number) => {
                          return (
                            <Box key={index}>
                              <FormControlLabel
                                // key={index}
                                value={modelName}
                                control={<Radio />}
                                label={modelName}
                              />
                              {(inputView.isCompareToggle
                                ? inputView.inputDataCompareToggle.model_type ==
                                  modelName
                                : inputView.inputData.model_type ===
                                  modelName) &&
                                nbrxForecastAPIResponse?.data.modelType[
                                  index
                                ] !== "Unbounded" && (
                                  <>
                                    {" "}
                                    {inputView.isCompareToggle
                                      ? `[${inputView.inputDataCompareToggle.bounds[0]},${inputView.inputDataCompareToggle.bounds[1]}]`
                                      : `[${inputView.inputData.bounds[0]},${inputView.inputData.bounds[1]}]`}
                                    <Box key={index} className="flex">
                                      <Slider
                                        getAriaLabel={() => "Minimum distance"}
                                        value={
                                          inputView.isCompareToggle
                                            ? inputView.inputDataCompareToggle
                                                .bounds
                                            : inputView.inputData.bounds
                                        }
                                        onChange={handleBoundsChange}
                                        valueLabelDisplay="auto"
                                        step={50}
                                        marks
                                        max={boundsMaxValue}
                                        disableSwap
                                        className="m-5"
                                      />

                                      <Tooltip title="Increase bound range by 10000">
                                        <IconButton
                                          onClick={() => {
                                            resetOutput();
                                            setBoundsMaxValue(
                                              boundsMaxValue + 10000
                                            );
                                          }}
                                          color="primary"
                                          aria-label="add to shopping cart"
                                        >
                                          <AddCircleOutlineIcon />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </>
                                )}
                            </Box>
                          );
                        }
                      )}
                    </RadioGroup>
                  </FormControl>
                )}
              />
            )}
          </Box>

          <Grid container className="flex justify-end">
            <Grid item className="contents " sm={12} md={6}>
              <Button
                disabled={
                  outputView.outputDataForCompare.ModelNames.length == 2
                }
                variant="contained"
                type="submit"
              >
                {inputView.isCompareToggle
                  ? `Create and add`
                  : `Create Forecast`}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Grid>
    </Box>
  );
};

export default NewForecastInputForm;
