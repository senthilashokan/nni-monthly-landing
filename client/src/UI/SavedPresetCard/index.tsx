import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Button,
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteConfirmationPopup from "@src/UI/DeleteConfirmationPopup";
import { monthNames } from "@src/data/constants";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";

// Interface for SavedPresetCard component
interface MyForecastCardInterface {
  savedData: any; // savedData prop containing preset data
}

// Functional component for rendering a saved preset card
const SavedPresetCard = (props: MyForecastCardInterface) => {
  const { savedData } = props; // Destructuring props

  // State to control visibility of delete confirmation popup
  const [ShowDeletePopup, setShowDeletePopup] = useState(false);

  let navigate = useNavigate(); // Initializing useNavigate hook

  // Handler for forecast button click
  const handleForecastClick = () => {
    navigate("/newforecast", {
      state: {
        savedData: savedData,
      },
    });
  };

  // Memoized duration string derived from savedData
  const { duration } = useMemo(() => {
    let duration;

    if (savedData.duration) {
      let fromDate = new Date(savedData.duration.fromMonth);
      let toDate = new Date(savedData.duration.toMonth);
      duration = `${
        monthNames[fromDate.getMonth()]
      } ${fromDate.getFullYear()}-${
        monthNames[toDate.getMonth()]
      } ${toDate.getFullYear()}`;
    }
    return { duration };
  }, [savedData.duration]);

  return (
    <Card elevation={20} className="flex flex-col h-full">
      {/* Delete Confirmation Popup */}
      <Box className="w-full flex">
        <DeleteConfirmationPopup
          show={ShowDeletePopup}
          setShow={setShowDeletePopup}
          title="Preset"
          subTitle="Are you sure you want to delete the preset?"
          id={savedData.created_on}
          urlSuffix="delete-preset"
        />
        {/* Card Header */}
        <CardHeader
          className="w-full"
          title={
            <>
              {savedData.isUploadedFromDb ? (
                <Tooltip title="File data uploaded from database">
                  <CloudUploadOutlinedIcon />
                </Tooltip>
              ) : (
                <Tooltip title="File data uploaded locally">
                  <DriveFolderUploadOutlinedIcon />
                </Tooltip>
              )}
              <b className="text-sm font-extrabold ml-2">Preset for</b>{" "}
              <b className="text-sm">{savedData.forecast_name}</b>
            </>
          }
        />
        {/* Delete Button */}
        <Box className="  flex-end ">
          <Tooltip title="Delete Preset">
            <IconButton onClick={() => setShowDeletePopup(true)}>
              <DeleteOutlineIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <CardContent className="flex-grow overflow-auto">
        {/* Grid for preset details */}
        <Grid container spacing={2}>
          <Grid item md={6}>
            <b className="text-sm inline-block">Forecast Duration</b>
            <p className="text-sm">{duration}</p>
          </Grid>
          <Grid item md={6}>
            <b className="text-sm inline-block"> Primary Data Feature</b>
            <p className="text-sm block">{savedData.feature_type}</p>
          </Grid>
          <Grid item md={12}>
            <b className="text-sm">Supporting Variables</b>
            <p className="text-sm">
              {savedData.supporting_variables.map((item: any) => (
                <span key={item}>{item}, </span>
              ))}
            </p>
          </Grid>
        </Grid>
      </CardContent>
      <Box className="flex w-full m-3">
        {/* Forecast Button */}
        <Box className="w-full">
          <Button onClick={handleForecastClick} variant="contained">
            Forecast
          </Button>
        </Box>
        {/* Created by Information */}
        <p className="min-w-40 self-end text-[#707070]">
          Created by - {savedData.created_by.toUpperCase()}
        </p>
      </Box>
    </Card>
  );
};

export default SavedPresetCard;
