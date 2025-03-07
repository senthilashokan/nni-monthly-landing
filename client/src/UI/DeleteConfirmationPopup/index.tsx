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
interface DeleteConfirmationPopupInterface {
  show: boolean;
  setShow: (value: boolean) => void;
  title: string;
  subTitle: string;
  id: number;
  urlSuffix: string;
}

// Component for displaying a delete confirmation popup
const DeleteConfirmationPopup = (props: DeleteConfirmationPopupInterface) => {
  const { show, setShow, title, subTitle, id, urlSuffix } = props;

  // Accessing context for handling snackbar messages
  const { setSnackbar } = useContext(UserContext);

  // Function to handle closing the delete confirmation popup
  const onClose = () => {
    setShow(false);
  };

  // Custom hook for making delete request
  const [deleteData, deletingData, errorDeletingData, apiResponseDeleteData] =
    useRequest();

  // Function to handle delete button click
  const handleSubmit = () => {
    deleteData(
      {
        url: `${import.meta.env.VITE_API_BASE_URL}/${urlSuffix}`,
        method: "DELETE",
        params: {
          id: id,
        },
      },
      true
    );
  };

  // Navigate hook for redirecting after deletion
  let navigate = useNavigate();

  // Effect to handle response after deletion request
  useEffect(() => {
    if (apiResponseDeleteData) {
      setShow(false);
      const path = title === "Preset" ? "/savedpreset" : "/";
      setSnackbar((pre: any) => ({
        ...pre,
        open: true,
        severity: "success",
        message: `${title} deleted successfully.`,
      }));
      navigate(path, {
        state: {
          refresh: id,
        },
      });
    }
    if (errorDeletingData) {
      setShow(false);
      setSnackbar((pre: any) => ({
        ...pre,
        open: true,
        severity: "error",
        message: `Error deleting ${title.toLowerCase()}. Please try again.`,
      }));
    }
  }, [errorDeletingData, apiResponseDeleteData]);

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
        id="download-popup"
      >
        <b>{`Delete ${title}`}</b>
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
          {deletingData ? (
            // Display a spinner while deleting data
            <CircularProgress />
          ) : (
            <Button
              variant="contained"
              type="submit"
              className="w-32"
              onClick={handleSubmit}
              color="error"
            >
              Delete
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationPopup;
