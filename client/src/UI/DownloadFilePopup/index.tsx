import { useEffect, useState, useMemo } from "react";
import {
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { DownloadFileValidation } from "@src/lib/validation";
import XLSX from "xlsx";
import * as FileSaver from "file-saver";

// Interface for props
interface DownloadFilePopupInterface {
  show: boolean; // Whether the download file popup should be displayed
  setShow: any; // Function to control the display of the download file popup
  downloadFileName: string; // Name of the file to be downloaded
  fileData: any; // Data to be downloaded
  isCompareToggle: boolean; // Whether compare mode is toggled
  compareForecastData: any; // Data for comparison
  isCompare?: boolean; // Whether comparison mode is enabled
}

const DownloadFilePopup = (props: DownloadFilePopupInterface) => {
  const {
    downloadFileName,
    fileData,
    show,
    setShow,
    isCompareToggle,
    compareForecastData,
    isCompare,
  } = props;

  // State to store formatted file data
  const [newFileData, setNewFileData] = useState<any>([]);
  const [forecastCount, setForecastCount] = useState(2);

  // Effect to update newFileData when fileData changes
  useEffect(() => {
    if (isCompareToggle && !(sessionStorage.getItem("User_group") == "NBRX")) {
      let formattedData = fileData.map((item: any) => ({
        MONTH: item.MONTH,
        ACTUAL: item.ACTUAL,
        FORECAST1: item.FORECAST,
      }));
      setNewFileData(formattedData);
      setForecastCount(2);
    }
  }, [fileData, isCompareToggle]);

  // Effect to update newFileData when compareForecastData changes
  useMemo(async () => {
    if (isCompareToggle && !(sessionStorage.getItem("User_group") == "NBRX")) {
      let newData;
      if (compareForecastData && isCompareToggle) {
        newData = newFileData.map((item: any, index: string | number) => ({
          ...item,
          [`FORECAST${forecastCount}`]: compareForecastData[index].FORECAST,
        }));
        setForecastCount(forecastCount + 1);
      }
      setNewFileData(newData);
    }
  }, [compareForecastData]);

  // Effect to format fileData and compareForecastData when in comparison mode
  useEffect(() => {
    if (isCompare) {
      let formatedData = fileData.map((item: any) => ({
        MONTH: item.MONTH,
        ACTUAL: item.ACTUAL,
        FORECAST1: item.FORECAST,
      }));
      setNewFileData(formatedData);
      const updateNewData = async () => {
        await Promise.all(
          compareForecastData.map((forecastData: any, index: number) => {
            setNewFileData((prevData: any) =>
              prevData.map((row: any, i: number) => ({
                ...row,
                [`FORECAST${index + 2}`]: forecastData[i].FORECAST,
              }))
            );
          })
        );
      };

      updateNewData();
    }
  }, [compareForecastData]);

  // React Hook Form for form validation and submission
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    mode: "all",
    defaultValues: {
      name: downloadFileName,
    },
    resolver: zodResolver(DownloadFileValidation),
  });

  // Function to handle closing the popup
  const onClose = () => {
    setShow(false);
  };

  // Function to handle form submission
  const onSubmitForm = async (values: { name: string }) => {
    const fileType =
      "application/vnd.openxmlformats-officedocuments-officedocument.spreadsheetml.sheet;Charset-UTF-8";
    const fileExtension = ".xlsx";
    let worksheet;
    if (sessionStorage.getItem("User_group") == "NBRX") {
      const fileDataNbrx: any[] = [];
      let nullArrayTrxHistory = Array.from(
        { length: fileData.TrxHistory.length },
        () => null
      );
      let TrxForecastWithNull = nullArrayTrxHistory.concat(
        fileData.TrxForecast
      );

      let nullArrayNbrxHistory = Array.from(
        { length: fileData.NbrxHistory.length },
        () => null
      );
      let NbrxForecastWithNull = nullArrayNbrxHistory.concat(
        fileData.NbrxForecast
      );
      fileData.Date.map((date: string, index: number) => {
        let tempData = {
          Date: date,
          TrxHistory: fileData.TrxHistory[index],
          TrxForecast: TrxForecastWithNull[index],
          NbrxHistory: fileData.NbrxHistory[index],
          [`NbrxForecast ${fileData.ModelName} ${
            fileData.ModelType == "Bounded"
              ? `[${fileData.Bounds[0]},${fileData.Bounds[1]}]`
              : ""
          }`]: NbrxForecastWithNull[index],
        };
        if (isCompareToggle) {
          compareForecastData.ModelNames.map(
            (ModelName: string, index2: number) => {
              let nullArrayNbrxHistory = Array.from(
                { length: compareForecastData.NbrxHistoryArray[index2].length },
                () => null
              );

              let NbrxForecastWithNull = nullArrayNbrxHistory.concat(
                compareForecastData.NbrxForecasts[index2]
              );
              tempData[
                `NbrxForecast ${index2 + 1} ${ModelName} ${
                  compareForecastData.ModelTypes[index2] == "Bounded"
                    ? `[${compareForecastData.BoundsArray[index2][0]},${compareForecastData.BoundsArray[index2][1]}]`
                    : ""
                }`
              ] = NbrxForecastWithNull[index];
            }
          );
        }

        fileDataNbrx.push(tempData);
      });

      worksheet = XLSX.utils.json_to_sheet(fileDataNbrx);
    } else {
      worksheet = XLSX.utils.json_to_sheet(
        isCompareToggle || isCompare ? newFileData : fileData
      );
    }

    const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, values.name + fileExtension);
    onClose();
  };

  return (
    <Dialog
      onClose={onClose}
      aria-labelledby="download-file-dialog"
      open={show}
    >
      <DialogTitle
        className="flex justify-center w-[500px] "
        sx={{ m: 0, p: 2 }}
        id="download-popup"
      >
        <b>Download Forecast Data</b>
      </DialogTitle>
      <span className="flex justify-center w-full">
        You're all set! Please name your file to download it.
      </span>
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
      <DialogContent>
        {/* Form for entering file name */}
        <form onSubmit={handleSubmit(onSubmitForm)}>
          {/* Controller for controlled TextField */}
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                error={!!errors.name}
                fullWidth
                id="outlined-basic"
                label=""
                type="text"
                variant="outlined"
                placeholder="Please name your file"
                helperText={errors.name?.message}
                {...field}
              />
            )}
          />

          <Box className="w-full flex justify-center mt-5">
            {/* Button for closing the popup */}
            <Button
              className="w-32 !mr-10"
              variant="outlined"
              onClick={onClose}
            >
              Back
            </Button>
            {/* Button for submitting the form */}
            <Button variant="contained" type="submit">
              Download
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadFilePopup;
