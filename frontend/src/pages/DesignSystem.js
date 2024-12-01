import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Card, 
  CardContent,
  Chip,
  Grid,
  useTheme
} from '@mui/material';
import { Message } from '../design-system/components/Message';
import { colors } from '../design-system/tokens/colors';

const ColorBox = ({ color, name }) => {
  const theme = useTheme();
  return (
    <Box sx={{ mb: 2 }}>
      <Box 
        sx={{ 
          width: '100%', 
          height: 80, 
          backgroundColor: color,
          borderRadius: 1,
          border: color === '#FFFFFF' ? `1px solid ${theme.palette.neutral[300]}` : 'none'
        }} 
      />
      <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
        {name}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {color}
      </Typography>
    </Box>
  );
};

const Section = ({ title, children }) => (
  <Box sx={{ mb: 8 }}>
    <Typography variant="h2" sx={{ mb: 4 }}>{title}</Typography>
    {children}
  </Box>
);

const DesignSystem = () => {
  const theme = useTheme();

  return (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', p: 4 }}>
      <Typography variant="h1" sx={{ mb: 6 }}>Design System</Typography>

      <Section title="Colors">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h4" sx={{ mb: 3 }}>Primary</Typography>
            <ColorBox color={colors.primary.main} name="Primary Main" />
            <ColorBox color={colors.primary.light} name="Primary Light" />
            <ColorBox color={colors.primary.dark} name="Primary Dark" />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h4" sx={{ mb: 3 }}>Secondary</Typography>
            <ColorBox color={colors.secondary.main} name="Secondary Main" />
            <ColorBox color={colors.secondary.light} name="Secondary Light" />
            <ColorBox color={colors.secondary.dark} name="Secondary Dark" />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h4" sx={{ mb: 3 }}>Neutral</Typography>
            <ColorBox color={colors.neutral[100]} name="Neutral 100" />
            <ColorBox color={colors.neutral[300]} name="Neutral 300" />
            <ColorBox color={colors.neutral[500]} name="Neutral 500" />
            <ColorBox color={colors.neutral[700]} name="Neutral 700" />
          </Grid>
        </Grid>
      </Section>

      <Section title="Typography">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h1">Heading 1</Typography>
          <Typography variant="h2">Heading 2</Typography>
          <Typography variant="h3">Heading 3</Typography>
          <Typography variant="h4">Heading 4</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>Body 1: Main body text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>Body 2: Secondary text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>Caption text</Typography>
        </Box>
      </Section>

      <Section title="Components">
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" sx={{ mb: 3 }}>Buttons</Typography>
            <Box sx={{ 
              p: 4, 
              backgroundColor: 'background.paper', 
              borderRadius: 2,
              border: 1,
              borderColor: 'neutral.300'
            }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Primary Button</Typography>
                  <Button variant="contained" size="large">Primary Button</Button>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Secondary Button</Typography>
                  <Button variant="outlined" size="large">Secondary Button</Button>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Text Button</Typography>
                  <Button variant="text" size="large">Text Button</Button>
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h4" sx={{ mb: 3 }}>Input Fields</Typography>
            <Box sx={{ '& > div': { mb: 2 } }}>
              <TextField 
                label="Text Input" 
                placeholder="Enter some text"
                fullWidth 
              />
              <TextField 
                label="Disabled Input"
                disabled
                fullWidth
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h4" sx={{ mb: 3 }}>Cards</Typography>
            <Card>
              <CardContent>
                <Typography variant="h4" gutterBottom>Card Title</Typography>
                <Typography variant="body1">
                  This is an example card component with some content inside it.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h4" sx={{ mb: 3 }}>Chips</Typography>
            <Box sx={{ '& > div': { mr: 1 } }}>
              <Chip label="Default Chip" />
              <Chip label="Primary Chip" color="primary" />
              <Chip label="Secondary Chip" color="secondary" />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h4" sx={{ mb: 3 }}>Messages</Typography>
            <Box sx={{ maxWidth: '600px' }}>
              <Message 
                content="This is an assistant message that demonstrates our professional design." 
                timestamp={new Date()} 
                variant="assistant"
              />
              <Message 
                content="This is a user message with our primary brand color." 
                timestamp={new Date()} 
                variant="user"
              />
            </Box>
          </Grid>
        </Grid>
      </Section>
    </Box>
  );
};

export default DesignSystem;
