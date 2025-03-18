import { styled } from '@mui/material/styles';
import { Paper, Button, Avatar, Box, Typography, BoxProps } from '@mui/material';


interface FooterBoxProps extends BoxProps {}
/**
 * Styled components for authentication pages
 */
export const AuthCard = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: theme.shape.borderRadius * 2,
  borderTop: `4px solid ${theme.customColors.navyBlue}`,
  borderBottom: `4px solid ${theme.customColors.pink}`,
}));

export const LogoAvatar = styled(Avatar)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: theme.customColors.teal,
  width: 56,
  height: 56,
}));

export const SecondaryAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.customColors.pink,
  marginRight: theme.spacing(1),
}));

export const GradientButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  background: `linear-gradient(45deg, ${theme.customColors.navyBlue} 30%, ${theme.customColors.pink} 90%)`,
  '&:hover': {
    background: `linear-gradient(45deg, ${theme.customColors.navyBlueDark} 30%, ${theme.customColors.pinkDark} 90%)`,
  },
}));

export const AccentButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.customColors.teal,
  '&:hover': {
    backgroundColor: theme.customColors.tealDark,
  },
}));

export const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

export const FooterBox = styled(Box)<FooterBoxProps>(({ theme }) => ({
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  marginTop: "auto",
  backgroundColor: theme.palette.mode === "light" 
    ? theme.customColors.lightGray 
    : "#253547",
  borderTop: `2px solid ${theme.customColors.teal}`,
}));

export const FooterText = styled(Typography)(({ theme }) => ({
  color: theme.palette.mode === 'light'
    ? theme.customColors.navyBlue
    : theme.customColors.lightGray,
}));
