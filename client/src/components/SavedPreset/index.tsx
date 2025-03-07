import { useState, useEffect, useMemo } from "react";
import { Typography, Box, Grid, IconButton } from "@mui/material";
import SavedPresetCard from "@src/UI/SavedPresetCard";
import { useRequest } from "@src/hook/useRequest/useRequest";
import CircularProgress from "@mui/material/CircularProgress";
import InfoIcon from "@mui/icons-material/Info";
import {
  ArrowRight as ArrowRightIcon,
  ArrowLeft as ArrowLeftIcon,
} from "@mui/icons-material";
import { useLocation } from "react-router-dom";

const SavedPreset = () => {
  // Get the state from the current location
  const { state } = useLocation();
  // Custom hook for making API requests
  const [
    fetchSavedForecastData,
    fetchSavedForecastDataLoading,
    ,
    savedfetchSavedForecastData,
  ] = useRequest();
  // State for managing pagination
  const [page, setPage] = useState<{
    exclusiveStartKey: number | null;
    preKey: number | null;
    preKeys: Array<number | null>;
  }>({
    exclusiveStartKey: 0,
    preKey: null,
    preKeys: [],
  });

  // Memoized data from API response
  const { cardsData, nextPageKey } = useMemo(() => {
    let cardsData;
    let nextPageKey;

    if (savedfetchSavedForecastData) {
      cardsData = savedfetchSavedForecastData.data.body.response;
      nextPageKey = savedfetchSavedForecastData.data.body.exclusiveStartKey;
    }
    return { cardsData, nextPageKey };
  }, [savedfetchSavedForecastData]);

  // Function to handle clicking the next button
  const handleNextClick = () => {
    setPage((pre) => ({
      ...pre,
      preKeys: [...page.preKeys, page.preKey],
      preKey: page.exclusiveStartKey,
      exclusiveStartKey: nextPageKey,
    }));
  };

  // Effect to fetch data when page.exclusiveStartKey or state.refresh changes
  useEffect(() => {
    fetchSavedForecastData(
      {
        url: `${import.meta.env.VITE_API_BASE_URL}/all-preset`,
        method: "POST",
        data: {
          exclusiveStartKey: page.exclusiveStartKey,
        },
      },
      true
    );
  }, [page.exclusiveStartKey, state?.refresh]);

  // Effect to handle going back when no records found on the current page
  useEffect(() => {
    if (
      (cardsData === undefined || cardsData.length === 0) &&
      page.preKey !== null
    ) {
      handlePreClick();
    }
  }, [cardsData]);

  // Function to handle clicking the previous button
  const handlePreClick = () => {
    const preKeysCopy = page.preKeys;
    const poppedElement: any = preKeysCopy.pop();
    setPage((pre) => ({
      ...pre,
      preKeys: preKeysCopy,
      preKey: poppedElement,
      exclusiveStartKey: page.preKey,
    }));
  };

  return (
    <Box>
      {/* Title */}
      <Typography
        className=" p-5  border-b border-gray-500"
        variant="h4"
        gutterBottom
      >
        Saved Preset
      </Typography>
      <Box className=" w-full min-h-screen">
        {/* Loading spinner */}
        {fetchSavedForecastDataLoading ? (
          <Box className=" w-full h-screen flex justify-center items-center">
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Cards */}
            <Grid container className="flex pl-6 pr-6" spacing={3}>
              {cardsData?.map((item: any, index: number) => {
                return (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <SavedPresetCard savedData={item} />
                  </Grid>
                );
              })}
            </Grid>
            {/* No records found message */}
            {cardsData === undefined || cardsData.length === 0 ? (
              <Box className=" w-full flex  mt-8">
                <InfoIcon className="mt-2 text-blue-500" />
                <p className="p-1 text-lg  text-blue-500"> No records found.</p>
              </Box>
            ) : (
              // Pagination buttons
              <Grid container>
                <Grid item md={6}>
                  <IconButton
                    color="primary"
                    onClick={handlePreClick}
                    disabled={page.preKey == null}
                    aria-label="add to shopping cart"
                  >
                    <ArrowLeftIcon sx={{ fontSize: "60px" }} />
                  </IconButton>
                </Grid>
                <Grid className=" flex justify-end" item md={6}>
                  <IconButton
                    onClick={handleNextClick}
                    color="primary"
                    aria-label="add to shopping cart"
                    disabled={nextPageKey === null}
                  >
                    <ArrowRightIcon sx={{ fontSize: "60px" }} />
                  </IconButton>
                </Grid>
              </Grid>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export { SavedPreset };
export default SavedPreset;
