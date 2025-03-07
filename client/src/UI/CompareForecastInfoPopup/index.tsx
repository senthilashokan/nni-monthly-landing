import { Dialog, DialogTitle } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

// Interface for props
interface CompareForecastInfoPopupInterface {
  show: boolean;
  setShow: any;
  forecastInfo: any;
}

// Component for displaying a popup dialog with comparison forecast information
const CompareForecastInfoPopup = (props: CompareForecastInfoPopupInterface) => {
  // Destructuring props
  const { show, setShow, forecastInfo } = props;

  // Colors for displaying forecast information
  const forecastColor = ["#FF7F0E", "#2ca02c", "#d62727", "#9467bd"];

  return (
    // Dialog component for displaying comparison forecast information
    <Dialog
      onClose={() => {
        setShow(false);
      }}
      aria-labelledby="forecast-info-dialog"
      open={show}
      key={"forecast-info-dialog"}
    >
      {/* Dialog title */}
      <DialogTitle
        className="flex justify-center w-[500px] "
        sx={{ m: 0, p: 2 }}
        id="download-popup"
      >
        <b>Compared Forecast Info</b>
      </DialogTitle>
      {/* Close button */}
      <IconButton
        aria-label="close"
        onClick={() => setShow(false)}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      {/* Displaying forecast information */}
      {forecastInfo.map((item: any, index: any) => {
        let label = `Forecast${index + 1}:  ${item}`;
        return (
          <p className="p-2 " style={{ color: forecastColor[index] }}>
            {label}
          </p>
        );
      })}
    </Dialog>
  );
};

export default CompareForecastInfoPopup;
