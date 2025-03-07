import { useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { monthNames } from "@src/data/constants";

interface TrackingOutputInterface {
  compareForecastOutputView: any;
}

const TrackingOutput = (props: TrackingOutputInterface) => {
  const { compareForecastOutputView } = props;

  // Calculate actualSum and approvedBudgetSum using useMemo to avoid unnecessary recalculations
  const { actualSum, approvedBudgetSum } = useMemo(() => {
    let actualSum = 0;
    let approvedBudgetSum = 0;
    if (compareForecastOutputView.BudgetValues.length !== 0) {
      compareForecastOutputView.BudgetValues.map((values: any) => {
        actualSum += values[0];
        approvedBudgetSum += values[1];
      });
    }
    return { actualSum, approvedBudgetSum };
  }, [compareForecastOutputView.BudgetValues]);

  // Calculate forecastsSum and error percentages using useMemo
  const { forecastsSum } = useMemo(() => {
    let forecastsSum: any = [];
    if (compareForecastOutputView.forecastData.length !== 0) {
      compareForecastOutputView.forecastData.map((forecastDataArray: []) => {
        let sum = 0;
        let errorSum = 0;
        let errorCount = 0;
        forecastDataArray.map((forecastValue: number, j: number) => {
          sum += forecastValue;
          if (
            forecastValue !== null &&
            compareForecastOutputView.BudgetValues[j][0] !== null
          ) {
            const act = compareForecastOutputView.BudgetValues[j][0];
            errorSum += Math.abs(
              Math.round(((act - forecastValue) / act) * 100)
            );
            errorCount += 1;
          }
        });
        forecastsSum.push(sum.toFixed(1));
        forecastsSum.push(Math.round(errorSum / errorCount));
      });
    }
    return { forecastsSum };
  }, [compareForecastOutputView.forecastData]);

  return (
    <Box>
      {/* Additional information */}
      <p className="p-1 ml-4 text-xs">
        * Percentage values are calculated for error identifications
      </p>
      <p className="p-1 ml-4 text-xs">* All values are in Million US Dollars</p>

      {/* Displaying forecast names */}
      <Box className="flex">
        <p className="p-1  ml-4 text-xs"> * ACT - Actual,</p>
        {compareForecastOutputView.forecastNames.map(
          (item: string, index: number) => {
            return (
              <p className="p-1 ml-1 text-xs " key={index}>
                FCT {index + 1} - "{item.split("&")[0]}"
              </p>
            );
          }
        )}
      </Box>

      {/* Table section */}
      <Box className="p-8">
        <Paper>
          <Table stickyHeader size="small" aria-label="forecast table">
            <TableHead key={"head"}>
              <TableRow key={"row1"}>
                {/* Table headers */}
                <TableCell
                  key="MONTH"
                  className="font-bold"
                  align="center"
                ></TableCell>
                <TableCell key={`ACT`} className="font-bold" align="center">
                  <p className="text-lg">{`ACT`}</p>
                </TableCell>
                <TableCell
                  key={`Approved budget`}
                  className="font-bold"
                  align="center"
                >
                  <p className="text-lg">{`Approved budget`}</p>
                </TableCell>
                {/* Forecast headers */}
                {compareForecastOutputView.forecastData.map(
                  (_: any, index: number) => {
                    return (
                      <>
                        <TableCell
                          key={index}
                          className="font-bold"
                          align="center"
                        >
                          <p className="text-lg">{`FCT${index + 1}`}</p>
                        </TableCell>
                        <TableCell
                          key={index + 10}
                          className="font-bold"
                          align="center"
                        >
                          <p className="text-lg text-red-700">{`Error`}</p>
                        </TableCell>
                      </>
                    );
                  }
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Rows for each month */}
              {monthNames?.map((month, i) => (
                <TableRow
                  key={i}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell align="center" component="th" scope="row">
                    <p className="text-lg">{month}</p>
                  </TableCell>
                  <TableCell align="center" component="th" scope="row">
                    {/* Actual values */}
                    {compareForecastOutputView.BudgetValues[i][0] === null ? (
                      <p className="text-lg">-</p>
                    ) : (
                      <p className="text-lg">
                        {compareForecastOutputView.BudgetValues[i][0]}
                      </p>
                    )}
                  </TableCell>
                  <TableCell align="center" component="th" scope="row">
                    {/* Approved budget values */}
                    <p className="text-lg">
                      {compareForecastOutputView.BudgetValues[i][1]}
                    </p>
                  </TableCell>
                  {/* Forecasted values and error percentages */}
                  {compareForecastOutputView.forecastData.map(
                    (forecastValues: any) => {
                      return (
                        <>
                          <TableCell align="center" component="th" scope="row">
                            {forecastValues[i] === null ||
                            forecastValues[i] === undefined ? (
                              <p className="text-lg">-</p>
                            ) : (
                              <p className="text-lg">{forecastValues[i]}</p>
                            )}
                          </TableCell>
                          <TableCell align="center" component="th" scope="row">
                            {compareForecastOutputView.BudgetValues[i][0] ===
                              null || forecastValues[i] == null ? (
                              <p className="text-lg text-red-700">-</p>
                            ) : (
                              <p className="text-lg text-red-700">
                                {Math.abs(
                                  Math.round(
                                    ((compareForecastOutputView.BudgetValues[
                                      i
                                    ][0] -
                                      forecastValues[i]) /
                                      compareForecastOutputView.BudgetValues[
                                        i
                                      ][0]) *
                                      100
                                  )
                                )}
                                %
                              </p>
                            )}
                          </TableCell>
                        </>
                      );
                    }
                  )}
                </TableRow>
              ))}
              {/* Total row */}
              <TableRow
                key={100}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell align="center" component="th" scope="row">
                  <p className="text-lg">Total</p>
                </TableCell>
                <TableCell align="center" component="th" scope="row">
                  <p className="text-lg">{actualSum.toFixed(1)}</p>
                </TableCell>
                <TableCell align="center" component="th" scope="row">
                  <p className="text-lg">{approvedBudgetSum.toFixed(1)}</p>
                </TableCell>
                {/* Displaying forecastsSum and error percentages */}
                {forecastsSum.map((sum: number, index: number) => {
                  if (index % 2 === 0) {
                    return (
                      <TableCell align="center" component="th" scope="row">
                        <p className="text-lg">{sum}</p>
                      </TableCell>
                    );
                  } else {
                    return (
                      <TableCell align="center" component="th" scope="row">
                        <p className="text-lg text-red-700">{sum}%</p>
                      </TableCell>
                    );
                  }
                })}
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      </Box>
      {/* Remarks section */}
      <p className="mt-5 text-lg">Remarks:</p>
      <p className="text-sm">
        -Monthwise error percentage is calculated by ((|Actual value-Forcasted
        value|)/Actual*100)
      </p>
      <p className="text-sm">
        -Aggregate error percentage is calculated by (Sum of all errors of a
        forecast/No. of errors)
      </p>
    </Box>
  );
};

export default TrackingOutput;
