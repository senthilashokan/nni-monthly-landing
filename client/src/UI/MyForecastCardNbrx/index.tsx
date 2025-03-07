import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteConfirmationPopup from "../DeleteConfirmationPopup";
import ShareForecastConfirmationPopup from "../ShareForecastConfirmationPopup";
import { useContext, useState } from "react";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import ShareOutlineIcon from "@mui/icons-material/Share";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FolderOffOutlinedIcon from "@mui/icons-material/FolderOffOutlined";
// @ts-ignore
import BasicChartNbrx from "@src/UI/BasicChartNbrx";
import { UserContext } from "@src/App";
import { useNavigate } from "react-router-dom";

interface MyForecastCardNbrxInterface {
  cardData: any; // cardData prop containing forecast data
  cardType: string;
}

const MyForecastCardNbrx = (props: MyForecastCardNbrxInterface) => {
  const { cardData, cardType } = props; // Destructuring props
  const { user } = useContext(UserContext);

  let navigate = useNavigate(); // Initializing useNavigate hook
  // Handler for view forecast button click
  const handleViewForecastClick = () => {
    navigate("/viewForecastNbrx", {
      state: {
        cardData,
        cardType,
      },
    });
  };
  // State to control visibility of delete confirmation popup
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [tempShare, setTempShare] = useState(cardData.isShared);
  const [showShareForecastPopup, setShowShareForecastPopup] = useState(false);
  const [showRemoveShareForecastPopup, setShowRemoveShareForecastPopup] =
    useState(false);
  return (
    <Card elevation={20}>
      {" "}
      <DeleteConfirmationPopup
        show={showDeletePopup}
        setShow={setShowDeletePopup}
        title="Forecast"
        subTitle="Are you sure you want to delete the forecast?"
        id={cardData.createdOn}
        urlSuffix="delete-nbrx-forecast"
      />
      <ShareForecastConfirmationPopup
        show={showShareForecastPopup}
        setShow={setShowShareForecastPopup}
        title="Share"
        subTitle="Are you sure you want to share the forecast?"
        id={cardData.createdOn}
        setTempShare={setTempShare}
        cardType={cardType}
      />
      <ShareForecastConfirmationPopup
        show={showRemoveShareForecastPopup}
        setShow={setShowRemoveShareForecastPopup}
        title="Remove"
        subTitle="Are you sure you want to remove forecast from shared folder?"
        id={cardData.createdOn}
        setTempShare={setTempShare}
        cardType={cardType}
      />
      <Box className="w-full flex">
        <Box className=" w-full p-2">
          <Typography variant="h5">
            {cardData.isUploadedFromDb ? (
              <Tooltip title="File data uploaded from database">
                <CloudUploadOutlinedIcon />
              </Tooltip>
            ) : (
              <Tooltip title="File data uploaded locally">
                <DriveFolderUploadOutlinedIcon />
              </Tooltip>
            )}
            {`  ${cardData.forecastName}`}
          </Typography>
          <Typography variant="subtitle1">
            {`Created on: ${new Date(cardData.createdOn).toString()}`}
          </Typography>
        </Box>
        {cardType === "Shared" &&
          user.email.split("@")[0] === cardData.createdBy && (
            <Box className="mt-4   flex-end ">
              <Tooltip title="Remove Forecast From Shared Folder">
                <IconButton
                  onClick={() => setShowRemoveShareForecastPopup(true)}
                >
                  <FolderOffOutlinedIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}

        {tempShare ? (
          cardType == "Dashboard" && (
            <Box className="mt-4  flex-end ">
              <Tooltip title="Remove Forecast From Shared Folder">
                <IconButton
                  onClick={() => setShowRemoveShareForecastPopup(true)}
                >
                  <FolderOffOutlinedIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )
        ) : (
          <Box className="mt-4  flex-end ">
            <Tooltip title="Share Forecast">
              <IconButton onClick={() => setShowShareForecastPopup(true)}>
                <ShareOutlineIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {cardType === "Dashboard" && (
          <Box className="mt-4  flex-end ">
            <Tooltip title="Delete Forecast">
              <IconButton onClick={() => setShowDeletePopup(true)}>
                <DeleteOutlineIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
      <CardContent>
        <BasicChartNbrx data={cardData.outputData} size={"card"} />
        <Grid className="mb-4" container>
          {/* Forecast Duration */}
          <Grid item md={3}>
            <b>Selected Product</b>
            <p>{cardData.product}</p>
          </Grid>
          {/* Primary Data Feature */}
          <Grid item md={3}>
            <b>Model Name</b>
            <p>{cardData.modelType}</p>
          </Grid>
          <Grid item md={3}>
            <b>Model Type</b>
            <p>{cardData.outputData.ModelType}</p>
          </Grid>
          {/* Supporting Variables */}
          <Grid item md={3}>
            <b>Bounds</b>
            <p className="overflow-hidden text-ellipsis">
              [{cardData.bounds[0]},{cardData.bounds[1]}]
            </p>
          </Grid>
        </Grid>
        <Box className="flex w-full">
          {/* View Forecast Button */}
          <Box className="w-full">
            <Button onClick={handleViewForecastClick} variant="contained">
              View Forecast
            </Button>
          </Box>
          {/* Created by Information */}
          <p className="min-w-40 self-end text-[#707070]">
            {cardType == "Dashboard" ? "Created by" : "Shared by"} -{" "}
            {cardData.createdBy.toUpperCase()}
          </p>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MyForecastCardNbrx;
