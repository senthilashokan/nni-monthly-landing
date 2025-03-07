import { useMemo, useState, useContext } from "react";
import {
  Button,
  Grid,
  Card,
  CardContent,
  Box,
  Tooltip,
  IconButton,
  Typography,
} from "@mui/material";
// @ts-ignore
import BasicChart from "@src/UI/BasicChart";
import { useNavigate } from "react-router-dom";
import ShareOutlineIcon from "@mui/icons-material/Share";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteConfirmationPopup from "@src/UI/DeleteConfirmationPopup";
import { monthNames } from "@src/data/constants";
import ShareForecastConfirmationPopup from "@src/UI/ShareForecastConfirmationPopup";
import FolderOffOutlinedIcon from "@mui/icons-material/FolderOffOutlined";
import { UserContext } from "@src/App";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";

// Interface for MyForecastCard component
interface MyForecastCardInterface {
  cardData: any; // cardData prop containing forecast data
  cardType: string;
}

// Functional component for rendering a forecast card
const MyForecastCard = (props: MyForecastCardInterface) => {
  const { cardData, cardType } = props; // Destructuring props
  const { user } = useContext(UserContext);

  // State to control visibility of delete confirmation popup
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [tempShare, setTempShare] = useState(cardData.is_shared);
  const [showShareForecastPopup, setShowShareForecastPopup] = useState(false);
  const [showRemoveShareForecastPopup, setShowRemoveShareForecastPopup] =
    useState(false);

  let navigate = useNavigate(); // Initializing useNavigate hook

  // Handler for view forecast button click
  const handleViewForecastClick = () => {
    navigate("/viewForecast", {
      state: {
        cardData,
        cardType,
      },
    });
  };

  // Memoized duration string derived from cardData
  const { duration } = useMemo(() => {
    let duration;

    if (cardData.duration) {
      let fromDate = new Date(cardData.duration.fromMonth);
      let toDate = new Date(cardData.duration.toMonth);
      duration = `${
        monthNames[fromDate.getMonth()]
      } ${fromDate.getFullYear()}-${
        monthNames[toDate.getMonth()]
      } ${toDate.getFullYear()}`;
    }
    return { duration };
  }, [cardData.duration]);

  return (
    <Card elevation={20}>
      {/* Delete Confirmation Popup */}
      <DeleteConfirmationPopup
        show={showDeletePopup}
        setShow={setShowDeletePopup}
        title="Forecast"
        subTitle="Are you sure you want to delete the forecast?"
        id={cardData.created_on}
        urlSuffix="delete-forecast"
      />
      <ShareForecastConfirmationPopup
        show={showShareForecastPopup}
        setShow={setShowShareForecastPopup}
        title="Share"
        subTitle="Are you sure you want to share the forecast?"
        id={cardData.created_on}
        setTempShare={setTempShare}
        cardType={cardType}
      />
      <ShareForecastConfirmationPopup
        show={showRemoveShareForecastPopup}
        setShow={setShowRemoveShareForecastPopup}
        title="Remove"
        subTitle="Are you sure you want to remove forecast from shared folder?"
        id={cardData.created_on}
        setTempShare={setTempShare}
        cardType={cardType}
      />

      <Box className="w-full flex">
        {/* Card Header */}
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
            {`  ${cardData.forecast_name}`}
          </Typography>
          <Typography variant="subtitle1">
            {`Created on: ${new Date(cardData.created_on).toString()}`}
          </Typography>
        </Box>
        {sessionStorage.getItem("User_group") == "FINANCE" && (
          <>
            {/* Delete Button */}
            {cardType === "Shared" &&
              user.email.split("@")[0] === cardData.created_by && (
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
          </>
        )}
      </Box>

      <CardContent>
        {/* Basic Chart */}
        <BasicChart data={cardData.apiResponseData} size={"card"} />
        <Grid className="mb-4" container>
          {/* Forecast Duration */}
          <Grid item md={4}>
            <b>Forecast Duration</b>
            <p>{duration}</p>
          </Grid>
          {/* Primary Data Feature */}
          <Grid item md={4}>
            <b>Primary Data Feature</b>
            <p>{cardData.feature_type}</p>
          </Grid>
          {/* Supporting Variables */}
          <Grid item md={4}>
            <b>Supporting Variables</b>
            <p className="overflow-hidden text-ellipsis">
              {cardData.supporting_variables.map((item: any) => {
                return `${item},`;
              })}{" "}
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
            {cardData.created_by.toUpperCase()}
          </p>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MyForecastCard;
