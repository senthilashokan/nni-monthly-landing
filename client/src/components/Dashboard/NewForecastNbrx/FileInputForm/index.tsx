import { Box, Breadcrumbs, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useState } from "react";
import * as XLSX from "xlsx";

const FileInputForm = (props: any) => {
  const { setInputView } = props;
  const [fileInputData, setfileInputData] = useState<{
    trxFileName: string | null;
    nbrxFileName: string | null;
  }>({
    trxFileName: null,
    nbrxFileName: null,
  });

  // const [primaryFileName, setPrimaryFileName] = useState('');
  // const [supportingFileName, setSupportingFileName] = useState('');
  const [df1Trx, setDf1Trx] = useState<{
    columns: string[];
    index: string[];
    data: any[];
  }>({
    columns: [],
    index: [],
    data: [],
  });
  const [df2Nbrx, setDf2Nbrx] = useState({
    columns: [],
    index: [],
    data: [],
  });

  // Function to convert Excel serial to date
  const excelSerialToDate = (serial: number) => {
    const millisecondsPerDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
    const excelStartDate = new Date("1900-01-01"); // Excel start date

    // Calculate the number of days from Excel start date to the given serial
    const daysSinceExcelStart = serial - 2;

    // Calculate the milliseconds offset from Excel start date
    const millisecondsOffset = daysSinceExcelStart * millisecondsPerDay;

    // Create a new Date object with the calculated offset
    const date = new Date(excelStartDate.getTime() + millisecondsOffset);

    // Return the date in ISO format
    return date.toISOString().split("T")[0]; // Extract date part in ISO format
  };

  // Function to handle file input change for primary forecast file
  const handlePrimaryFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file) setfileInputData((pre) => ({ ...pre, trxFileName: file.name }));
    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryString = event.target?.result;
      const workbook = XLSX.read(binaryString, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        dateNF: "yyyy-mm-dd",
      });
      const fileState: any = {
        columns: [],
        index: [],
        data: [],
      };
      excelData?.forEach((row: any, i) => {
        if (i === 0) {
          row.forEach((item: any) => {
            fileState.columns.push(item);
          });
        } else {
          row[0] = `${excelSerialToDate(row[0])}T00:00:00.000`;
          fileState.data.push(row);
          fileState.index.push(i - 1);
        }
      });
      setDf1Trx(fileState);
    };
    reader.readAsBinaryString(file);
  };

  // Function to handle file input change for supporting variable file
  const handleSupportingFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file) setfileInputData((pre) => ({ ...pre, nbrxFileName: file.name }));
    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryString = event.target?.result;
      const workbook = XLSX.read(binaryString, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        dateNF: "yyyy-mm-dd",
      });
      const fileState: any = {
        columns: [],
        index: [],
        data: [],
      };

      excelData.forEach((row: any, i) => {
        if (i === 0) {
          row.forEach((item: any) => {
            fileState.columns.push(item);
          });
        } else {
          row[0] = `${excelSerialToDate(row[0])}T00:00:00.000`;
          fileState.data.push(row);
          fileState.index.push(i - 1);
        }
      });
      setDf2Nbrx(fileState);
    };
    reader.readAsBinaryString(file);
  };

  const handleProcedeButtonClick = () => {
    setInputView((pre: any) => ({
      ...pre,
      showFileInput: false,
      inputData: {
        ...pre.inputData,
        primaryFileName: fileInputData.trxFileName,
        secondaryFileName: fileInputData.nbrxFileName,
        history_trx_df: JSON.stringify(df1Trx),
        history_nbrx_df: JSON.stringify(df2Nbrx),
      },
    }));
  };
  return (
    <Box className=" min-h-screen bg-gray-100 p-6 space-y-4">
      <div>
        <nav className=" text-md mb-2">
          <div className="pl-2">
            <Breadcrumbs aria-label="breadcrumb">
              <Link to="/" className="text-sky-800">
                Dashboard
              </Link>
              <Typography color="text.primary">New forecast</Typography>
            </Breadcrumbs>
          </div>
        </nav>
        <h2 className="text-lg font-semibold">New Forecast</h2>
        <p className="text-gray-500 text-sm">
          This tool optimizes forecast based on Mean absolute error.
        </p>
      </div>
      <div>
        <div className="mb-5">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Primary Forecast File{" "}
            <span className="text-md font-medium text-red-700 mb-2">*</span>
          </p>

          <div className="flex items-center space-x-4">
            <label
              htmlFor="primary-file-upload"
              className="flex items-center justify-center bg-white border border-gray-300 rounded-lg cursor-pointer py-2 px-4 w-full"
            >
              <input
                id="primary-file-upload"
                type="file"
                accept=".csv,.xls,.xlsx"
                className="hidden"
                onChange={handlePrimaryFileChange}
              />
              {fileInputData.trxFileName ? (
                <span className="text-green-600">
                  {fileInputData.trxFileName}
                </span>
              ) : (
                <>
                  <span className="mr-2">
                    <i className="bi bi-upload"></i>
                  </span>
                  <span>Upload Trx File</span>
                </>
              )}
            </label>
            {/* )} */}
          </div>
        </div>

        {/* {!isUploadedFromDB && ( */}
        <div className="mb-5">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Supporting Variable File{" "}
            <span className="text-md font-medium text-red-700 mb-2">*</span>
          </p>
          <div className="flex items-center space-x-4">
            <label
              htmlFor="supporting-file-upload"
              className="flex items-center justify-center bg-white border border-gray-300 rounded-lg cursor-pointer py-2 px-4 w-full"
            >
              <input
                id="supporting-file-upload"
                type="file"
                accept=".csv,.xls,.xlsx"
                className="hidden"
                onChange={handleSupportingFileChange}
              />
              {fileInputData.nbrxFileName ? (
                <span className="text-green-600">
                  {fileInputData.nbrxFileName}
                </span>
              ) : (
                <>
                  <span className="mr-2">
                    <i className="bi bi-upload"></i>
                  </span>
                  <span>Upload Nbrx File</span>
                </>
              )}
            </label>
          </div>
        </div>
        <div className="mb-5 flex justify-end">
          <Button
            disabled={
              fileInputData.trxFileName == null ||
              fileInputData.nbrxFileName == null
            }
            onClick={handleProcedeButtonClick}
            variant="contained"
          >
            Proceed
          </Button>
        </div>
      </div>
    </Box>
  );
};

export default FileInputForm;
