import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
const SummaryOutput = (props: any) => {
  const { handleView, dataForSummary } = props;

  return (
    <Box className=" h-full p-3 space-y-4">
      {/* Edit summary input button */}
      <Box className="w-full flex justify-end">
        <Tooltip title="Edit Summary Input">
          <IconButton
            aria-label="Edit Summary Input"
            size="small"
            onClick={handleView}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      {/* Metric values section */}
      <Typography className="mb-5" variant="h5">
        Metric Values
      </Typography>
      {/* Display table for metric values */}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead
            sx={{
              borderBottom: "1px solid #0208b0",
            }}
          >
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", fontSize: "1.0rem" }}>
                Brand
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", fontSize: "1.0rem" }}
                align="left"
              >
                Forecast Name
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", fontSize: "1.0rem" }}
                align="left"
              >
                Model
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", fontSize: "1.0rem" }}
                align="left"
              >
                Forecast TRx {new Date().getFullYear()}
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", fontSize: "1.0rem" }}
                align="left"
              >
                Forecast TRx {new Date().getFullYear() + 1}
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", fontSize: "1.0rem" }}
                align="left"
              >
                Forecast NBRx {new Date().getFullYear()}
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", fontSize: "1.0rem" }}
                align="left"
              >
                Forecast NBRx {new Date().getFullYear() + 1}
              </TableCell>
            </TableRow>
          </TableHead>

          {Object.keys(dataForSummary).map(
            (brandName: any, brandNameIndex: number) => (
              <>
                <TableBody key={brandNameIndex}>
                  {dataForSummary[brandName].map(
                    (forecastData: any, fdIndex: number) =>
                      forecastData["isSelected"] && (
                        <>
                          <TableRow
                            key={fdIndex}
                            sx={{
                              "&:last-child td, &:last-child th": {
                                border: 0,
                              },
                              borderBottom: "1px solid #0208b0",
                            }}
                          >
                            <TableCell
                              key={`TC1${fdIndex}`}
                              component="th"
                              scope="row"
                            >
                              {brandName}
                            </TableCell>
                            <TableCell
                              key={`TC2${fdIndex}`}
                              component="th"
                              scope="row"
                            >
                              {forecastData["forecastName"]}
                            </TableCell>
                            <TableCell
                              key={`TC3${fdIndex}`}
                              component="th"
                              scope="row"
                            >
                              {forecastData["modelName"] +
                                `${
                                  forecastData["modelType"] == "Bounded"
                                    ? `[${forecastData["bounds"][0]},${forecastData["bounds"][1]}]`
                                    : ""
                                }`}
                            </TableCell>
                            <TableCell
                              key={`TC4${fdIndex}`}
                              component="th"
                              scope="row"
                            >
                              {forecastData["currentYearTrxForecast"]}
                            </TableCell>
                            <TableCell
                              key={`TC5${fdIndex}`}
                              component="th"
                              scope="row"
                            >
                              {forecastData["nextYearTrxForecast"]}
                            </TableCell>
                            <TableCell
                              key={`TC6${fdIndex}`}
                              component="th"
                              scope="row"
                            >
                              {forecastData["currentYearNbrxForecast"]}
                            </TableCell>
                            <TableCell
                              key={`TC7${fdIndex}`}
                              component="th"
                              scope="row"
                            >
                              {forecastData["nextYearNbrxForecast"]}
                            </TableCell>
                          </TableRow>
                          {/* {fdIndex === dataForSummary[brandName].length - 1 && (
                            
                          )} */}
                        </>
                      )
                  )}
                  {/* <Divider className=" text-blue-600 bg-blue-600" /> */}
                </TableBody>
              </>
            )
          )}

          {/* <br />
          <TableBody>
            {Object.keys(dataForSummary).map(
              (brandName: any, brandNameIndex: number) => {
                return dataForSummary[brandName].map(
                  (forecastData: any, fdIndex: number) => {
                    return (
                      forecastData["isSelected"] && (
                        <TableRow
                          key={fdIndex}
                          sx={
                            brandNameIndex % 2 === 0
                              ? {
                                  "&:last-child td, &:last-child th": {
                                    border: 0,
                                  },

                                  backgroundColor: "#f0f6fa",
                                }
                              : {
                                  "&:last-child td, &:last-child th": {
                                    border: 0,
                                  },
                                }
                          }
                        >
                          <TableCell component="th" scope="row">
                            {brandName}
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {forecastData["forecastName"]}
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {forecastData["modelName"]}
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {forecastData["currentYearTrxForecast"]}
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {forecastData["nextYearTrxForecast"]}
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {forecastData["currentYearNbrxForecast"]}
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {forecastData["nextYearNbrxForecast"]}
                          </TableCell>
                        </TableRow>
                      )
                    );
                  }
                );
              }
            )}
          </TableBody> */}
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SummaryOutput;
