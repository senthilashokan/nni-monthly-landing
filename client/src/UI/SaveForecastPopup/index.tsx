import { useState, useMemo } from "react";
import { Box, Dialog, DialogTitle, DialogContent, Button } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";

// Interface for SaveForecastPopup component
interface SaveForecastPopupInterface {
  show: boolean;
  setShow: any;
  forecastInfo: any;
  setSelectedForecastValue: any;
  setSelectedForecastData: any;
  fileData: any;
  compareForecastData: any;
  isCompareToggle: boolean;
}

// Functional component for rendering a dialog to save forecast
const SaveForecastPopup = (props: SaveForecastPopupInterface) => {
  const {
    show,
    setShow,
    forecastInfo,
    setSelectedForecastValue,
    setSelectedForecastData,
    fileData,
    compareForecastData,
    isCompareToggle,
  } = props; // Destructuring props

  // State to store forecast data to be saved
  const [forecastDataToSave, setForecastDataToSave] = useState<any>([]);

  // Memoizing forecast data to be saved based on fileData and compareForecastData
  useMemo(() => {
    const newData = [fileData.map((item: { FORECAST: any }) => item.FORECAST)];
    setForecastDataToSave(newData);
  }, [fileData, isCompareToggle]);

  useMemo(() => {
    if (compareForecastData) {
      const newData = [
        ...forecastDataToSave,
        compareForecastData.map((item: { FORECAST: any }) => item.FORECAST),
      ];
      setForecastDataToSave(newData);
    }
  }, [compareForecastData]);

  // State to store selected forecast value
  const [value, setValue] = useState(0);

  // Array of forecast colors
  const forecastColor = ["#FF7F0E", "#2ca02c", "#d62727", "#9467bd"];

  // Handler for radio button change
  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(parseInt((event.target as HTMLInputElement).value));
  };

  // Function to save forecast data
  const saveForecast = () => {
    setSelectedForecastValue(forecastInfo[value]);

    const updatedFiledata = fileData.map(
      (item: any, index: string | number) => ({
        ...item,
        FORECAST: forecastDataToSave[value][index],
      })
    );

    setSelectedForecastData(updatedFiledata);
    setShow(false);
  };

  return (
    <Dialog
      onClose={() => setShow(false)}
      aria-labelledby="download-file-dialog"
      open={show}
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
            {forecastInfo.map((item: any, index: number) => {
              let label = `Forecast${index + 1}:  ${item}`;
              return (
                <FormControlLabel
                  key={index}
                  value={index}
                  control={<Radio />}
                  label={label}
                  sx={{ color: forecastColor[index] }}
                />
              );
            })}
          </RadioGroup>
        </FormControl>
        {/* Button Group */}
        <Box className="w-full flex justify-center mt-5">
          {/* Back Button */}
          <Button
            className="w-32 !mr-10"
            variant="outlined"
            onClick={() => setShow(false)}
          >
            Back
          </Button>
          {/* Save Button */}
          <Box className="min-w-36">
            <Button fullWidth variant="contained" onClick={saveForecast}>
              Save
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SaveForecastPopup;
