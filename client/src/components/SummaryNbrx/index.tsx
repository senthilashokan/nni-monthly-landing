import { Box, Button, CircularProgress, Grid, Typography } from "@mui/material";
import { UserContext } from "@src/App";
import { useRequest } from "@src/hook/useRequest/useRequest";
import { useContext, useEffect, useState } from "react";
import InfoIcon from "@mui/icons-material/Info";
import SummaryOutput from "./SummaryOutput";

const SummaryNbrx = () => {
  const { setSnackbar } = useContext(UserContext);
  // Custom hook for making API requests
  const [savedBrandNames, setSavedBrandNames] = useState<Array<string>>([]);
  const [selectedBrandNames, setSelectedBrandNames] = useState<Array<string>>(
    []
  );
  const [dataForSummary, setDataForSummary] = useState<any>({});
  const [outputView, setOutputView] = useState<{
    showOutput: boolean;
    outputDataCount: number;
  }>({
    showOutput: false,
    outputDataCount: 0,
  });
  const [
    fetchDataForSummary,
    fetchingDataForSummary,
    errorFetchDataForSummary,
    dataForSummaryApiResponse,
  ] = useRequest();

  const fetchSummaryData = () => {
    setSelectedBrandNames([]);
    setOutputView((pre) => ({
      ...pre,
      outputDataCount: 0,
    }));
    fetchDataForSummary(
      {
        url: "https://pkndypm8t4.execute-api.us-east-1.amazonaws.com/dev/nbrx-summary",
      },
      true
    );
  };

  useEffect(() => {
    fetchSummaryData();
  }, []);

  useEffect(() => {
    if (errorFetchDataForSummary) {
      setSnackbar((pre: any) => ({
        ...pre,
        open: true,
        severity: "error",
        message: `Unable to fetch data. Please try again.`,
      }));
    }
    if (dataForSummaryApiResponse) {
      setSavedBrandNames(Object.keys(dataForSummaryApiResponse.data));
      setDataForSummary(dataForSummaryApiResponse.data);
    }
  }, [dataForSummaryApiResponse, errorFetchDataForSummary]);

  const handleForecastSelection = (brandName: string, id: number) => {
    // console.log(brandName, id);

    const updatedData = dataForSummary[brandName].map((item: any) => {
      if (item["createdOn"] === id) {
        if (item["isSelected"]) {
          setOutputView((pre) => ({
            ...pre,
            outputDataCount: pre.outputDataCount - 1,
          }));
        } else {
          setOutputView((pre) => ({
            ...pre,
            outputDataCount: pre.outputDataCount + 1,
          }));
        }
        return { ...item, isSelected: !item["isSelected"] };
      }
      return item;
    });

    setDataForSummary((pre: any) => ({
      ...pre,
      [brandName]: updatedData,
    }));
  };

  const handleBrandSelection = (brandName: string) => {
    if (selectedBrandNames.includes(brandName)) {
      const updatedData = dataForSummary[brandName].map((item: any) => {
        if (item["isSelected"]) {
          setOutputView((pre) => ({
            ...pre,
            outputDataCount: pre.outputDataCount - 1,
          }));
          return { ...item, isSelected: false };
        }
        return item;
      });
      setDataForSummary((pre: any) => ({
        ...pre,
        [brandName]: updatedData,
      }));
      setSelectedBrandNames((pre) => pre.filter((name) => name !== brandName));
    } else {
      setSelectedBrandNames((pre) => [...pre, brandName]);
    }
  };

  const handleView = () => {
    setOutputView((pre: any) => ({
      ...pre,
      showOutput: !pre.showOutput,
    }));
  };

  return fetchingDataForSummary ? (
    <Box className="flex w-full min-h-screen justify-center items-center">
      <CircularProgress />
    </Box>
  ) : savedBrandNames.length === 0 ? (
    <Box className="flex">
      <InfoIcon className="mt-2 text-blue-500" />
      <p className="p-1 text-lg  text-blue-500"> No data found for summary.</p>
    </Box>
  ) : (
    <Box>
      <Typography className="pt-5 pl-5" variant="h4">
        Forecast Summary
      </Typography>
      <p className="pt-2 pl-5 text-zinc-400">
        Summary of saved forecasted data
      </p>
      {outputView.showOutput ? (
        <SummaryOutput
          handleView={handleView}
          dataForSummary={dataForSummary}
        />
      ) : (
        <Box className=" bg-slate-100 rounded-xl p-5 m-16 grid">
          {savedBrandNames.length <= 0 ? (
            <></>
          ) : (
            <>
              <Typography variant="h4" className="text-[#19356e]" gutterBottom>
                Let's Personalize!
              </Typography>
              <Typography variant="h6" className="text-[#595e69]" gutterBottom>
                All options are multiselect.
              </Typography>
              <Typography
                variant="h6"
                className="pt-4 pl-2 text-base font-medium text-[#234c9e]"
              >
                Brand
              </Typography>
              <Grid container spacing={2} className=" flex ml-2 w-full">
                {savedBrandNames.map(
                  (savedBrandName: string, savedBrandIndex: number) => (
                    <Grid
                      item
                      xs={6}
                      md={2}
                      className="m-5"
                      key={savedBrandIndex}
                    >
                      <Button
                        sx={{
                          borderRadius: 5,
                          overflowWrap: "anywhere",
                        }}
                        variant={
                          selectedBrandNames.includes(savedBrandName)
                            ? "contained"
                            : "outlined"
                        }
                        onClick={() => handleBrandSelection(savedBrandName)}
                      >
                        {savedBrandName}
                      </Button>
                    </Grid>
                  )
                )}
              </Grid>
              {selectedBrandNames.length > 0 && (
                <Box className="mt-10">
                  <Typography
                    variant="h6"
                    className="pt-4 pl-2 text-base font-medium"
                  >
                    Available Forecasts
                    <span className="text-md font-medium text-red-700 mb-2">
                      {" "}
                      *
                    </span>
                  </Typography>
                </Box>
              )}
              {selectedBrandNames.map(
                (brandName: string, brandIndex: number) => {
                  return (
                    <Box key={brandIndex}>
                      <h3 className="pt-4 pl-2 text-base font-medium text-[#2956b0]">
                        {brandName}
                      </h3>
                      <Grid container spacing={2} className="ml-2 w-full">
                        {dataForSummary[brandName].map(
                          (savedForecast: any, primaryFeatureIndex: number) => {
                            return (
                              <Grid
                                item
                                xs={6}
                                md={2}
                                className="m-5"
                                key={primaryFeatureIndex}
                              >
                                <Button
                                  sx={{
                                    borderRadius: 5,
                                    overflowWrap: "anywhere",
                                  }}
                                  variant={
                                    savedForecast["isSelected"]
                                      ? "contained"
                                      : "outlined"
                                  }
                                  onClick={() =>
                                    handleForecastSelection(
                                      brandName,
                                      savedForecast["createdOn"]
                                    )
                                  }
                                >
                                  {savedForecast["forecastName"]}
                                </Button>
                              </Grid>
                            );
                          }
                        )}
                      </Grid>
                    </Box>
                  );
                }
              )}
              {selectedBrandNames.length > 0 && (
                <Box className=" flex justify-end w-full  mt-4 mr-40">
                  <Button
                    disabled={outputView.outputDataCount < 1}
                    variant="contained"
                    onClick={fetchSummaryData}
                  >
                    Clear All
                  </Button>
                  <Button
                    disabled={outputView.outputDataCount < 1}
                    variant="contained"
                    sx={{ marginLeft: 2 }}
                    onClick={handleView}
                  >
                    Create Summary
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SummaryNbrx;
