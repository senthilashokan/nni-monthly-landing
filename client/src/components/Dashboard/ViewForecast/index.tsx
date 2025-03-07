import { useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Box,
  Grid,
  Breadcrumbs,
  Typography,
  Button,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Download as DownloadIcon,
  CheckBox as CheckBoxIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
// @ts-ignore
import BasicChart from "@src/UI/BasicChart";
import DownloadFilePopup from "@src/UI/DownloadFilePopup";
import BasicTable from "@src/UI/BasicTable";
import { monthNames } from "@src/data/constants";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";

const ViewForecast = () => {
  // Get the state from the current location
  const { state } = useLocation();

  // State to manage the visibility of the download file popup
  const [showFileDownloadPopup, setShowFileDownloadPopup] = useState(false);

  // Memoized variables for display
  const { from, to, selectedYear } = useMemo(() => {
    let from;
    let to;
    let selectedYear;

    if (state.cardData.duration) {
      let fromDate = new Date(state.cardData.duration.fromMonth);
      let toDate = new Date(state.cardData.duration.toMonth);
      selectedYear = new Date(state.cardData.duration.toMonth).getFullYear();
      from = `${monthNames[fromDate.getMonth()]} ${fromDate.getFullYear()}`;
      to = `${monthNames[toDate.getMonth()]} ${toDate.getFullYear()}`;
    }
    return { from, to, selectedYear };
  }, [state.cardData.duration]);

  return (
    <Box className="viewForecast" id={state.cardData.created_on}>
      {/* Download file popup component */}
      <DownloadFilePopup
        fileData={state.cardData.apiResponseData}
        downloadFileName={state.cardData.forecast_name}
        show={showFileDownloadPopup}
        setShow={setShowFileDownloadPopup}
        isCompareToggle={false}
        compareForecastData={undefined}
      />
      <Grid container>
        {/* Sidebar */}
        <Grid
          item
          className=" min-h-screen bg-gray-100 p-3 space-y-4"
          sm={12}
          md={4}
        >
          {/* Breadcrumbs */}
          <Breadcrumbs aria-label="breadcrumb">
            {state.cardType == "Dashboard" ? (
              <Link className="text-sky-800" to="/">
                Dashboard
              </Link>
            ) : (
              <Link className="text-sky-800" to="/sharedForecasts">
                Shared Forecasts
              </Link>
            )}

            <Typography color="text.primary">View Forecast</Typography>
          </Breadcrumbs>
          {/* Forecast details */}
          <Box>
            <Box className="flex items-end">
              {state.cardData.isUploadedFromDb ? (
                <Tooltip title="File data uploaded from database">
                  <CloudUploadOutlinedIcon />
                </Tooltip>
              ) : (
                <Tooltip title="File data uploaded locally">
                  <DriveFolderUploadOutlinedIcon />
                </Tooltip>
              )}
              <h1 className="pt-4  text-xl ml-2">
                {" "}
                {state.cardData.forecast_name}
              </h1>
            </Box>
            <p className="text-gray-700 text-sm ">{`Created on: ${new Date(
              state.cardData.created_on
            ).toString()}`}</p>
            <p className="text-gray-700 text-sm ">
              {state.cardType == "Dashboard" ? "Created by" : "Shared by"}
              {`: ${state.cardData.created_by.toUpperCase()}`}
            </p>
          </Box>
          {/* Additional details */}
          <Box className="flex">
            <Box className="mr-16">
              <h2 className="pt-4 ">Primary Forecast File</h2>
              <p className="text-xs text-green-600">
                {state.cardData.primary_file_name}
              </p>
            </Box>
            {!state.cardData.isUploadedFromDb && (
              <Box>
                <h6 className="pt-4 ">Supporting Variable File</h6>
                <p className="text-xs text-green-600">
                  {state.cardData.supporting_file_name}
                </p>
              </Box>
            )}
          </Box>
          <Box>
            <h2 className="pt-4  text-xl">Forecast name</h2>
            <p className="text-gray-700 text-sm ">
              {state.cardData.forecast_name}
            </p>
          </Box>
          <Box>
            <h2 className="pt-4  text-xl">
              Selected Feature From Primary Data
            </h2>
            <p className="text-gray-700 text-sm ">
              {state.cardData.feature_type}
            </p>
          </Box>
          <Box>
            <h2 className="pt-4  text-xl">Selected Duration</h2>
            <p className="text-gray-700 text-sm font ">
              {from + "   "}
              {<ArrowForwardIcon className="mb-1" fontSize="small" />}
              {"   " + to}
            </p>
          </Box>
          <Box>
            <h2 className="pt-4  text-xl">Selected Supporting Variables</h2>
            {state.cardData.supporting_variables.map(
              (item: any, index: number) => {
                return (
                  <p key={index} className="text-sm ">
                    <CheckBoxIcon className="text-[#1f77b4]" />
                    {item}
                  </p>
                );
              }
            )}
          </Box>
        </Grid>
        {/* Main content */}
        <Grid item className=" w-full h-full" sm={12} md={8}>
          {/* Basic chart component */}
          <BasicChart data={state.cardData.apiResponseData} />
          {/* Button to download file */}
          <Box className="w-full flex justify-end">
            <Button
              onClick={() => setShowFileDownloadPopup(true)}
              size="small"
              startIcon={<DownloadIcon />}
            >
              Download
            </Button>
          </Box>
          {/* Additional information */}
          <p className="p-1 ml-4 text-xs">
            {" "}
            * All values are in Million US Dollars
          </p>
          <p className="p-1 ml-4 mb-2 text-xs">
            {" "}
            * ACT - Actual, FCT - Forecast
          </p>
          {/* Divider */}
          <Divider orientation="horizontal" flexItem />
          {/* Basic table component */}
          <BasicTable
            data={state.cardData.apiResponseData}
            selectedYear={selectedYear}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export { ViewForecast };
export default ViewForecast;
