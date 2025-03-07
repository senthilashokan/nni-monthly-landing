import { Box, Grid } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import FileInputForm from "./FileInputForm";
import NewForecastInputForm from "./NewForecastInputForm";
import NewForecastOutput from "./NewForecastOutput";
import Chart from "@src/assets/images/LineChart.png";
import { useRequest } from "@src/hook/useRequest/useRequest";
import Loader from "@src/UI/Loader";
import { UserContext } from "@src/App";

const NewForecastNbrx = () => {
  const [
    fetchNbrxForecast,
    fetchingNbrxForecast,
    errorFetchingNbrxForecast,
    nbrxForecastAPIResponse,
    resetFetchNbrxForecastResponse,
  ] = useRequest();
  const [
    fetchNbrxForecastForCompare,
    fetchingNbrxForecastForCompare,
    errorFetchingNbrxForecastForCompare,
    nbrxForecastAPIResponseForCompare,
    resetCompareResponse,
  ] = useRequest();
  const [
    saveNbrxForecast,
    savingNbrxForecast,
    errorSavingForecast,
    saveNbrxForecastApiResponse,
  ] = useRequest();
  // Accessing context for handling snackbar messages
  const { setSnackbar } = useContext(UserContext);
  const [inputView, setInputView] = useState<{
    showFileInput: boolean;
    isCompareToggle: boolean;
    inputData: {
      getDataFromDB: boolean;
      primaryFileName: string;
      secondaryFileName: string;
      history_trx_df: string;
      history_nbrx_df: string;
      forecastName: string;
      product: string;
      bounds: Array<number>;
      model_type: string;
    };
    inputDataCompareToggle: {
      bounds: Array<number>;
      model_type: string;
    };
  }>({
    showFileInput: true,
    isCompareToggle: false,
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
    inputDataCompareToggle: {
      bounds: [0, 0],
      model_type: "",
    },
  });

  const [outputView, setOutputView] = useState<{
    showOutput: boolean;
    outputData: object;
    outputDataForCompare: {
      NbrxHistoryArray: Array<[]>;
      NbrxForecasts: Array<[]>;
      ModelNames: Array<string>;
      ModelTypes: Array<string>;
      BoundsArray: Array<Array<number>>;
    };
  }>({
    showOutput: false,
    outputData: {},
    outputDataForCompare: {
      ModelTypes: [],
      NbrxHistoryArray: [],
      NbrxForecasts: [],
      ModelNames: [],
      BoundsArray: [],
    },
  });

  const [dataToSaveOnCompare, setDataToSaveOnCompare] = useState<{
    bounds: number[];
    modelType: string;
    modelName: string;
    nbrxForecast: string[];
  }>({
    bounds: [],
    modelType: "",
    modelName: "",
    nbrxForecast: [],
  });

  const saveForecast = () => {
    const data = {
      createdOn: new Date().valueOf(),
      isUploadedFromDb: inputView.inputData.getDataFromDB,
      forecastName: inputView.inputData.forecastName,
      primaryFileName: inputView.inputData.primaryFileName,
      supportingFileName: inputView.inputData.secondaryFileName,
      product: inputView.inputData.product,
      modelType: inputView.isCompareToggle
        ? dataToSaveOnCompare.modelName
        : inputView.inputData.model_type,
      bounds: inputView.isCompareToggle
        ? dataToSaveOnCompare.bounds
        : inputView.inputData.bounds,
      outputData: inputView.isCompareToggle
        ? {
            ...outputView.outputData,
            Bounds: dataToSaveOnCompare.bounds,
            ModelName: dataToSaveOnCompare.modelName,
            ModelType: dataToSaveOnCompare.modelType,
            NbrxForecast: dataToSaveOnCompare.nbrxForecast,
          }
        : outputView.outputData,
    };
    saveNbrxForecast(
      {
        url: `${import.meta.env.VITE_API_BASE_URL}/nbrx-save-forecast`,
        method: "POST",
        data: data,
      },
      true
    );
  };

  const createForecast = () => {
    const data = {
      getDataFromDB: false,
      primaryFileName: inputView.inputData.primaryFileName,
      history_trx_df: inputView.inputData.history_trx_df,
      history_nbrx_df: inputView.inputData.history_nbrx_df,
      product: inputView.inputData.product,
      bounds: inputView.isCompareToggle
        ? inputView.inputDataCompareToggle.bounds
        : inputView.inputData.bounds,
      model_type: inputView.isCompareToggle
        ? inputView.inputDataCompareToggle.model_type
        : inputView.inputData.model_type,
    };
    if (inputView.isCompareToggle) {
      fetchNbrxForecastForCompare(
        {
          url: `${import.meta.env.VITE_API_BASE_URL}/nbrx-compare`,
          method: "POST",
          data: data,
        },
        true
      );
    } else {
      fetchNbrxForecast(
        {
          url: `${import.meta.env.VITE_API_BASE_URL}/nbrx-forecast`,
          method: "POST",
          data: data,
        },
        true
      );
    }
  };

  useEffect(() => {
    if (errorFetchingNbrxForecast) {
      setSnackbar((pre: any) => ({
        ...pre,
        open: true,
        severity: "error",
        message: `Error in creating forecast. Please try again.`,
      }));
    }
    if (nbrxForecastAPIResponse) {
      setOutputView((pre) => ({
        ...pre,
        showOutput: true,
        outputData: nbrxForecastAPIResponse.data,
      }));
      setSnackbar((pre: any) => ({
        ...pre,
        open: true,
        severity: "success",
        message: `Forecast created successfully.`,
      }));
      resetFetchNbrxForecastResponse();
    }
  }, [nbrxForecastAPIResponse, errorFetchingNbrxForecast]);
  useEffect(() => {
    if (inputView.isCompareToggle && errorFetchingNbrxForecastForCompare) {
      setSnackbar((pre: any) => ({
        ...pre,
        open: true,
        severity: "error",
        message: `Error in creating forecast. Please try again.`,
      }));
    }
    if (inputView.isCompareToggle && nbrxForecastAPIResponseForCompare) {
      const tempNbrxHistoryArray =
        outputView.outputDataForCompare.NbrxHistoryArray;
      const tempNbrxForecasts = outputView.outputDataForCompare.NbrxForecasts;
      const tempModelNames = outputView.outputDataForCompare.ModelNames;
      const tempModelTypes = outputView.outputDataForCompare.ModelTypes;
      const tempBoundsArray = outputView.outputDataForCompare.BoundsArray;
      tempNbrxHistoryArray.push(
        nbrxForecastAPIResponseForCompare.data.NbrxHistory
      );
      tempNbrxForecasts.push(
        nbrxForecastAPIResponseForCompare.data.NbrxForecast
      );
      tempModelNames.push(nbrxForecastAPIResponseForCompare.data.ModelName);
      tempModelTypes.push(nbrxForecastAPIResponseForCompare.data.ModelType);
      tempBoundsArray.push(nbrxForecastAPIResponseForCompare.data.Bounds);
      setOutputView((pre) => ({
        ...pre,
        outputDataForCompare: {
          NbrxHistoryArray: tempNbrxHistoryArray,
          NbrxForecasts: tempNbrxForecasts,
          ModelNames: tempModelNames,
          ModelTypes: tempModelTypes,
          BoundsArray: tempBoundsArray,
        },
      }));
      setSnackbar((pre: any) => ({
        ...pre,
        open: true,
        severity: "success",
        message: `Forecast added for comparison successfully.`,
      }));
      resetCompareResponse();
    }
  }, [nbrxForecastAPIResponseForCompare, errorFetchingNbrxForecastForCompare]);
  useEffect(() => {
    if (errorSavingForecast) {
      setSnackbar((pre: any) => ({
        ...pre,
        open: true,
        severity: "error",
        message: `Error in saving forecast. Please try again.`,
      }));
    }
    if (saveNbrxForecastApiResponse) {
      setSnackbar((pre: any) => ({
        ...pre,
        open: true,
        severity: "success",
        message: `Forecast has been saved successfully. `,
      }));
    }
  }, [saveNbrxForecastApiResponse, errorSavingForecast]);

  return (
    <Box className="NewForecastNbrxContainer min-h-screen">
      <Grid container>
        <Grid item sm={12} md={4}>
          {inputView.showFileInput ? (
            <FileInputForm setInputView={setInputView} />
          ) : (
            <NewForecastInputForm
              setInputView={setInputView}
              setOutputView={setOutputView}
              inputView={inputView}
              outputView={outputView}
              createForecast={createForecast}
            />
          )}
        </Grid>
        <Grid item sm={12} md={8}>
          {fetchingNbrxForecast || fetchingNbrxForecastForCompare ? (
            <Loader />
          ) : outputView.showOutput ? (
            <NewForecastOutput
              isCompareToggle={inputView.isCompareToggle}
              setInputView={setInputView}
              setOutputView={setOutputView}
              forecastName={inputView.inputData.forecastName}
              outputData={outputView.outputData}
              outputDataForCompare={outputView.outputDataForCompare}
              saveForecast={saveForecast}
              loadingForSaveForecast={savingNbrxForecast}
              setDataToSaveOnCompare={setDataToSaveOnCompare}
            />
          ) : (
            <Box className="min-h-screen flex items-center justify-center">
              <img className="  " src={Chart} alt="Logo" />{" "}
            </Box>
          )}
        </Grid>
      </Grid>
      {/* <NewForecastOutput /> */}
    </Box>
  );
};

export default NewForecastNbrx;
