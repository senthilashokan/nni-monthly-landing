import "./App.css";
import { createContext, useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Sidebar } from "./components";
import { Alert, Box, Grid } from "@mui/material";
import Loader from "@src/UI/Loader";
import { jwtDecode } from "jwt-decode";
import { useRequest } from "./hook/useRequest/useRequest";
// import { UserContextInterface } from "./AppSchema";
import Snackbar from "@mui/material/Snackbar";
import { useNavigate } from "react-router-dom";

// import UnderConstruction from "@src/assets/images/UnderConstruction.png";
// Lazy-loaded components
const Dashboard = lazy(() => import("./components/Dashboard"));
const SavedPreset = lazy(() => import("./components/SavedPreset"));
const Summary = lazy(() => import("./components/Summary"));
const SummaryNbrx = lazy(() => import("./components/SummaryNbrx"));
const SharedForecasts = lazy(() => import("./components/SharedForecasts"));
const Tracking = lazy(() => import("./components/Tracking"));
const NewForecast = lazy(() => import("./components/Dashboard/NewForecast"));
const NewForecastNbrx = lazy(
  () => import("./components/Dashboard/NewForecastNbrx")
);
const ViewForecast = lazy(() => import("./components/Dashboard/ViewForecast"));
const ViewForecastNbrx = lazy(
  () => import("./components/Dashboard/ViewForecastNbrx")
);
const CompareForecast = lazy(
  () => import("./components/Dashboard/CompareForecast")
);
const CompareForecastNbrx = lazy(
  () => import("./components/Dashboard/CompareForecastNbrx")
);
// Context for user data
export const UserContext = createContext<any>(null);

const App = () => {
  //Custom hook for api call to fetch user data
  const [fetchUser, fetchingUser, errorFetchingUser, userApiResponse] =
    useRequest();
  const [refreshUser, , errorRefreshingUser, refreshUserApiResponse] =
    useRequest();
  let navigate = useNavigate();
  const Loading = () => (
    <div>
      <Loader />
    </div>
  );
  // User state
  const [user, setUser] = useState<any>({
    firstName: `test`,
    lastName: "user",
    email: "TUSR@novonordisk.com",
    role: "Business",
  });
  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    severity: any;
    message: string;
  }>({
    open: false,
    severity: "",
    message: "",
  });
  // Refresh user token state
  const [refreshToken, setRefreshToken] = useState("");
  // Effect for handling user data
  useEffect(() => {
    if (errorFetchingUser || errorRefreshingUser) {
      // Show error message if unable to fetch user info
      setSnackbar((pre) => ({
        ...pre,
        open: true,
        severity: "error",
        message: "Unable to fetch user info.Please try again.",
      }));
      window.location.href = import.meta.env.VITE_REDIRECT_URL;
    }
    if (refreshUserApiResponse) {
      sessionStorage.setItem(
        "id_token",
        refreshUserApiResponse.data.body.id_token
      );
    } else if (userApiResponse) {
      // Store user data in session storage and update state
      sessionStorage.setItem("id_token", userApiResponse.data.body.id_token);
      setRefreshToken(userApiResponse.data.body.refresh_token);
      const decodedToken: any = jwtDecode(userApiResponse.data.body.id_token);
      setUser((pre: any) => ({
        ...pre,
        firstName: decodedToken.given_name,
        lastName: decodedToken.family_name,
        email: decodedToken.email,
        role: decodedToken["custom:groups"],
      }));
      navigate("/");
    }
  }, [
    userApiResponse,
    refreshUserApiResponse,
    errorRefreshingUser,
    errorFetchingUser,
  ]);
  // State for checking if code is present in URL
  const [isCode, setIsCode] = useState(false);
  // Effect for handling OAuth2 authentication

  let count = 0;
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      setIsCode(true);
      const params = new URLSearchParams();
      params.append("code", code);
      params.append("redirectUrl", `${import.meta.env.VITE_REDIRECT_URL}`);
      count = count + 1;
      count == 1 &&
        fetchUser(
          {
            url: `${import.meta.env.VITE_API_BASE_URL}/get-user-tokens`,
            params: params,
          },
          false
        );
    } else {
      // Redirect to login page
      window.location.href = `${
        import.meta.env.VITE_BASE_URL
      }/login?client_id=${
        import.meta.env.VITE_CLIENT_ID
      }&response_type=code&redirect_uri=${import.meta.env.VITE_REDIRECT_URL}`;
    }
  }, []);
  // Effect for handling refresh OAuth2 token
  useEffect(() => {
    if (refreshToken) {
      setInterval(() => {
        const params = new URLSearchParams();
        params.append("refresh_token", refreshToken);
        refreshUser(
          {
            url: `${import.meta.env.VITE_API_BASE_URL}/refresh-tokens`,
            params: params,
          },
          false
        );
      }, 1800000);
    }
  }, [refreshToken]);
  return (
    <UserContext.Provider value={{ user, setSnackbar }}>
      {/* Snackbar for displaying messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((pre) => ({ ...pre, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((pre) => ({ ...pre, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      {isCode && !fetchingUser ? (
        <Box className="app min-h-screen w-full flex">
          <Grid container className="">
            <Grid item className=" " sm={12} md={1}>
              <Sidebar />
            </Grid>
            {/* {sessionStorage.getItem("User_group") == "NBRX" ? (
              <Grid
                item
                className="flex items-end justify-center "
                sm={12}
                md={11}
              >
                <img
                  className=" h-2/3 w-3/4 "
                  src={UnderConstruction}
                  alt="UnderConstruction"
                />{" "}
              </Grid>
            ) : ( */}
            <Grid item className="" sm={12} md={11}>
              <Suspense fallback={<Loading />}>
                {/* Routes for the application */}
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/refresh" element={<Loader />} />
                  <Route path="/savedpreset" element={<SavedPreset />} />
                  <Route path="/summary" element={<Summary />} />
                  <Route path="/summaryNbrx" element={<SummaryNbrx />} />
                  <Route path="/tracking" element={<Tracking />} />
                  <Route
                    path="/sharedForecasts"
                    element={<SharedForecasts />}
                  />
                  <Route path="/newforecast" element={<NewForecast />} />
                  <Route
                    path="/newforecastNbrx"
                    element={<NewForecastNbrx />}
                  />
                  <Route path="/viewforecast" element={<ViewForecast />} />
                  <Route
                    path="/viewforecastNbrx"
                    element={<ViewForecastNbrx />}
                  />
                  <Route
                    path="/compareforecast"
                    element={<CompareForecast />}
                  />
                  <Route
                    path="/compareforecastNbrx"
                    element={<CompareForecastNbrx />}
                  />
                </Routes>
              </Suspense>
            </Grid>
            {/* )} */}
          </Grid>
        </Box>
      ) : (
        <Loading />
      )}
    </UserContext.Provider>
  );
};
export default App;
