import * as React from 'react';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Grid from '@mui/material/GridLegacy';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DataGrid } from '@mui/x-data-grid';


const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'nombre', headerName: 'Nombre', width: 130 },
  { field: 'email', headerName: 'Email', width: 200 },
  { field: 'rol', headerName: 'Rol', description: 'Muestra si es admin o usuario común', width: 90 },
  { field: 'fecha_registro', headerName: 'Fecha de registro', width: 130 },
  {
    field: 'acciones',
    headerName: 'Acciones',
    width: 250,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const id = params.row.id;
      return (
        <>
          <Button
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
            onClick={() => console.log("Ver usuario:", id)}
          >
            Ver
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            sx={{ mr: 1 }}
            onClick={() => console.log("Editar usuario:", id)}
          >
            Editar
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => console.log("Borrar usuario:", id)}
          >
            Borrar
          </Button>
        </>
      );
    }
  }
];


const rows = [
  { id: 500000, nombre: 'Franco Armani', email: 'pulpo.armani@gmail.com', rol: 'usuario', fecha_registro: '12-01-2018'},
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];

const paginationModel = { page: 0, pageSize: 5 };

export default function UsuariosAdmin() {
  return (
    <Box sx={{ minWidth: 600 }}> {/* 👈 asegura scroll si hay menos espacio */}
      {/* Filtros y acciones */}
      <Toolbar disableGutters sx={{ mb: 2 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid item>
            <SearchIcon color="action" />
          </Grid>
          <Grid item xs>
            <TextField
              fullWidth
              placeholder="Buscar por Nombre o Email"
              InputProps={{
                disableUnderline: true,
                sx: { fontSize: 'default' },
              }}
              variant="standard"
            />
          </Grid>
          <Grid item>
            <Button variant="contained" sx={{ mr: 1 }}>
              Agregar usuario
            </Button>
            <Tooltip title="Reload">
              <IconButton>
                <RefreshIcon color="action" />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Toolbar>

      {/* Tabla */}
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10]}
        autoHeight
        sx={{ border: 0 }}
      />
    </Box>
  );
}
