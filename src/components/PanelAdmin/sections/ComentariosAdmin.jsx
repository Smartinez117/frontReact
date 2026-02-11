import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/joy/Box';
import Table from '@mui/joy/Table';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Link from '@mui/joy/Link';
import Tooltip from '@mui/joy/Tooltip';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Checkbox from '@mui/joy/Checkbox';

// Iconos
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SearchIcon from '@mui/icons-material/Search';

import { visuallyHidden } from '@mui/utils';
import { CssVarsProvider } from '@mui/joy/styles';
import JoyCssBaseline from '@mui/joy/CssBaseline';

// --- IMPORTACIÓN DEL SERVICIO DE CONFIRMACIÓN ---
import { confirmarAccion } from "../../../utils/confirmservice";

const API_URL = import.meta.env.VITE_API_URL;

// --- Funciones de Utilidad ---
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const headCells = [
  { id: 'id', numeric: true, disablePadding: true, label: 'ID' },
  { id: 'contenido', numeric: false, disablePadding: false, label: 'Comentario' },
  { id: 'id_usuario', numeric: true, disablePadding: false, label: 'User ID' },
  { id: 'id_publicacion', numeric: true, disablePadding: false, label: 'Pub ID' },
  { id: 'fecha_creacion', numeric: false, disablePadding: false, label: 'Fecha' },
  { id: 'acciones', numeric: false, disablePadding: false, label: 'Acciones' },
];

function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <thead>
      <tr>
        <th style={{ width: 48, textAlign: 'center', padding: '12px 6px' }}>
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            sx={{ verticalAlign: 'sub' }}
          />
        </th>
        {headCells.map((headCell) => {
          const active = orderBy === headCell.id;
          return (
            <th
              key={headCell.id}
              style={{ 
                width: headCell.id === 'id' ? '60px' : 
                       headCell.id === 'contenido' ? 'auto' : 
                       headCell.id === 'acciones' ? '80px' : '100px' 
              }}
            >
              {headCell.id !== 'acciones' ? (
                <Link
                  underline="none"
                  color="neutral"
                  textColor={active ? 'primary.plainColor' : undefined}
                  component="button"
                  onClick={createSortHandler(headCell.id)}
                  startDecorator={headCell.numeric ? <ArrowDownwardIcon sx={{ opacity: active ? 1 : 0 }} /> : null}
                  endDecorator={!headCell.numeric ? <ArrowDownwardIcon sx={{ opacity: active ? 1 : 0 }} /> : null}
                  sx={{
                    fontWeight: 'lg',
                    '& svg': { transition: '0.2s', transform: active && order === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)' },
                    '&:hover': { '& svg': { opacity: 1 } },
                  }}
                >
                  {headCell.label}
                  {active ? <Box component="span" sx={visuallyHidden}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</Box> : null}
                </Link>
              ) : (
                headCell.label
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

function EnhancedTableToolbar({ numSelected, onDeleteSelected, filterPubId, setFilterPubId, onFilterSubmit, onClearFilter }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, px: 2, bgcolor: numSelected > 0 ? 'background.level1' : 'background.surface', borderRadius: 'sm', mb: 2, flexWrap: 'wrap', gap: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
      {numSelected > 0 ? (
        <Typography sx={{ flex: '1 1 100%' }} component="div">{numSelected} seleccionado(s)</Typography>
      ) : (
        <Typography level="h3" component="div">Administrar Comentarios</Typography>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Eliminar seleccionados">
          <IconButton size="sm" color="danger" variant="solid" onClick={onDeleteSelected}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <form onSubmit={(e) => { e.preventDefault(); onFilterSubmit(); }} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <FormControl size="sm">
              <FormLabel>Filtrar por ID Publicación</FormLabel>
              <Input
                placeholder="Ej: 10"
                type="number"
                value={filterPubId}
                onChange={(e) => setFilterPubId(e.target.value)}
                startDecorator={<FilterListIcon />}
                endDecorator={filterPubId && (
                  <IconButton size="sm" variant="plain" color="neutral" onClick={onClearFilter}>
                    <ClearIcon />
                  </IconButton>
                )}
              />
            </FormControl>
            <Button type="submit" size="sm" startDecorator={<SearchIcon />}>Buscar</Button>
          </form>
        </Box>
      )}
    </Box>
  );
}

export default function ComentariosAdmin() {
  const [order, setOrder] = React.useState('desc');
  const [orderBy, setOrderBy] = React.useState('id');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [filterPubId, setFilterPubId] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState(null);

  const fetchComentarios = async (publicacionId = null) => {
    setLoading(true);
    try {
      let url = `${API_URL}/comentarios`; 
      if (publicacionId) url = `${API_URL}/comentarios/publicacion/${publicacionId}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        let lista = Array.isArray(data) ? data : [];
        if (publicacionId) {
          lista = lista.map(c => ({ ...c, id_publicacion: c.id_publicacion || publicacionId }));
        }
        setRows(lista);
        setPage(0);
        setSelected([]); 
      }
    } catch (error) {
      console.error('Error de red:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { fetchComentarios(); }, []);

  const handleFilterSubmit = () => {
    if (filterPubId.trim()) {
      setActiveFilter(filterPubId);
      fetchComentarios(filterPubId);
    } else {
      handleClearFilter();
    }
  };

  const handleClearFilter = () => {
    setFilterPubId('');
    setActiveFilter(null);
    fetchComentarios(null);
  };

  // --- ELIMINAR INDIVIDUAL CON confirmService ---
  const handleDeleteComentario = (id) => {
    confirmarAccion({
      tipo: 'comentario',
      onConfirm: async () => {
        const response = await fetch(`${API_URL}/comentarios/${id}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'No se pudo eliminar');
        }
        setRows((prev) => prev.filter((row) => row.id !== id));
        setSelected((prev) => prev.filter((itemId) => itemId !== id));
      }
    });
  };

  // --- ELIMINAR MÚLTIPLES CON confirmService ---
  const handleDeleteSelected = () => {
    confirmarAccion({
      tipo: 'comentario',
      dato: `${selected.length} comentarios`, // Opcional: muestra cantidad en el mensaje
      onConfirm: async () => {
        const deletePromises = selected.map((id) =>
          fetch(`${API_URL}/comentarios/${id}`, { method: 'DELETE' }).then(res => {
              if(!res.ok) throw new Error(`Error al borrar ID: ${id}`);
              return res;
          })
        );
        await Promise.all(deletePromises);
        setRows((prev) => prev.filter((row) => !selected.includes(row.id)));
        setSelected([]);
      }
    });
  };

  // --- Manejadores de Selección ---
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <CssVarsProvider>
      <JoyCssBaseline />
      <Sheet variant="outlined" sx={{ width: '100%', maxWidth: '1000px', mx: 'auto', boxShadow: 'sm', borderRadius: 'sm', p: 2, mt: 4 }}>
        <EnhancedTableToolbar 
          numSelected={selected.length} 
          onDeleteSelected={handleDeleteSelected} 
          filterPubId={filterPubId} 
          setFilterPubId={setFilterPubId} 
          onFilterSubmit={handleFilterSubmit} 
          onClearFilter={handleClearFilter} 
        />
        <Table hoverRow sx={{ '& tr > *:last-child': { textAlign: 'center' } }}>
          <EnhancedTableHead numSelected={selected.length} order={order} orderBy={orderBy} onSelectAllClick={handleSelectAllClick} onRequestSort={handleRequestSort} rowCount={rows.length} />
          <tbody>
            {[...rows].sort(getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
              const isItemSelected = selected.includes(row.id);
              return (
                <tr key={row.id} role="checkbox" aria-checked={isItemSelected} selected={isItemSelected}>
                  <td style={{ textAlign: 'center', width: 48 }}>
                    <Checkbox checked={isItemSelected} onChange={(e) => handleClick(e, row.id)} />
                  </td>
                  <td><Typography level="body-xs">{row.id}</Typography></td>
                  <td><Typography level="body-sm" noWrap sx={{ maxWidth: '300px' }}>{row.descripcion || "Sin contenido"}</Typography></td>
                  <td><Typography level="body-xs">{row.id_usuario}</Typography></td>
                  <td><Link href={`/publicacion/${row.id_publicacion}`} target="_blank" level="body-xs">{row.id_publicacion}</Link></td>
                  <td><Typography level="body-xs">{row.fecha_creacion ? new Date(row.fecha_creacion).toLocaleDateString() : '-'}</Typography></td>
                  <td>
                    <IconButton size="sm" color="danger" variant="plain" onClick={(e) => { e.stopPropagation(); handleDeleteComentario(row.id); }}>
                      <DeleteIcon />
                    </IconButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={7}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                  <FormControl orientation="horizontal" size="sm">
                    <FormLabel>Filas:</FormLabel>
                    <Select onChange={(e, v) => { setRowsPerPage(v); setPage(0); }} value={rowsPerPage}>
                      <Option value={5}>5</Option>
                      <Option value={10}>10</Option>
                      <Option value={25}>25</Option>
                    </Select>
                  </FormControl>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="sm" color="neutral" variant="outlined" disabled={page === 0} onClick={() => setPage(page - 1)}><KeyboardArrowLeftIcon /></IconButton>
                    <IconButton size="sm" color="neutral" variant="outlined" disabled={page >= Math.ceil(rows.length / rowsPerPage) - 1} onClick={() => setPage(page + 1)}><KeyboardArrowRightIcon /></IconButton>
                  </Box>
                </Box>
              </td>
            </tr>
          </tfoot>
        </Table>
      </Sheet>
    </CssVarsProvider>
  );
}