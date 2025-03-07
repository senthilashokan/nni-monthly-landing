import { useRef, useState, useEffect } from "react";
// @ts-ignore
import BasicChart from "@src/UI/BasicChart";
import BasicTable from "@src/UI/BasicTable";
import DownloadFilePopup from "@src/UI/DownloadFilePopup";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { styled } from "@mui/material/styles";
import { Box, Divider, Button, CircularProgress, Tooltip } from "@mui/material";
import {
  Download as DownloadIcon,
  SaveAlt as SaveAltIcon,
} from "@mui/icons-material";
import SaveForecastPopup from "@src/UI/SaveForecastPopup";
import IconButton from "@mui/material/IconButton";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CompareForecastInfoPopup from "@src/UI/CompareForecastInfoPopup";

interface NewForecastOutputInterface {
  apiData: any;
  newForecastOutputView: any;
  setNewForecastOutputView: any;
  saveingNewForcast: any;
  setIsCompareToggle: any;
  isCompareToggle: boolean;
  isCompareLoading: boolean;
  selectedYear: any;
  forecastName: string;
  compareForecastData: any;
  compareSuportingVariablesArray: any;
  addNewFlag: boolean;
  setAddNewFlag: any;
}

const NewForecastOutput = (props: NewForecastOutputInterface) => {
  const {
    apiData,
    newForecastOutputView,
    setNewForecastOutputView,
    saveingNewForcast,
    setIsCompareToggle,
    isCompareToggle,
    selectedYear,
    forecastName,
    compareForecastData,
    compareSuportingVariablesArray,
    addNewFlag,
    setAddNewFlag,
    isCompareLoading,
  } = props;
  const [showFileDownloadPopup, setShowFileDownloadPopup] = useState(false);
  const [showComparedForecastsInfoPopup, setShowComparedForecastsInfoPopup] =
    useState(false);
  const [showForecastSelectionPopup, setShowForecastSelectionPopup] =
    useState(false);
  const [selectedForecastValue, setSelectedForecastValue] = useState([]);
  const [selectedForecastData, setSelectedForecastData] = useState([]);
  const componentRef = useRef<HTMLDivElement>(null);

  const saveForecastButtonClick = () => {
    if (isCompareToggle) {
      setShowForecastSelectionPopup(true);
    } else {
      setNewForecastOutputView((newForecastOutputView: any) => ({
        ...newForecastOutputView,
        saveForecast: true,
        disableSaveForecast: true,
      }));
    }
  };

  useEffect(() => {
    if (!showForecastSelectionPopup && selectedForecastValue.length > 0) {
      setNewForecastOutputView((newForecastOutputView: any) => ({
        ...newForecastOutputView,
        saveForecast: true,
        disableSaveForecast: true,
        selectedForecastSupportingVariables: selectedForecastValue,
        newData: selectedForecastData,
      }));
    }
  }, [showForecastSelectionPopup]);

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsCompareToggle(event.target.checked);
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
  const forecastOutput = () => {
    return (
      <Box ref={componentRef} className=" w-full h-full">
        <CompareForecastInfoPopup
          show={showComparedForecastsInfoPopup}
          setShow={setShowComparedForecastsInfoPopup}
          forecastInfo={compareSuportingVariablesArray}
        />

        <SaveForecastPopup
          show={showForecastSelectionPopup}
          setShow={setShowForecastSelectionPopup}
          forecastInfo={compareSuportingVariablesArray}
          setSelectedForecastValue={setSelectedForecastValue}
          setSelectedForecastData={setSelectedForecastData}
          fileData={apiData}
          compareForecastData={compareForecastData}
          isCompareToggle={isCompareToggle}
        />
        <DownloadFilePopup
          show={showFileDownloadPopup}
          setShow={setShowFileDownloadPopup}
          downloadFileName={forecastName}
          fileData={apiData}
          isCompareToggle={isCompareToggle}
          compareForecastData={compareForecastData}
        />
        <div className="">
          <div className="">
            <Box className={"flex"}>
              <FormControlLabel
                control={<IOSSwitch sx={{ m: 1 }} />}
                label="Compare Forecast"
              />
              {isCompareToggle ? (
                isCompareLoading ? (
                  <CircularProgress />
                ) : (
                  <>
                    {selectedYear === new Date().getFullYear() ? (
                      compareSuportingVariablesArray.length < 4 ? (
                        <Button
                          className="m-0 p-0"
                          onClick={() => setAddNewFlag(false)}
                          size="small"
                          disabled={!addNewFlag}
                        >
                          Add New
                        </Button>
                      ) : (
                        <p className="p-1 text-lg  text-blue-700">{`Maximum limit reached! At a time, ${compareSuportingVariablesArray.length} forecasts can be compared.`}</p>
                      )
                    ) : (
                      <></>
                    )}
                    {!(selectedYear === new Date().getFullYear()) ? (
                      compareSuportingVariablesArray.length < 2 ? (
                        <Button
                          className="m-0 p-0"
                          onClick={() => setAddNewFlag(false)}
                          size="small"
                          disabled={!addNewFlag}
                        >
                          Add New
                        </Button>
                      ) : (
                        <p className="p-1 text-lg  text-blue-500">{`Maximum limit reached! For next year ${compareSuportingVariablesArray.length} forecasts can be compared.`}</p>
                      )
                    ) : (
                      <></>
                    )}
                    <Tooltip title="Compared Forecast Info">
                      <IconButton
                        onClick={() => setShowComparedForecastsInfoPopup(true)}
                      >
                        <InfoOutlinedIcon className="Compared Forecast Info" />
                      </IconButton>
                    </Tooltip>
                  </>
                )
              ) : (
                <></>
              )}
            </Box>
            {isCompareToggle ? (
              <p className="pl-12 pt-0 mt-0 text-sm">
                Change values of supporting variables and add new forecast to
                compare
              </p>
            ) : (
              <></>
            )}
          </div>

          <div className="  overflow-auto">
            <BasicChart
              data={apiData}
              isCompareToggle={isCompareToggle}
              compareForecastData={compareForecastData}
            />
            <Box className="flex justify-end m-4 ">
              {saveingNewForcast ? (
                <CircularProgress />
              ) : (
                <Button
                  onClick={saveForecastButtonClick}
                  size="small"
                  startIcon={<SaveAltIcon />}
                  disabled={
                    isCompareToggle
                      ? false
                      : newForecastOutputView.disableSaveForecast
                  }
                >
                  Save Forecast
                </Button>
              )}
              <Button
                onClick={() => setShowFileDownloadPopup(true)}
                size="small"
                startIcon={<DownloadIcon />}
              >
                Download
              </Button>
            </Box>
          </div>
        </div>

        <p className="p-1 ml-4 text-xs">
          {" "}
          * All values are in Million US Dollars
        </p>

        <p className="p-1 ml-4 mb-2 text-xs"> * ACT - Actual, FCT - Forecast</p>

        <Divider orientation="horizontal" flexItem />
        <div className="overflow-auto h-[300px] w-full">
          <BasicTable
            data={apiData}
            selectedYear={selectedYear}
            isCompareToggle={isCompareToggle}
            compareForecastData={compareForecastData}
          />
        </div>
      </Box>
    );
  };

  return (
    <div className=" h-full flex justify-center items-center">
      {forecastOutput()}
    </div>
  );
};

export default NewForecastOutput;
