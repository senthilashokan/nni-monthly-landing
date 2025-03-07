import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  styled,
  Switch,
} from "@mui/material";
import {
  Download as DownloadIcon,
  SaveAlt as SaveAltIcon,
} from "@mui/icons-material";
import { useRef, useState } from "react";
// @ts-ignore
import BasicChartNbrx from "@src/UI/BasicChartNbrx";
import BasicTableNbrx from "@src/UI/BasicTableNbrx";
import DownloadFilePopup from "@src/UI/DownloadFilePopup";
import CloseIcon from "@mui/icons-material/Close";

const NewForecastOutput = (props: any) => {
  const {
    isCompareToggle,
    isCompareDashboard,
    setInputView,
    setOutputView,
    forecastName,
    outputData,
    outputDataForCompare,
    saveForecast,
    loadingForSaveForecast,
    setDataToSaveOnCompare,
  } = props;
  const [showFileDownloadPopup, setShowFileDownloadPopup] = useState(false);
  const [showComparedForecastsInfoPopup, setShowComparedForecastsInfoPopup] =
    useState(false);
  const componentRef = useRef<HTMLDivElement>(null);
  // Array of forecast colors
  const forecastColor = ["#d62727", "#8D48CB", "#563A3A"];

  const handleToggleChange = () => {
    setInputView((pre: any) => ({
      ...pre,
      isCompareToggle: !isCompareToggle,
      inputDataCompareToggle: {
        ...pre.inputDataCompareToggle,
        model_type: "",
        bounds: [0, 0],
      },
    }));
    setOutputView((pre: any) => ({
      ...pre,
      outputDataForCompare: {
        NbrxHistoryArray: [],
        NbrxForecasts: [],
        ModelNames: [],
        ModelTypes: [],
        BoundsArray: [],
      },
    }));
  };
  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = parseInt((event.target as HTMLInputElement).value);
    if (selectedValue == 0) {
      setDataToSaveOnCompare(() => ({
        bounds: outputData.Bounds,
        modelType: outputData.ModelType,
        modelName: outputData.ModelName,
        nbrxForecast: outputData.NbrxForecast,
      }));
    } else {
      setDataToSaveOnCompare(() => ({
        bounds: outputDataForCompare.BoundsArray[selectedValue - 1],
        modelType: outputDataForCompare.ModelTypes[selectedValue - 1],
        modelName: outputDataForCompare.ModelNames[selectedValue - 1],
        nbrxForecast: outputDataForCompare.NbrxForecasts[selectedValue - 1],
      }));
    }
  };

  const handleSaveForecastButtonClick = () => {
    if (isCompareToggle) {
      setShowComparedForecastsInfoPopup(true);
    } else {
      saveForecast();
    }
  };

  const saveForecastOnCompare = () => {
    saveForecast();
    setShowComparedForecastsInfoPopup(false);
  };

  const IOSSwitch = styled((props) => (
    <Switch
      focusVisibleClassName=".Mui-focusVisible"
      disableRipple
      onChange={handleToggleChange}
      checked={isCompareToggle}
      {...props}
    />
  ))(({ theme }) => ({
    width: 40,
    height: 23,
    padding: 0,
    "& .MuiSwitch-switchBase": {
      padding: 0,
      margin: 2,
      transitionDuration: "300ms",
      "&.Mui-checked": {
        transform: "translateX(16px)",
        color: "#fff",
        "& + .MuiSwitch-track": {
          backgroundColor:
            theme.palette.mode === "dark" ? "#005AD2" : "#005AD2",
          opacity: 1,
          border: 0,
        },
        "&.Mui-disabled + .MuiSwitch-track": {
          opacity: 0.5,
        },
      },
      "&.Mui-focusVisible .MuiSwitch-thumb": {
        color: "#005AD2",
        border: "6px solid #fff",
      },
      "&.Mui-disabled .MuiSwitch-thumb": {
        color:
          theme.palette.mode === "light"
            ? theme.palette.grey[100]
            : theme.palette.grey[600],
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
      },
    },
    "& .MuiSwitch-thumb": {
      boxSizing: "border-box",
      width: 18,
      height: 18,
    },
    "& .MuiSwitch-track": {
      borderRadius: 26 / 2,
      backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
      opacity: 1,
      transition: theme.transitions.create(["background-color"], {
        duration: 500,
      }),
    },
  }));
  return (
    <Box ref={componentRef} className=" min-h-screen w-full h-full">
      <DownloadFilePopup
        show={showFileDownloadPopup}
        setShow={setShowFileDownloadPopup}
        downloadFileName={forecastName}
        fileData={outputData}
        isCompareToggle={isCompareToggle}
        compareForecastData={outputDataForCompare}
      />
      <Dialog
        onClose={() => setShowComparedForecastsInfoPopup(false)}
        aria-labelledby="download-file-dialog"
        open={showComparedForecastsInfoPopup}
      >
        {/* Dialog Title */}
        <DialogTitle
          className="flex justify-center w-[500px] "
          sx={{ m: 0, p: 2 }}
          id="download-popup"
        >
          <b>Save Forecast</b>
        </DialogTitle>
        {/* Dialog Description */}
        <span className="flex justify-center w-full">
          Please select the forecast to be saved.
        </span>
        {/* Close Button */}
        <IconButton
          aria-label="close"
          onClick={() => setShowComparedForecastsInfoPopup(false)}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        {/* Dialog Content */}
        <DialogContent>
          {/* Radio Button Group */}
          <FormControl>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              defaultValue={0}
              name="radio-buttons-group"
              onChange={handleRadioChange}
              className="w-[1000px]"
            >
              <FormControlLabel
                key={0}
                value={0}
                control={<Radio />}
                label={`NbrxForecast 1:  ${outputData.ModelName} ${
                  outputData.ModelType == "Bounded"
                    ? ` [${outputData.Bounds[0]},${outputData.Bounds[1]}]`
                    : ""
                } `}
                sx={{ color: forecastColor[0] }}
              />
              {outputDataForCompare.ModelNames.map(
                (modelName: any, index: number) => {
                  let label = `NbrxForecast ${index + 2}:  ${modelName}${
                    outputDataForCompare.ModelTypes[index] == "Bounded"
                      ? ` [${outputDataForCompare.BoundsArray[index][0]},${outputDataForCompare.BoundsArray[index][1]}]`
                      : ""
                  } `;
                  return (
                    <FormControlLabel
                      key={index + 1}
                      value={index + 1}
                      control={<Radio />}
                      label={label}
                      sx={{ color: forecastColor[index + 1] }}
                    />
                  );
                }
              )}
            </RadioGroup>
          </FormControl>
          {/* Button Group */}
          <Box className="w-full flex justify-center mt-5">
            {/* Back Button */}
            <Button
              className="w-32 !mr-10"
              variant="outlined"
              onClick={() => setShowComparedForecastsInfoPopup(false)}
            >
              Back
            </Button>
            {/* Save Button */}
            <Box className="min-w-36">
              <Button
                fullWidth
                variant="contained"
                onClick={saveForecastOnCompare}
              >
                Save
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      {!isCompareDashboard && (
        <Box className={"flex"}>
          <FormControlLabel
            control={<IOSSwitch sx={{ m: 1 }} />}
            label="Compare Forecast"
          />
          {outputDataForCompare.ModelNames.length == 2 && (
            <p className="p-1 text-lg  text-blue-700">{`Maximum limit reached! At a time, 3 forecasts can be compared.`}</p>
          )}
        </Box>
      )}
      <div className="  overflow-auto">
        <BasicChartNbrx
          data={outputData}
          dataForCompare={outputDataForCompare}
          isCompareToggle={isCompareToggle}
        />
        <Box className="flex justify-end m-4 ">
          {loadingForSaveForecast ? (
            <CircularProgress />
          ) : (
            !isCompareDashboard && (
              <Button
                onClick={handleSaveForecastButtonClick}
                size="small"
                startIcon={<SaveAltIcon />}
              >
                Save Forecast
              </Button>
            )
          )}
          <Button
            onClick={() => setShowFileDownloadPopup(true)}
            size="small"
            startIcon={<DownloadIcon />}
          >
            Download
          </Button>
        </Box>

        {/* <p className="p-1 ml-4 mb-2 text-xs"> * ACT - Actual, FCT - Forecast</p> */}

        <Divider orientation="horizontal" flexItem />
        <div className="overflow-auto max-h-[405px] w-full">
          <BasicTableNbrx
            data={outputData}
            dataForCompare={outputDataForCompare}
            isCompareToggle={isCompareToggle}
          />
        </div>
      </div>
    </Box>
  );
};

export default NewForecastOutput;
