import { useContext, useEffect } from "react";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ThemeProvider, createTheme, Box } from "@mui/material";
import EastIcon from "@mui/icons-material/East";
import dayjs from "dayjs";
import { Context } from "@src/components/Dashboard/NewForecast";

// Functional component for rendering a month range picker
const MonthRangePicker = (props: any) => {
  const {
    isCompare,
    isSummary,
    setDuration,
    touched,
    setTouched,
    monthRangeError,
    sliderValue,
    setSliderValue,
    setSelectedYear,
    // fromDuration
  } = props;
  const { toDate, fromDate, setFromDate, setToDate } = useContext(Context); // Using Context to get and set toDate

  const getMonthDifference = (startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) => {
    var startYear = startDate.toDate().getFullYear();
    var startMonth = startDate.toDate().getMonth();
    var endYear = endDate.toDate().getFullYear();
    var endMonth = endDate.toDate().getMonth();

    // Calculate the difference in months
    var monthDifference =
      (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
    return monthDifference;
  };

  // Effect hook to handle changes in toDate and calculate the total months
  useEffect(() => {
    const month = toDate?.$d?.getMonth() + 1;
    const year = toDate?.$d?.getFullYear();
    if (month) {
      let tempMonthDifference = getMonthDifference(fromDate, toDate);
      setSliderValue(tempMonthDifference);
      setSelectedYear(year);
    }
  }, [toDate]);

  // Handler for from month change
  const handleFromMonthChange = async (date: any) => {
    const fromDate = new Date(date);
    setFromDate(dayjs(date));
    setDuration((pre: any) => ({
      ...pre,
      fromMonth: `${fromDate.getFullYear()}-${fromDate.getMonth() + 1}`,
    }));
  };

  // Handler for to month change
  const handleToMonthChange = async (date: any) => {
    const toDate = new Date(date);
    await setTouched((touched: any) => ({
      ...touched,
      monthRangePicker: true,
    }));
    setToDate(dayjs(date));
    isCompare &&
      setDuration((pre: any) => ({
        ...pre,
        toMonth: `${toDate.getFullYear()}-${toDate.getMonth() + 1}`,
      }));
  };

  // Function to get error text based on slider value and touched state
  const getErrorText = () => {
    if (sliderValue > 18) {
      return "The duration cannot exceed 18 months.";
    } else if (touched.monthRangePicker && sliderValue < 1) {
      return "Please select a valid date.";
    } else {
      return "Please select a date.";
    }
  };

  // Theme customization for input label and outlined input
  const theme = createTheme({
    components: {
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: monthRangeError.error ? "#d32f2f" : "#000000",
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: monthRangeError.error ? "#d32f2f" : "#000000",
              borderRadius: "5px",
            },
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Box className="flex flex-wrap">
        {/* From Date Picker */}
        <Box className="flex-grow basis-32 ">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer
              components={["DatePicker", "DatePicker", "DatePicker"]}
            >
              <DatePicker
                label="From Date"
                views={["year", "month"]}
                value={
                  isSummary ? dayjs(`${new Date().getFullYear()}-01`) : fromDate
                }
                disabled={!isCompare || isSummary}
                onChange={handleFromMonthChange}
              />
            </DemoContainer>
          </LocalizationProvider>
        </Box>
        {/* Arrow Icon */}
        <Box className="  self-center">
          <EastIcon />
        </Box>
        {/* To Date Picker */}
        <Box className="flex-grow basis-32  ">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer
              components={["DatePicker", "DatePicker", "DatePicker"]}
            >
              <DatePicker
                disabled={props.isCompareToggle}
                label="To Date"
                views={["year", "month"]}
                value={toDate}
                onChange={handleToMonthChange}
              />
            </DemoContainer>
          </LocalizationProvider>
        </Box>
      </Box>
      {/* Error message */}
      {monthRangeError.error && (
        <p className="text-red-500 text-[13px] ml-3  ">
          {isCompare ? monthRangeError.message : getErrorText()}
        </p>
      )}
    </ThemeProvider>
  );
};

export default MonthRangePicker;
