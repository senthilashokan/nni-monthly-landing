import { useEffect, useState, useContext } from "react";
import {
  MenuItem,
  Select,
  Button,
  Breadcrumbs,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { useRequest } from "@src/hook/useRequest/useRequest";
import Loader from "@src/UI/Loader";
import { UserContext } from "@src/App";

// Interface for FileInputForm props
interface FileInputInterface {
  setFileInputView: Function;
}

// FileInputForm component
const FileInputForm = (props: FileInputInterface) => {
  const { setFileInputView } = props;
  const { setSnackbar } = useContext(UserContext);

  // State variables
  const [isUploadedFromDB, setIsUploadedFromDB] = useState(false);
  const [isMetaDataAvailable, setIsMetaDataAvailable] = useState(false);
  const [dbTableNames, setDbTableNames] = useState<any>(null);
  const [primaryFileName, setPrimaryFileName] = useState("");
  const [supportingFileName, setSupportingFileName] = useState("");
  const [df1, setDf1] = useState<{
    columns: string[];
    index: string[];
    data: any[];
  }>({
    columns: [],
    index: [],
    data: [],
  });
  const [df2, setDf2] = useState({
    columns: [],
    index: [],
    data: [],
  });

  const [
    fetchDatabaseTableNames,
    fetchingDatabaseTableNames,
    errorFetchingDatabaseTableNames,
    DatabaseTableNamesAPIResponse,
  ] = useRequest();

  const [
    fetchMetaData,
    fetchingMetaData,
    errorFetchingMetaData,
    metaDataAPIResponse,
    resetMetaData,
  ] = useRequest();

  useEffect(() => {
    if (metaDataAPIResponse) {
      setIsMetaDataAvailable(true);
    }
    if (errorFetchingMetaData) {
      resetMetaData();
      setIsMetaDataAvailable(false);
      setSnackbar((pre: any) => ({
        ...pre,
        open: true,
        severity: "error",
        message: `Unable to fetch meta data for ${primaryFileName} table from database. Please try again.`,
      }));
    }
  }, [errorFetchingMetaData, metaDataAPIResponse]);

  // Function to handle Proceed button click
  const handleProcedeButtonClick = async () => {
    // Setting file input view state

    setFileInputView((fileInputView: any) => ({
      ...fileInputView,
      isUploadedFromDB,
      featureListFromDbWithEndDates: isUploadedFromDB
        ? metaDataAPIResponse?.data.body.primaryFeatures
        : {},
      showFileInputForm: false,
      primaryFileName: primaryFileName,
      supportingFileName: supportingFileName,
      df1: isUploadedFromDB
        ? {
            columns: Object.keys(
              metaDataAPIResponse?.data.body.primaryFeatures
            ),
            index: [],
            data: [],
          }
        : df1,
      df2: df2,
    }));
  };

  const handleDBFileUpload = () => {
    fetchDatabaseTableNames(
      {
        url: `${import.meta.env.VITE_API_BASE_URL}/haystack-tables`,
      },
      true
    );
  };

  useEffect(() => {
    if (DatabaseTableNamesAPIResponse) {
      setDbTableNames(DatabaseTableNamesAPIResponse.data.body);
      setIsUploadedFromDB(true);
    }
    if (errorFetchingDatabaseTableNames) {
      setSnackbar((pre: any) => ({
        ...pre,
        open: true,
        severity: "error",
        message: `Unable to fetch table names from database. Please try again.`,
      }));
    }
  }, [
    errorFetchingDatabaseTableNames,
    DatabaseTableNamesAPIResponse,
    errorFetchingMetaData,
  ]);

  useEffect(() => {
    if (isUploadedFromDB && primaryFileName != "") {
      fetchMetaData(
        {
          url: `${import.meta.env.VITE_API_BASE_URL}/haystack-meta-data`,
          method: "POST",
          data: { primary_table: primaryFileName },
        },
        true
      );
    }
  }, [primaryFileName]);
  useEffect(() => {
    if (isUploadedFromDB && dbTableNames.length > 0) {
      setPrimaryFileName(dbTableNames[0]);
    }
  }, [dbTableNames]);

  const handleLocalFileUpload = () => {
    setIsUploadedFromDB(false);
    setPrimaryFileName("");
  };

  // Function to convert Excel serial to date
  const excelSerialToDate = (serial: number) => {
    const millisecondsPerDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
    const excelStartDate = new Date("1900-01-01"); // Excel start date

    // Calculate the number of days from Excel start date to the given serial
    const daysSinceExcelStart = serial - 1;

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
    if (file) setPrimaryFileName(file.name);
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
          if (!row[1]) {
            return;
          } else {
            row[0] = `${excelSerialToDate(row[0])}T00:00:00.000Z`;
            fileState.data.push(row);
            fileState.index.push(i - 1);
          }
        }
      });
      setDf1(fileState);
    };
    reader.readAsBinaryString(file);
  };

  // Function to handle file input change for supporting variable file
  const handleSupportingFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file) setSupportingFileName(file.name);
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
          row[0] = `${excelSerialToDate(row[0])}T00:00:00.000Z`;
          fileState.data.push(row);
          fileState.index.push(i - 1);
        }
      });
      setDf2(fileState);
    };
    reader.readAsBinaryString(file);
  };

  // Rendering JSX
  return (
    <div className=" min-h-screen bg-gray-100 p-6 space-y-4">
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
      {fetchingDatabaseTableNames || fetchingMetaData ? (
        <Loader />
      ) : (
        <div>
          <div className="mb-5">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Primary Forecast File{" "}
              <span className="text-md font-medium text-red-700 mb-2">*</span>
            </p>

            <div className="flex items-center space-x-4">
              {isUploadedFromDB ? (
                <Select
                  labelId="feature"
                  id="feature"
                  variant="outlined"
                  placeholder="Please select a feature"
                  onChange={(e) => {
                    setPrimaryFileName(e.target.value);
                  }}
                  sx={{
                    backgroundColor: "white",
                  }}
                  fullWidth
                  value={primaryFileName ? primaryFileName : dbTableNames[0]}
                >
                  {dbTableNames.map((tableName: string, index: number) => {
                    return (
                      <MenuItem value={tableName} key={index}>
                        {tableName}
                      </MenuItem>
                    );
                  })}
                </Select>
              ) : (
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
                  {primaryFileName ? (
                    <span className="text-green-600">{primaryFileName}</span>
                  ) : (
                    <>
                      <span className="mr-2">
                        <i className="bi bi-upload"></i>
                      </span>
                      <span>Upload Primary File</span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>

          {!isUploadedFromDB && (
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
                  {supportingFileName ? (
                    <span className="text-green-600">{supportingFileName}</span>
                  ) : (
                    <>
                      <span className="mr-2">
                        <i className="bi bi-upload"></i>
                      </span>
                      <span>Upload Supporting File</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          )}

          <Link
            to=""
            onClick={
              isUploadedFromDB ? handleLocalFileUpload : handleDBFileUpload
            }
            className="text-sky-800 text-lg underline"
          >
            {isUploadedFromDB
              ? "Or Upload Files Locally "
              : "Or Upload Files From Database"}
          </Link>
        </div>
      )}

      <div className="mb-5 flex justify-end">
        <Button
          disabled={
            isUploadedFromDB
              ? !isMetaDataAvailable
              : !primaryFileName || !supportingFileName
          }
          onClick={handleProcedeButtonClick}
          variant="contained"
        >
          Proceed
        </Button>
      </div>
    </div>
  );
};

export default FileInputForm;
