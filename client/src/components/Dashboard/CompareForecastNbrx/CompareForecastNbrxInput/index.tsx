import {
  Box,
  Breadcrumbs,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom"; // Importing Link component from react-router-dom
import InfoIcon from "@mui/icons-material/Info";

const CompareForecastNbrxInput = (props: any) => {
  const {
    savedBrandNames,
    selectedBrand,
    setSelectedBrand,
    inputData,
    setOutputView,
  } = props;

  const [inputView, setInputView] = useState<{
    showInput: boolean;
    availableForecasts: any;
  }>({
    showInput: false,
    availableForecasts: [],
  });
  const [selectedForecasts, setSelectedForecasts] = useState<any>([]);
  const handleSelectedFeatureChange = (event: any) => {
    setSelectedBrand(event.target.value);
    setInputView(() => ({
      showInput: false,
      availableForecasts: [],
    }));
    setSelectedForecasts([]);
    setOutputView({
      showOutput: false,
      outputData: {},
      outputDataForCompare: {
        ModelTypes: [],
        NbrxForecasts: [],
        ModelNames: [],
        BoundsArray: [],
      },
    });
  };

  const handleCheckboxClick = (id: number, index: number) => {
    setOutputView({
      showOutput: false,
      outputData: {},
      outputDataForCompare: {
        ModelTypes: [],
        NbrxForecasts: [],
        ModelNames: [],
        BoundsArray: [],
      },
    });
    if (
      selectedForecasts.filter((item: any) => item["createdOn"] === id)
        .length == 0
    ) {
      setSelectedForecasts((pre: any) => [
        ...pre,
        inputView.availableForecasts[index],
      ]);
    } else {
      setSelectedForecasts(
        selectedForecasts.filter((item: any) => item["createdOn"] !== id)
      );
    }
  };

  const handleCompareForecastClick = async () => {
    const tempModelTypes = await selectedForecasts
      .slice(1)
      .map((item: any) => item["outputData"]["ModelType"]);
    const tempNbrxHistoryArray = await selectedForecasts
      .slice(1)
      .map((item: any) => item["outputData"]["NbrxHistory"]);
    const tempNbrxForecasts = await selectedForecasts
      .slice(1)
      .map((item: any) => item["outputData"]["NbrxForecast"]);
    const tempModelNames = await selectedForecasts
      .slice(1)
      .map((item: any) => item["outputData"]["ModelName"]);
    const tempBoundsArray = await selectedForecasts
      .slice(1)
      .map((item: any) => item["outputData"]["Bounds"]);

    setOutputView((pre: any) => ({
      ...pre,
      showOutput: true,
      outputData: selectedForecasts.slice(0, 1)[0]["outputData"],
      outputDataForCompare: {
        ModelTypes: tempModelTypes,
        NbrxHistoryArray: tempNbrxHistoryArray,
        NbrxForecasts: tempNbrxForecasts,
        ModelNames: tempModelNames,
        BoundsArray: tempBoundsArray,
      },
    }));
  };

  const onProceedClick = () => {
    setInputView((pre) => ({
      ...pre,
      showInput: true,
      availableForecasts: inputData[selectedBrand],
    }));
  };
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
            Forecasts can be compared with the brands.
          </p>
        </Box>
        <Box justifyContent="left" alignItems="left" marginTop="50px">
          <h3 className="mb-2 text-normal-700">
            Select Feature From Primary Data
            <span className="text-md font-medium text-red-700 mb-2"> *</span>
          </h3>
          <FormControl fullWidth>
            <Select
              value={selectedBrand}
              onChange={handleSelectedFeatureChange}
            >
              {savedBrandNames.map((feature: string, index: number) => (
                <MenuItem key={index} value={feature}>
                  {feature}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box className="mb-5 mt-10 w-full flex justify-start">
            <Button onClick={onProceedClick} variant="outlined">
              Proceed
            </Button>
          </Box>
        </Box>
        {inputView.showInput && (
          <Box>
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
                onClick={() => {
                  setSelectedForecasts([]);
                  setOutputView({
                    showOutput: false,
                    outputData: {},
                    outputDataForCompare: {
                      ModelTypes: [],
                      NbrxForecasts: [],
                      ModelNames: [],
                      BoundsArray: [],
                    },
                  });
                }}
              >
                Clear All
              </p>
            </Box>
            <Box className="flex">
              <InfoIcon className="mt-1 text-blue-500" />
              {selectedForecasts.length < 4 ? (
                <p className="p-1 text-md  text-blue-500">
                  Minimum 2 forecasts needed for comparison.
                </p>
              ) : (
                <p className="p-1 text-md  text-blue-500">
                  At a time only 3 forecasts can be compared
                </p>
              )}
            </Box>
            <Box className="grid">
              {inputView.availableForecasts.map((item: any, index: number) => {
                return (
                  <FormControlLabel
                    key={index}
                    control={
                      <Checkbox
                        key={index}
                        onClick={() => {
                          handleCheckboxClick(item.createdOn, index);
                        }}
                        checked={selectedForecasts.includes(item)}
                      />
                    }
                    label={item?.forecastName}
                  />
                );
              })}
            </Box>
            <Box className="flex justify-end">
              <Button
                disabled={
                  selectedForecasts.length < 2 || selectedForecasts.length > 3
                }
                variant="contained"
                onClick={handleCompareForecastClick}
              >
                Compare Forecasts
              </Button>
            </Box>
          </Box>
        )}
      </Grid>
    </Box>
  );
};

export default CompareForecastNbrxInput;
