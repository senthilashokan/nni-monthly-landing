import { DialogContentText, styled, Dialog, DialogTitle, DialogContent } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

// Styled Dialog component
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(4)
  }
}));

// SupportingVariableInfoPopup component
const SupportingVariableInfoPopup = (props: any) => {
  // Destructuring props
  const { closeModal, showModal, supportingVariablesDesc } = props;

  return (
    <BootstrapDialog
      onClose={closeModal}
      aria-labelledby="customized-dialog-title"
      open={showModal}>
      {/* Dialog Title */}
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        <b>Supporting Variables</b>
      </DialogTitle>
      {/* Close Button */}
      <IconButton
        aria-label="close"
        onClick={closeModal}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500]
        }}>
        <CloseIcon />
      </IconButton>
      {/* Dialog Content */}
      <DialogContent>
        <DialogContentText>
          {/* List of supporting variables */}
          <ul>
            {Object.keys(supportingVariablesDesc).map((item, index) => (
              <li key={index}>
                <strong>{item}:</strong> {supportingVariablesDesc[item]}
              </li>
            ))}
          </ul>
        </DialogContentText>
      </DialogContent>
    </BootstrapDialog>
  );
};

export default SupportingVariableInfoPopup;
