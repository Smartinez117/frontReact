import * as React from 'react';
import Avatar from '@mui/joy/Avatar';
import AvatarGroup from '@mui/joy/AvatarGroup';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import CardActions from '@mui/joy/CardActions';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import { CssVarsProvider } from '@mui/joy/styles';
import JoyCssBaseline from '@mui/joy/CssBaseline';

export default function ComentariosAdmin() {
  return (
    <CssVarsProvider>
      <JoyCssBaseline />
      <Card
        variant="outlined"
        sx={{
          width: 320,
          overflow: 'auto',
          resize: 'horizontal',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Avatar src="/static/images/avatar/1.jpg" size="lg" />
        </Box>
        <CardContent>
          <Typography level="title-lg">NYC Coders</Typography>
          <Typography level="body-sm">
            We are a community of developers prepping for coding interviews,
            participate, chat with others and get better at interviewing.
          </Typography>
        </CardContent>
        <CardActions buttonFlex="0 1 120px">
          <Button variant="outlined" color="neutral">
            Ver
          </Button>
          <Button variant="solid" color="danger">
            Borrar
          </Button>
        </CardActions>
      </Card>
    </CssVarsProvider>
  );
}
