import { useState, useEffect, useMemo } from "react";
import Plot from "react-plotly.js";
//Resuesable chart component.
const BasicChart = (props) => {
  const { data, size, isCompareToggle, compareForecastData, isCompare } = props;
  //State for multiple forecast data.
  const [compareForecastDataArray, setCompareForecastDataArray] = useState([]);

  //This useMemo hook is used to filter and do calculations for the data required for the chart component.
  const { MONTH, ACTUAL, FORECAST, lastNullIndexOfForecast, lastActual } =
    useMemo(() => {
      let MONTH;
      let ACTUAL;
      let FORECAST;
      let lastActual;
      let lastNullIndexOfForecast = 0;
      let calculateIndexFlag = true;

      const filteredData = data.filter((item) => {
        // Extract the year from the "MONTH" value
        const year = parseInt(item.MONTH.split("-")[1]);

        // Check if the year is 2022 or greater
        return year >= 2022;
      });
      if (filteredData !== 0) {
        MONTH = filteredData.map((item) => item.MONTH);
        ACTUAL = filteredData.map((item) => {
          if (item.ACTUAL != null) {
            lastActual = item.ACTUAL;
          }
          return item.ACTUAL;
        });

        FORECAST = filteredData.map((item) => {
          if (calculateIndexFlag && item.FORECAST != null) {
            lastNullIndexOfForecast = filteredData.indexOf(item) - 1;
            calculateIndexFlag = false;
          }
          return item.FORECAST;
        });
      }
      if (lastNullIndexOfForecast >= 0) {
        FORECAST[lastNullIndexOfForecast] = lastActual;
      }
      return { MONTH, ACTUAL, FORECAST, lastNullIndexOfForecast, lastActual };
    }, [data]);

  //This useMemo hook is used to add multiple data points to the chart component for comparison.
  useMemo(async () => {
    if (isCompareToggle && compareForecastData) {
      const filteredData = compareForecastData.filter((item) => {
        // Extract the year from the "MONTH" value
        const year = parseInt(item.MONTH.split("-")[1]);

        // Check if the year is 2022 or greater
        return year >= 2022;
      });

      const newForecast = filteredData.map((item) => item.FORECAST);
      newForecast[lastNullIndexOfForecast] = lastActual;

      setCompareForecastDataArray((pre) => [...pre, newForecast]);
    }
    if (isCompare && compareForecastData) {
      let filterCompareForecastData = [];
      await compareForecastData.filter((item) => {
        const filteredData = item.filter((item) => {
          // Extract the year from the "MONTH" value
          const year = parseInt(item.MONTH.split("-")[1]);

          // Check if the year is 2022 or greater
          return year >= 2022;
        });

        const newForecast = filteredData.map((item) => item.FORECAST);
        newForecast[lastNullIndexOfForecast] = lastActual;

        filterCompareForecastData.push(newForecast);
      });
      setCompareForecastDataArray((pre) => filterCompareForecastData);
    }
  }, [
    compareForecastData,
    isCompareToggle,
    isCompare,
    lastActual,
    lastNullIndexOfForecast,
  ]);

  //For reseting the compare data state.
  useEffect(() => {
    if (!isCompareToggle) {
      setCompareForecastDataArray(() => []);
    }
  }, [isCompareToggle]);

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

  //For gathing, the data needed for the chart component.
  const { chartData } = useMemo(() => {
    let forecastName = isCompareToggle || isCompare ? "Forecast1" : "Forecast";
    let chartData = [
      {
        x: MONTH,
        y: ACTUAL,
        type: "line",
        mode: "lines+markers",
        maker: { color: "red" },
        name: "Actual",
      },
      {
        x: MONTH,
        y: FORECAST,
        type: "line",
        mode: "lines+markers",
        maker: { color: "red" },
        name: forecastName,
      },
    ];

    if (compareForecastDataArray.length !== 0) {
      let forecastcount = 2;
      compareForecastDataArray.map((item) => {
        chartData.push({
          x: MONTH,
          y: item,
          type: "line",
          mode: "lines+markers",
          maker: { color: "red" },
          name: `Forecast${forecastcount++}`,
        });
      });
    }
    return { chartData };
  }, [ACTUAL, FORECAST, MONTH, compareForecastDataArray, isCompareToggle]);

  return (
    <div style={{ position: "relative" }}>
      <Plot
        data={chartData}
        layout={{
          hovermode: "x",
          width: windowSize.width,
          height: windowSize.height,
          autosize: true,
          margin: {
            t: 100, // Adjust the top margin to make space for the axis and edit options
          },
          xaxis: {
            title: "Months",
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

export default BasicChart;
