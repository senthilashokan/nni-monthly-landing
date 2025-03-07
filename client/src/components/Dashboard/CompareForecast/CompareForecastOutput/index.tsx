import { Box, Button } from "@mui/material";
// @ts-ignore
import BasicChart from "@src/UI/BasicChart";
import BasicTable from "@src/UI/BasicTable";
import { Download as DownloadIcon } from "@mui/icons-material";
import DownloadFilePopup from "@src/UI/DownloadFilePopup";
import { useState } from "react";
interface CompareForecastOutputInterface {
  compareForecastOutputView: any;
  duration: any;
  forecastNames: string[];
}

// CompareForecastOutput component
const CompareForecastOutput = (props: CompareForecastOutputInterface) => {
  // Destructuring props
  const { compareForecastOutputView, duration, forecastNames } = props;
  // State for showing file download popup
  const [showFileDownloadPopup, setShowFileDownloadPopup] = useState(false);

  return (
    <Box className="compareForecastOutputContainermin-h-screen">
      {" "}
      {/* Container for compare forecast output */}
      {/* DownloadFilePopup component */}
      <DownloadFilePopup
        show={showFileDownloadPopup}
        setShow={setShowFileDownloadPopup}
        downloadFileName={"Compare Forecast"}
        fileData={compareForecastOutputView.firstForecastData}
        isCompareToggle={false}
        isCompare={true}
        compareForecastData={compareForecastOutputView.compareForecastData}
      />
      {/* BasicChart component */}
      <BasicChart
        data={compareForecastOutputView.firstForecastData}
        isCompareToggle={false}
        isCompare={true}
        compareForecastData={compareForecastOutputView.compareForecastData}
      />
      {/* Button for download */}
      <Box className="flex justify-end m-4 ">
        <Button
          onClick={() => setShowFileDownloadPopup(true)}
          size="small"
          startIcon={<DownloadIcon />}
        >
          Download
        </Button>
      </Box>
      <p className="p-1 ml-4 text-xs">
        {" "}
        * All values are in Million US Dollars
      </p>
      {/* Displaying forecast names */}
      <Box className="flex">
        <p className="p-1  ml-4 text-xs"> * ACT - Actual,</p>
        {forecastNames.map((item: string, index: number) => {
          return (
            <p className="p-1 ml-1 text-xs " key={index}>
              FCT {index + 1} - "{item.split("&")[0]}"
            </p>
          );
        })}
      </Box>
      {/* Overflow container for BasicTable */}
      <div className="overflow-auto h-[300px] w-full">
        {/* BasicTable component */}
        <BasicTable
          data={compareForecastOutputView.firstForecastData}
          selectedYear={new Date(duration.toMonth).getFullYear()}
          isCompareToggle={false}
          isCompare={true}
          compareForecastData={compareForecastOutputView.compareForecastData}
        />
      </div>
    </Box>
  );
};

export default CompareForecastOutput;
