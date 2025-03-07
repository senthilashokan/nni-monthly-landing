import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Functional component for displaying a loader
const Loader = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
      <CircularProgress />
    </Box>
  );
};

export default Loader;
