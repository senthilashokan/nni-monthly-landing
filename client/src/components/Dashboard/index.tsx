import { useEffect, useMemo, useState } from "react";
import Header from "./Header";
import { Box, Grid, IconButton } from "@mui/material";
import MyForecastCard from "@src/UI/MyForecastCard";
import MyForecastCardNbrx from "@src/UI/MyForecastCardNbrx";
import {
  ArrowRight as ArrowRightIcon,
  ArrowLeft as ArrowLeftIcon,
} from "@mui/icons-material";
import { useRequest } from "@src/hook/useRequest/useRequest";
import CircularProgress from "@mui/material/CircularProgress";
import { useLocation } from "react-router-dom";
import InfoIcon from "@mui/icons-material/Info";

const Dashboard = () => {
  // Custom hook for making API requests
  const [fetchSavedForecast, fetchingSavedForecast, , savedForecastData] =
    useRequest();
  // Get the state from the current location
  const { state } = useLocation();

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

    if (savedForecastData) {
      cardsData = savedForecastData.data.response;
      nextPageKey = savedForecastData.data.exclusiveStartKey;
    }

    return { cardsData, nextPageKey };
  }, [savedForecastData]);

  // Function to handle clicking the next button
  const handleNextClick = () => {
    setPage((pre) => ({
      ...pre,
      preKeys: [...page.preKeys, page.preKey],
      preKey: page.exclusiveStartKey,
      exclusiveStartKey: nextPageKey,
    }));
  };

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

  // Effect to fetch data when page.exclusiveStartKey or state.refresh changes
  useEffect(() => {
    fetchSavedForecast(
      {
        url: `${import.meta.env.VITE_API_BASE_URL}${
          sessionStorage.getItem("User_group") == "NBRX"
            ? "/all-nbrx-forecast"
            : "/all-forecast"
        }`,
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

  return (
    <Box>
      {/* Header component */}
      <Header />
      <Box className=" w-full min-h-screen">
        {/* Loading spinner */}
        {fetchingSavedForecast ? (
          <Box className=" w-full h-screen flex justify-center items-center">
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Grid container for forecast cards */}
            <Grid container className=" flex justify-center items-center">
              {cardsData?.map((item: any, index: number) => {
                return (
                  <Grid key={index} item className="p-4" sm={12} md={6}>
                    {sessionStorage.getItem("User_group") == "NBRX" ? (
                      <MyForecastCardNbrx
                        cardData={item}
                        cardType="Dashboard"
                      />
                    ) : (
                      <MyForecastCard cardData={item} cardType="Dashboard" />
                    )}
                  </Grid>
                );
              })}
            </Grid>
            {/* No records found message */}
            {cardsData === undefined || cardsData.length === 0 ? (
              <Box className=" w-full flex  mt-5">
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

export { Dashboard };
export default Dashboard;
