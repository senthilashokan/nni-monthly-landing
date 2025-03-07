import { useEffect, useContext } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  CircularProgress,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useRequest } from "@src/hook/useRequest/useRequest";
import { useNavigate } from "react-router-dom";
import { UserContext } from "@src/App";

// Interface for props
interface ShareForecastConfirmationPopupInterface {
  show: boolean;
  setShow: (value: boolean) => void;
  title: string;
  subTitle: string;
  id: number;
  setTempShare: (arg0: boolean) => void;
  cardType: string;
}

// Component for displaying a delete confirmation popup
const ShareForecastConfirmationPopup = (
  props: ShareForecastConfirmationPopupInterface
) => {
  const { show, setShow, title, subTitle, id, setTempShare, cardType } = props;

  // Accessing context for handling snackbar messages
  const { setSnackbar } = useContext(UserContext);

  // Function to handle closing the delete confirmation popup
  const onClose = () => {
    setShow(false);
  };

  // Custom hook for making delete request
  const [
    shareForecast,
    sharingForecast,
    errorSharingForecast,
    apiResponseShareForecast,
  ] = useRequest();

  // Function to handle delete button click
  const handleSubmit = () => {
    title === "Share"
      ? shareForecast(
          {
            url: `${import.meta.env.VITE_API_BASE_URL}/${
              sessionStorage.getItem("User_group") == "NBRX"
                ? "share-nbrx-forecast"
                : "share-forecast"
            }`,
            method: "PUT",
            data: {
              id,
              sharedOn: new Date().valueOf(),
            },
          },
          true
        )
      : shareForecast(
          {
            url: `${import.meta.env.VITE_API_BASE_URL}/${
              sessionStorage.getItem("User_group") == "NBRX"
                ? "unshare-nbrx-forecast"
                : "unshare-forecast"
            }`,
            method: "PUT",
            params: {
              id,
            },
          },
          true
        );
  };

  // Navigate hook for redirecting after deletion
  let navigate = useNavigate();

  // Effect to handle response after deletion request
  useEffect(() => {
    if (apiResponseShareForecast) {
      setShow(false);
      //   const path = title === 'Share' ? '/' : '/sharedForecast';
      setSnackbar((pre: any) => ({
        ...pre,
        open: true,
        severity: "success",
        message:
          title == "Share"
            ? `Forecast shared successfully.`
            : `Forecast has been removed from shared folder.`,
      }));

      if (cardType == "Dashboard") {
        if (title === "Share") {
          setTempShare(true);
        } else {
          setTempShare(false);
        }
      } else {
        navigate("/sharedForecasts", {
          state: {
            refresh: id,
          },
        });
      }
    }
    if (errorSharingForecast) {
      setShow(false);
      setSnackbar((pre: any) => ({
        ...pre,
        open: true,
        severity: "error",
        message: `Error sharing forecast. Please try again.`,
      }));
    }
  }, [errorSharingForecast, apiResponseShareForecast]);

  return (
    <Dialog
      onClose={onClose}
      aria-labelledby="download-file-dialog"
      open={show}
    >
      {/* Dialog title */}
      <DialogTitle
        className="flex justify-center w-[500px] "
        sx={{ m: 0, p: 2 }}
        id="share-forecast-popup"
      >
        <b>{`${title} Forecast`}</b>
      </DialogTitle>
      {/* Subtitle or additional information */}
      <span className="flex justify-center w-full">{subTitle}</span>
      {/* Close button */}
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      {/* Dialog content */}
      <DialogContent>
        {/* Button group */}
        <Box className="w-full flex justify-center mt-5">
          {/* "No" button */}
          <Button className="w-32 !mr-10" variant="outlined" onClick={onClose}>
            No
          </Button>
          {/* Delete button */}
          {sharingForecast ? (
            // Display a spinner while deleting data
            <CircularProgress />
          ) : (
            <Button
              variant="contained"
              type="submit"
              className="w-32"
              onClick={handleSubmit}
              color="primary"
            >
              {`${title}`}
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ShareForecastConfirmationPopup;
