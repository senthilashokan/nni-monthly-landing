import { Box, Button, Typography } from "@mui/material";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

const Header = () => {
  // Accessing the navigate function from the useNavigate hook
  let navigate = useNavigate();

  // Function to navigate to the new forecast page
  const handleNewForecast = () => {
    sessionStorage.getItem("User_group") == "FINANCE"
      ? navigate("/newforecast")
      : navigate("/newforecastNbrx");
  };

  // Function to navigate to the compare forecast page
  const handleCompareForecast = () => {
    sessionStorage.getItem("User_group") == "NBRX"
      ? navigate("/compareforecastNbrx")
      : navigate("/compareforecast");
  };

  return (
    // Header component
    <header className=" w-full bg-white-900 pl-5 pr-5 pt-5 pb-2  border-b border-gray-500 flex justify-between items-center">
      {/* Title */}
      <Typography className=" " variant="h4" gutterBottom>
        My Forecasts
      </Typography>

      {/* Buttons */}
      <Box className=" flex">
        {/* Button to compare forecasts */}
        {(sessionStorage.getItem("User_group") === "BUSINESS" ||
          sessionStorage.getItem("User_group") === "FINANCE" ||
          sessionStorage.getItem("User_group") === "NBRX") && (
          <Box className="mr-4 ">
            <Button
              fullWidth
              onClick={handleCompareForecast}
              variant="outlined"
            >
              <SyncAltIcon />
              Compare Forecast
            </Button>
          </Box>
        )}

        {/* Button to create new forecast (visible only for users with role 'FINANCE') */}
        {(sessionStorage.getItem("User_group") === "FINANCE" ||
          sessionStorage.getItem("User_group") === "NBRX") && (
          <Box className=" min-w-56">
            <Button fullWidth onClick={handleNewForecast} variant="contained">
              <AddIcon />
              New Forecast
            </Button>
          </Box>
        )}
      </Box>
    </header>
  );
};

export default Header;
