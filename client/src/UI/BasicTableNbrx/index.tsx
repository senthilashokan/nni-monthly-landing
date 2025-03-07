import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useMemo } from "react";
// import { monthNames } from "@src/data/constants";

const BasicTableNbrx = (props: any) => {
  const { data, dataForCompare, isCompareToggle } = props;
  const colors = ["#8D48CB", "#563A3A"];
  // const { NbrxForecastWithNull, TrxForecastWithNull } = useMemo(() => {
  //   let nullArrayNbrxHistory = Array.from(
  //     { length: data.NbrxHistory.length },
  //     () => null
  //   );
  //   let NbrxForecastWithNull = nullArrayNbrxHistory.concat(data.NbrxForecast);

  //   let nullArrayTrxHistory = Array.from(
  //     { length: data.TrxHistory.length },
  //     () => null
  //   );
  //   let TrxForecastWithNull = nullArrayTrxHistory.concat(data.TrxForecast);

  //   return { NbrxForecastWithNull, TrxForecastWithNull };
  // }, [data]);

  const { forecastDates } = useMemo(() => {
    let forecastDates: string[] = [];
    data.Date.map((date: string) => {
      if (new Date(data.ForecastStartDate) <= new Date(date)) {
        forecastDates.push(date);
      }
    });
    return { forecastDates };
  }, [data]);

  return (
    <Paper>
      <Table stickyHeader size="small" aria-label="forecast table">
        <TableHead>
          <TableRow>
            <TableCell key="DATE" className="font-bold" align="center">
              <p className="text-lg">DATE</p>
            </TableCell>
            <TableCell key="TRX" className="font-bold" align="center">
              <p className="text-lg">TRX FORECAST</p>
            </TableCell>
            <TableCell key="NBRX" className="font-bold" align="center">
              <p className="text-lg">NBRX FORECAST</p>
              <p className="text-lg">
                {isCompareToggle
                  ? `${data.ModelName} ${
                      data.ModelType == "Unbounded"
                        ? ""
                        : `[${data.Bounds[0]},${data.Bounds[1]}]`
                    } `
                  : ""}
              </p>
            </TableCell>
            {isCompareToggle &&
              dataForCompare.ModelNames.map(
                (modelName: Array<string>, index: number) => {
                  return (
                    <TableCell
                      key={"NBRX" + index}
                      className="font-bold"
                      align="center"
                    >
                      <p className="text-lg">NBRX FORECAST</p>
                      <p className="text-lg">{`${modelName} ${
                        dataForCompare.ModelTypes[index] == "Unbounded"
                          ? ""
                          : `[${dataForCompare.BoundsArray[index][0]}, ${dataForCompare.BoundsArray[index][1]}]`
                      } `}</p>
                    </TableCell>
                  );
                }
              )}
          </TableRow>
        </TableHead>
        <TableBody>
          {forecastDates.map((date: string, i: number) => {
            return (
              <TableRow
                key={i}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell align="center" component="th" scope="row">
                  <p className="text-lg">
                    {new Date(date).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </TableCell>

                <TableCell
                  sx={{ color: "#FF7F0E" }}
                  align="center"
                  component="th"
                  scope="row"
                >
                  <p className="text-lg">
                    {data.TrxForecast[i] !== null
                      ? data.TrxForecast[i]?.toFixed(2)
                      : "N/A"}
                  </p>
                </TableCell>
                <TableCell
                  sx={{ color: "#d62727" }}
                  align="center"
                  component="th"
                  scope="row"
                >
                  <p className="text-lg">
                    {data.NbrxForecast[i] !== null
                      ? data.NbrxForecast[i]?.toFixed(2)
                      : "N/A"}
                  </p>
                </TableCell>

                {isCompareToggle &&
                  dataForCompare.ModelNames.map((_: string, index: number) => {
                    return (
                      <TableCell
                        key={index}
                        sx={{ color: colors[index] }}
                        align="center"
                        component="th"
                        scope="row"
                      >
                        <p className="text-lg">
                          {dataForCompare.NbrxForecasts[index][i] !== null
                            ? dataForCompare.NbrxForecasts[index][i]?.toFixed(2)
                            : "N/A"}
                        </p>
                      </TableCell>
                    );
                  })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default BasicTableNbrx;
