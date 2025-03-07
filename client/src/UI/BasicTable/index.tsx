import { useMemo, useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { monthNames } from "@src/data/constants";

const BasicTable = (props: any) => {
  const {
    data,
    selectedYear,
    isCompareToggle,
    compareForecastData,
    isCompare,
  } = props;

  // State to manage data for comparison view
  const [compareView, setCompareView] = useState<any>({
    currentYearData: [],
    nextYearData: [],
    currentYearForecastSum: [],
    nextYearForecastSum: [],
  });

  // Get current, previous, and next year
  const currentYear = new Date().getFullYear();
  const prevYear = new Date().getFullYear() - 1;
  const nextYear = new Date().getFullYear() + 1;

  // useMemo to calculate data based on props.data changes
  const {
    prevYearData,
    currentYearData,
    nextYearData,
    prevYearActualSum,
    currentYearForecastSum,
    nextYearForecastSum,
  } = useMemo(() => {
    let prevYearData: any = [];
    let currentYearData: any = [];
    let nextYearData: any = [];
    let prevYearActualSum = 0;
    let currentYearForecastSum = 0;
    let nextYearForecastSum = 0;

    // Calculate data for each year
    if (data) {
      props.data.map((item: any) => {
        if (item.MONTH.includes(currentYear)) {
          currentYearForecastSum += Number(item.ACTUAL) + Number(item.FORECAST);
          currentYearData.push(item);
        }
        if (item.MONTH.includes(prevYear)) {
          prevYearActualSum += Number(item.ACTUAL);
          prevYearData.push(item);
        }
        if (item.MONTH.includes(nextYear)) {
          nextYearForecastSum += Number(item.FORECAST);
          nextYearData.push(item);
        }
        return 0;
      });
    }

    return {
      prevYearData,
      currentYearData,
      nextYearData,
      prevYearActualSum,
      currentYearForecastSum,
      nextYearForecastSum,
      currentYear,
      prevYear,
      nextYear,
    };
  }, [data]);

  // useMemo to update comparison data
  useMemo(async () => {
    if (isCompareToggle && compareForecastData) {
      let currentYearData: any = [];
      let nextYearData: any = [];
      let currentYearForecastSum = 0;
      let nextYearForecastSum = 0;

      // Calculate data for each year in comparison view
      compareForecastData.map((item: any, index: string | number) => {
        if (item.MONTH.includes(currentYear)) {
          currentYearForecastSum +=
            Number(props.data[index].ACTUAL) + Number(item.FORECAST);
          currentYearData.push(item);
        }
        if (item.MONTH.includes(nextYear)) {
          nextYearForecastSum += Number(item.FORECAST);
          nextYearData.push(item);
        }
      });

      // Update compareView state
      setCompareView((pre: any) => ({
        ...pre,
        currentYearData: [...pre.currentYearData, currentYearData],
        nextYearData: [...pre.nextYearData, nextYearData],
        currentYearForecastSum: [
          ...pre.currentYearForecastSum,
          currentYearForecastSum,
        ],
        nextYearForecastSum: [...pre.nextYearForecastSum, nextYearForecastSum],
      }));
    }
  }, [compareForecastData, isCompareToggle, nextYear, props.data]);

  // Function to set table data for comparison
  const setTableDataForCompare = () => {
    // Clear compareView state
    setCompareView(() => ({
      currentYearData: [],
      nextYearData: [],
      currentYearForecastSum: [],
      nextYearForecastSum: [],
    }));

    // Calculate data for each item in compareForecastData
    compareForecastData.map(async (item: any) => {
      let currentYearData: any = [];
      let nextYearData: any = [];
      let currentYearForecastSum = 0;
      let nextYearForecastSum = 0;
      await item.map((item: any, index: string | number) => {
        if (item.MONTH.includes(currentYear)) {
          currentYearForecastSum +=
            Number(props.data[index].ACTUAL) + Number(item.FORECAST);
          currentYearData.push(item);
        }
        if (item.MONTH.includes(nextYear)) {
          nextYearForecastSum += Number(item.FORECAST);
          nextYearData.push(item);
        }
      });
      // Update compareView state
      setCompareView((pre: any) => ({
        ...pre,
        currentYearData: [...pre.currentYearData, currentYearData],
        nextYearData: [...pre.nextYearData, nextYearData],
        currentYearForecastSum: [
          ...pre.currentYearForecastSum,
          currentYearForecastSum,
        ],
        nextYearForecastSum: [...pre.nextYearForecastSum, nextYearForecastSum],
      }));
    });
  };

  // State to manage initial render
  const [isInitialRender, setIsInitialRender] = useState(true);

  // useMemo to run only on the initial render
  useMemo(() => {
    if (isCompare) {
      setTableDataForCompare();
    }
  }, []);

  // useEffect to update comparison data on compareForecastData change
  useEffect(() => {
    if (!isInitialRender && isCompare) {
      setTableDataForCompare();
    }
    setIsInitialRender(false);
  }, [compareForecastData]);

  // useEffect to clear compareView state on isCompareToggle change
  useEffect(() => {
    setCompareView(() => ({
      currentYearData: [],
      nextYearData: [],
      currentYearForecastSum: [],
      nextYearForecastSum: [],
    }));
  }, [isCompareToggle]);

  return (
    <Paper>
      {/* Table component */}
      <Table
        key={"table"}
        stickyHeader
        size="small"
        aria-label="forecast table"
      >
        <TableHead key={"Table Head"}>
          <TableRow key={"Table Row1"}>
            {/* Table headers */}
            {/* Total Month */}
            <TableCell key="MONTH" className="font-bold" align="center">
              <p key={"TOTAL"} className="text-green-700 text-lg">
                TOTAL
              </p>{" "}
              <p key={"MONTH01"} className="text-lg">
                MONTH
              </p>
            </TableCell>
            {/* Previous Year Actual */}
            <TableCell
              key={`ACT1 ${prevYear}`}
              className="font-bold"
              align="center"
            >
              <p className="text-green-700 text-lg">{`$${prevYearActualSum.toFixed(
                1
              )}`}</p>
              <p className="text-lg">{`ACT ${prevYear}`}</p>
            </TableCell>
            {/* Current Year Forecast */}
            <TableCell
              key={`FCT1${
                isCompareToggle || isCompare ? "1" : ""
              } ${currentYear}`}
              className="font-bold"
              align="center"
            >
              <p className="text-green-700 text-lg">{`$${currentYearForecastSum.toFixed(
                1
              )}`}</p>
              <p className="text-lg">{`FCT${
                isCompareToggle || isCompare ? "1" : ""
              } ${currentYear}`}</p>
            </TableCell>
            {/* Next Year Forecast */}
            {selectedYear === nextYear && (
              <TableCell
                key={`FCT${
                  isCompareToggle || isCompare ? "1" : ""
                } ${nextYear}`}
                className="font-bold"
                align="center"
              >
                <p className="text-green-700 text-lg">{`$${nextYearForecastSum.toFixed(
                  1
                )}`}</p>
                <p className="text-lg">{`FCT${
                  isCompareToggle || isCompare ? "1" : ""
                } ${nextYear}`}</p>
              </TableCell>
            )}
            {/* Additional forecast columns for comparison */}
            {compareView.currentYearData?.map((_: any, index: number) => {
              return (
                <>
                  <TableCell
                    key={`FCT1${index}`}
                    className="font-bold"
                    align="center"
                  >
                    <p className="text-green-700 text-lg">{`$${compareView.currentYearForecastSum[
                      index
                    ].toFixed(1)}`}</p>
                    <p className="text-lg">{`FCT${
                      index + 2
                    } ${currentYear}`}</p>
                  </TableCell>
                  {selectedYear === nextYear && (
                    <TableCell
                      key={`FCT2${index}`}
                      className="font-bold"
                      align="center"
                    >
                      <p className="text-green-700 text-lg">{`$${compareView.nextYearForecastSum[
                        index
                      ].toFixed(1)}`}</p>
                      <p className="text-lg">{`FCT${index + 2} ${nextYear}`}</p>
                    </TableCell>
                  )}
                </>
              );
            })}
          </TableRow>
        </TableHead>
        {/* Table body */}
        <TableBody>
          {/* Rows for each month */}
          {monthNames?.map((month: string, i: number) => (
            <TableRow
              key={i}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              {/* Month */}
              <TableCell align="center" component="th" scope="row">
                <p className="text-lg">{month}</p>
              </TableCell>
              {/* Previous Year Actual */}
              <TableCell sx={{ color: "#1F77B4" }} align="center">
                <p className="text-lg">${prevYearData[i]?.ACTUAL ?? "-"}</p>
              </TableCell>
              {/* Current Year Actual */}
              {currentYearData[i]?.ACTUAL && (
                <TableCell sx={{ color: "#1F77B4" }} align="center">
                  <p className="text-lg">{`$${currentYearData[i]?.ACTUAL}`}</p>
                </TableCell>
              )}
              {/* Current Year Forecast */}
              {currentYearData[i]?.FORECAST && (
                <TableCell sx={{ color: "#FF7F0E" }} align="center">
                  <p className="text-lg">{`$${currentYearData[i]?.FORECAST}`}</p>
                </TableCell>
              )}
              {/* Placeholder if no data */}
              {!currentYearData[i] && (
                <TableCell sx={{ color: "black" }} align="center">
                  -
                </TableCell>
              )}
              {/* Next Year Forecast */}
              {selectedYear === nextYear && nextYearData[i]?.FORECAST && (
                <TableCell sx={{ color: "#FF7F0E" }} align="center">
                  <p className="text-lg">{`$${nextYearData[i]?.FORECAST}`}</p>
                </TableCell>
              )}
              {/* Placeholder if no data */}
              {selectedYear === nextYear && !nextYearData[i] && (
                <TableCell sx={{ color: "black" }} align="center">
                  -
                </TableCell>
              )}
              {/* Additional columns for comparison */}
              {compareView.currentYearData?.map((_: any, index: any) => {
                return (
                  <>
                    {/* Current Year Actual */}
                    {currentYearData[i]?.ACTUAL && (
                      <TableCell sx={{ color: "#1F77B4" }} align="center">
                        <p className="text-lg">{`$${currentYearData[i]?.ACTUAL}`}</p>
                      </TableCell>
                    )}
                    {/* Current Year Forecast */}
                    {currentYearData[i]?.FORECAST && (
                      <TableCell
                        sx={{
                          color:
                            index === 0
                              ? "#2ca02c"
                              : index === 1
                              ? "#d62727"
                              : "#9467bd",
                        }}
                        align="center"
                      >
                        <p className="text-lg">{`$${compareView.currentYearData[index][i].FORECAST}`}</p>
                      </TableCell>
                    )}
                    {/* Placeholder if no data */}
                    {!currentYearData[i] && (
                      <TableCell sx={{ color: "black" }} align="center">
                        -
                      </TableCell>
                    )}
                    {/* Next Year Forecast */}
                    {selectedYear === nextYear &&
                      (compareView?.nextYearData[index][i]?.FORECAST ? (
                        <TableCell sx={{ color: "#2ca02c " }} align="center">
                          <p className="text-lg">{`$${compareView.nextYearData[index][i].FORECAST}`}</p>
                        </TableCell>
                      ) : (
                        <TableCell sx={{ color: "black" }} align="center">
                          -
                        </TableCell>
                      ))}
                  </>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default BasicTable;
