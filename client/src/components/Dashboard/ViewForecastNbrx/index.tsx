import { useState } from "react";
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
import { Download as DownloadIcon } from "@mui/icons-material";
// @ts-ignore
import BasicChartNbrx from "@src/UI/BasicChartNbrx";
import DownloadFilePopup from "@src/UI/DownloadFilePopup";
import BasicTableNbrx from "@src/UI/BasicTableNbrx";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";

const ViewForecastNbrx = () => {
  // Get the state from the current location
  const { state } = useLocation();

  // State to manage the visibility of the download file popup
  const [showFileDownloadPopup, setShowFileDownloadPopup] = useState(false);

  return (
    <Box className="viewForecast" id={state.cardData.created_on}>
      {/* Download file popup component */}
      <DownloadFilePopup
        fileData={state.cardData.outputData}
        downloadFileName={state.cardData.forecastName}
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
                {state.cardData.forecastName}
              </h1>
            </Box>
            <p className="text-gray-700 text-sm ">{`Created on: ${new Date(
              state.cardData.createdOn
            ).toString()}`}</p>
            <p className="text-gray-700 text-sm ">
              {state.cardType == "Dashboard" ? "Created by" : "Shared by"}
              {`: ${state.cardData.createdBy.toUpperCase()}`}
            </p>
          </Box>
          {/* Additional details */}
          <Box className="flex">
            <Box className="mr-16">
              <h2 className="pt-4 ">Primary Forecast File</h2>
              <p className="text-xs text-green-600">
                {state.cardData.primaryFileName}
              </p>
            </Box>
            {!state.cardData.isUploadedFromDb && (
              <Box>
                <h6 className="pt-4 ">Supporting Variable File</h6>
                <p className="text-xs text-green-600">
                  {state.cardData.supportingFileName}
                </p>
              </Box>
            )}
          </Box>
          <Box>
            <h2 className="pt-4  text-xl">Forecast name</h2>
            <p className="text-gray-700 text-sm ">
              {state.cardData.forecastName}
            </p>
          </Box>
          <Box>
            <h2 className="pt-4  text-xl">Selected Product</h2>
            <p className="text-gray-700 text-sm ">{state.cardData.product}</p>
          </Box>
          <Box>
            <h2 className="pt-4  text-xl">Model Name</h2>
            <p className="text-gray-700 text-sm ">
              {state.cardData.outputData.ModelName}
            </p>
          </Box>
          <Box>
            <h2 className="pt-4  text-xl">Model Type</h2>
            <p className="text-gray-700 text-sm ">
              {state.cardData.outputData.ModelType}
            </p>
          </Box>
          <Box>
            <h2 className="pt-4  text-xl">Bounds</h2>
            <p className="text-gray-700 text-sm ">
              [{state.cardData.bounds[0]},{state.cardData.bounds[1]}]
            </p>
          </Box>
        </Grid>
        {/* Main content */}
        <Grid item className=" w-full h-full" sm={12} md={8}>
          {/* Basic chart component */}
          <BasicChartNbrx
            data={state.cardData.outputData}
            isCompareToggle={false}
          />
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

          {/* Divider */}
          <Divider orientation="horizontal" flexItem />
          {/* Basic table component */}
          <div className="overflow-auto max-h-[360px] w-full">
            <BasicTableNbrx
              data={state.cardData.outputData}
              isCompareToggle={false}
            />
          </div>
        </Grid>
      </Grid>
    </Box>
  );
};

export { ViewForecastNbrx };
export default ViewForecastNbrx;
