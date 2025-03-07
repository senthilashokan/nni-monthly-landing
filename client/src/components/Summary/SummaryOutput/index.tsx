import { useMemo } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import {
  Box,
  Paper,
  Tooltip,
  IconButton,
  Grid,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";

interface summaryOutputOutputInterface {
  summaryOutputView: {
    isShowForecastOutput: boolean;
    forecastData: any;
    budgetValues: any;
  };
  setSummaryOutputView: any;
}

const SummaryOutput = (props: summaryOutputOutputInterface) => {
  const { summaryOutputView, setSummaryOutputView } = props;

  // Calculate actual data of previous year
  const { actualDataOfPreviousYearArray } = useMemo(() => {
    let actualDataOfPreviousYearArray: number[] = [1, 2, 3];
    if (Object.keys(summaryOutputView.forecastData)) {
      actualDataOfPreviousYearArray = Object.keys(
        summaryOutputView.forecastData
      ).map((item: any) => {
        let d1: any = Object.values(summaryOutputView.forecastData[item]);

        let budgetValuesArray: any = [];
        d1[0].map((budgetValue: any) => {
          let d = budgetValue
            .filter((entry: any) => {
              const date = new Date(entry.MONTH);
              return date.getFullYear() === new Date().getFullYear() - 1;
            })
            .map((entry: any) => entry.ACTUAL);
          budgetValuesArray.push(d.flat());
        });

        budgetValuesArray = budgetValuesArray.map((innerArray: any) =>
          innerArray
            .reduce((sum: number, num: number) => sum + num, 0)
            .toFixed(1)
        );
        return budgetValuesArray;
      });
    }
    return { actualDataOfPreviousYearArray };
  }, [summaryOutputView.forecastData]);

  // Calculate forecast 1 and forecast 2 values

  const { forecast1ArrayTemp, forecast2ArrayTemp } = useMemo(() => {
    let forecast1ArrayTemp: any = [];
    let forecast2ArrayTemp: any = [];

    Object.keys(summaryOutputView.forecastData).map((_, key) => {
      let dataValues: any = Object.values(summaryOutputView.forecastData)[key];
      let forecastsData: Array<Array<any>> = Object.values(dataValues);
      forecastsData.map((forecatData, key) => {
        let filteredDataForCurrentYear = forecatData[0].filter((item: any) =>
          item.MONTH.endsWith("2024")
        );
        // Calculate the sum of ACTUAL and FORECAST values
        let sumActual = 0;
        let sumForecast = 0;

        filteredDataForCurrentYear.forEach((item: any) => {
          // Add ACTUAL value (treat null as 0)
          sumActual += item.ACTUAL || 0;

          // Add FORECAST value (treat null as 0)
          sumForecast += item.FORECAST || 0;
        });
        if (key == 0) {
          forecast1ArrayTemp.push((sumActual + sumForecast).toFixed(1));
          forecast2ArrayTemp.push(null);
        } else {
          forecast2ArrayTemp.pop();
          forecast2ArrayTemp.push((sumActual + sumForecast).toFixed(1));
        }
      });
    });

    return { forecast1ArrayTemp, forecast2ArrayTemp };
  }, [summaryOutputView.forecastData]);

  // Calculate total budget values for current year
  const { budgetValuesSumArray } = useMemo(() => {
    let budgetValuesSumArray: number[] = [10, 15, 20];
    if (Object.keys(summaryOutputView.budgetValues)) {
      budgetValuesSumArray = summaryOutputView.budgetValues.map(
        (innerArray: any) =>
          innerArray
            .reduce((sum: number, num: number) => sum + num, 0)
            .toFixed(1)
      );
    }
    return { budgetValuesSumArray };
  }, [summaryOutputView.budgetValues]);

  // Function to handle edit icon click
  const handleEditIcon = () => {
    setSummaryOutputView((prevState: any) => ({
      ...prevState,
      ["isShowForecastOutput"]: false,
    }));
  };

  return (
    <Box className=" h-full p-3 space-y-4">
      {/* Edit summary input button */}
      <Box className="w-full flex justify-end">
        <Tooltip title="Edit Summary Input">
          <IconButton
            aria-label="Edit Summary Input"
            size="small"
            onClick={handleEditIcon}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Box className="w-full grid">
        {/* Selected forecast section */}
        <Grid container direction="row" justifyContent="left" alignItems="left">
          <Grid justifyContent="left" alignItems="left">
            <Typography className="mb-5" variant="h5">
              Selected Forecast
            </Typography>
          </Grid>
        </Grid>
        {/* Display forecast data */}
        <Box className="w-full">
          {summaryOutputView.forecastData &&
          Object.keys(summaryOutputView.forecastData).length <= 0 ? (
            <></>
          ) : (
            <Grid container className="w-full ">
              {Object.keys(summaryOutputView.forecastData).map(
                (data: any, index: number) => {
                  return (
                    <Grid item xs={6} md={4} className="" key={index}>
                      <h3
                        className="pt-4 pl-2 text-base font-medium text-[#1F67F4]"
                        key={index + 10}
                      >
                        {data}
                      </h3>
                      <Box className="grid">
                        {summaryOutputView.forecastData[data] &&
                          Object.keys(summaryOutputView.forecastData[data]).map(
                            (
                              forecastName: string,
                              forecastNameIndex: number
                            ) => {
                              return (
                                <Box
                                  className="ml-2"
                                  display={"flex"}
                                  key={forecastNameIndex}
                                >
                                  {forecastName && (
                                    <>
                                      <p>{`Forecast -${
                                        forecastNameIndex + 1
                                      }`}</p>{" "}
                                      <DoneRoundedIcon
                                        fontSize="small"
                                        className="bg-slate-300 border-radius:0.25rem mt-1 mr-1 ml-1"
                                      />
                                      <p>{`${forecastName.split("&")[0]}`}</p>
                                    </>
                                  )}
                                </Box>
                              );
                            }
                          )}
                      </Box>
                    </Grid>
                  );
                }
              )}
            </Grid>
          )}
        </Box>
      </Box>
      {/* Metric values section */}
      <Typography className="mb-5" variant="h5">
        Metric Values
      </Typography>
      {/* Display table for metric values */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", fontSize: "1.0rem" }}>
                Primary Variable
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", fontSize: "1.0rem" }}
                align="center"
              >
                Actual Data of Previous year
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", fontSize: "1.0rem" }}
                align="center"
              >
                Approved Budget of Current Year
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", fontSize: "1.0rem" }}
                align="center"
              >
                Forecast 1
              </TableCell>

              {forecast2ArrayTemp.filter((data: number) => data != null)
                .length > 0 && (
                <TableCell
                  sx={{ fontWeight: "bold", fontSize: "1.0rem" }}
                  align="center"
                >
                  Forecast 2
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(summaryOutputView.forecastData).map(
              (primaryVariable: any, index: number) => (
                <TableRow
                  key={primaryVariable}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {primaryVariable}
                  </TableCell>
                  <TableCell align="center">
                    {actualDataOfPreviousYearArray[index]
                      ? `$${actualDataOfPreviousYearArray[index]}M`
                      : "-"}
                  </TableCell>

                  <TableCell align="center">
                    {" "}
                    {budgetValuesSumArray[index]
                      ? `$${budgetValuesSumArray[index]}M`
                      : "-"}
                  </TableCell>
                  <TableCell align="center">
                    {" "}
                    {forecast1ArrayTemp[index]
                      ? `$${forecast1ArrayTemp[index]}M`
                      : "-"}
                  </TableCell>

                  {forecast2ArrayTemp.filter((data: number) => data != null)
                    .length > 0 && (
                    <TableCell align="center">
                      {" "}
                      {forecast2ArrayTemp[index]
                        ? `$${forecast2ArrayTemp[index]}M`
                        : "-"}
                    </TableCell>
                  )}
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SummaryOutput;
