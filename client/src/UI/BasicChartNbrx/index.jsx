import { useState, useEffect, useMemo } from "react";
import Plot from "react-plotly.js";

const BasicChartNbrx = (props) => {
  const { data, dataForCompare, isCompareToggle, size } = props;

  //For making chart components responsive for different screen sizes.
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth * (size === "card" ? 1.2 / 3 : 1.8 / 3),
    height: window.innerHeight * (size === "card" ? 1 / 2.5 : 1 / 2),
  });
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth * (size === "card" ? 1.2 / 3 : 1.8 / 3),
        height: window.innerHeight * (1 / 2.5),
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const { NbrxHistory, NbrxForecastWithNull, TrxHistory, TrxForecastWithNull } =
    useMemo(() => {
      const TrxHistory = [...data.TrxHistory];
      const NbrxHistory = [...data.NbrxHistory];

      TrxHistory.push(data.TrxForecast[0]);
      NbrxHistory.push(data.NbrxForecast[0]);
      let nullArrayNbrxHistory = Array.from(
        { length: data.NbrxHistory.length },
        () => null
      );

      let NbrxForecastWithNull = nullArrayNbrxHistory.concat(data.NbrxForecast);

      let nullArrayTrxHistory = Array.from(
        { length: data.TrxHistory.length },
        () => null
      );
      let TrxForecastWithNull = nullArrayTrxHistory.concat(data.TrxForecast);

      return {
        NbrxHistory,
        NbrxForecastWithNull,
        TrxHistory,
        TrxForecastWithNull,
      };
    }, [data]);

  const chartData = [
    {
      // x: Date,
      x: data.Date,
      y: TrxHistory,
      type: "line",
      mode: "lines",
      maker: { color: "red" },
      name: "TrxHistory",
    },
    {
      x: data.Date,
      y: TrxForecastWithNull,
      type: "line",
      mode: "lines",
      maker: { color: "red" },
      name: "TrxForecast",
    },
    {
      x: data.Date,
      y: NbrxHistory,
      type: "line",
      mode: "lines",
      maker: { color: "red" },
      name: "NbrxHistory",
    },
    {
      x: data.Date,
      y: NbrxForecastWithNull,
      type: "line",
      mode: "lines",
      maker: { color: "red" },
      name: `NbrxForecast  ${
        isCompareToggle
          ? "<br>" +
            data.ModelName +
            `${
              data.ModelType == "Unbounded"
                ? ""
                : `<br>[${data.Bounds[0]},${data.Bounds[1]}]`
            }`
          : ""
      }`,
    },
  ];

  const { chartDataForCompare } = useMemo(() => {
    const chartDataForCompare = [...chartData];
    if (isCompareToggle) {
      const tempChartData = [];
      dataForCompare.ModelNames.map((modelName, index) => {
        const NbrxHistory = [...data.NbrxHistory];
        NbrxHistory.push(dataForCompare.NbrxForecasts[index][0]);
        let nullArrayNbrxHistory = Array.from(
          { length: dataForCompare.NbrxHistoryArray[index].length },
          () => null
        );
        let NbrxForecastWithNull = nullArrayNbrxHistory.concat(
          dataForCompare.NbrxForecasts[index]
        );
        chartDataForCompare.push({
          x: data.Date,
          y: NbrxForecastWithNull,
          type: "line",
          mode: "lines",
          maker: { color: "red" },
          name: `NbrxForecast  ${
            isCompareToggle
              ? "<br>" +
                modelName +
                `${
                  dataForCompare.ModelTypes[index] == "Unbounded"
                    ? ""
                    : `<br>[${dataForCompare.BoundsArray[index][0]},${dataForCompare.BoundsArray[index][1]}]`
                }`
              : ""
          }`,
        });
      });
    }
    return { chartDataForCompare };
  }, [dataForCompare]);

  return (
    <div style={{ position: "relative" }}>
      <Plot
        data={isCompareToggle ? chartDataForCompare : chartData}
        layout={{
          hovermode: "x",
          width: windowSize.width,
          height: windowSize.height,
          autosize: true,
          margin: {
            t: 100, // Adjust the top margin to make space for the axis and edit options
          },
          xaxis: {
            title: "Date",
            titlefont: {
              size: 12,
              color: "#000",
              margin: 20,
            },
            margin: 20,
          },
          yaxis: {
            title: "Million usd",
            titlefont: {
              size: 12,
              color: "#000",
              margin: 30,
            },
          },
          hoverlabel: {
            bgcolor: "#ffffff", // Set background color for hover label
            bordercolor: "#000000", // Set border color for hover label
            font: { color: "#000000" }, // Set font color for hover label
          },
        }}
      />
      <style>
        {`
    .modebar-group {         
        display: flex  !important;\
      }
      .modebar-group:last-child {
        display: none !important;
      }
     
    `}
      </style>
    </div>
  );
};

export default BasicChartNbrx;
