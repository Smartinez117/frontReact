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
import Chip from '@mui/joy/Chip'; 

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

// --- Configuración de Columnas ---
const headCells = [
  { id: 'id', numeric: true, disablePadding: true, label: 'ID' },
  { id: 'tipo', numeric: false, disablePadding: false, label: 'Tipo' },
  { id: 'descripcion', numeric: false, disablePadding: false, label: 'Descripción' },
  { id: 'id_usuario', numeric: true, disablePadding: false, label: 'Usuario' },
  { id: 'id_publicacion', numeric: true, disablePadding: false, label: 'Pub ID' },
  { id: 'fecha_creacion', numeric: false, disablePadding: false, label: 'Fecha' },
  { id: 'acciones', numeric: false, disablePadding: false, label: 'Acciones' },
];

// --- Cabecera de Tabla ---
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
            slotProps={{ input: { 'aria-label': 'select all reports' } }}
            sx={{ verticalAlign: 'sub' }}
          />
        </th>
        
        {headCells.map((headCell) => {
          const active = orderBy === headCell.id;
          return (
            <th
              key={headCell.id}
              aria-sort={active ? { asc: 'ascending', desc: 'descending' }[order] : undefined}
              style={{ 
                width: headCell.id === 'id' ? '60px' : 
                       headCell.id === 'tipo' ? '120px' : 
                       headCell.id === 'descripcion' ? 'auto' : 
                       '120px' 
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

// --- Barra de Herramientas con Filtro ---
function EnhancedTableToolbar({ numSelected, onDeleteSelected, filterPubId, setFilterPubId, onFilterSubmit, onClearFilter }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 2,
        pl: 2,
        pr: 2,
        bgcolor: numSelected > 0 ? 'background.level1' : 'background.surface',
        borderRadius: 'sm',
        mb: 2,
        flexWrap: 'wrap',
        gap: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      {numSelected > 0 ? (
        <Typography sx={{ flex: '1 1 100%' }} component="div">
          {numSelected} seleccionado(s)
        </Typography>
      ) : (
        <Typography level="h3" component="div">
          Gestión de Reportes
        </Typography>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Eliminar seleccionados">
          <IconButton size="sm" color="danger" variant="solid" onClick={onDeleteSelected}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        /* SECCIÓN DE FILTROS (IGUAL A COMENTARIOS) */
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onFilterSubmit();
            }}
            style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}
          >
            <FormControl size="sm">
              <FormLabel>Filtrar por ID Publicación</FormLabel>
              <Input
                placeholder="Ej: 10"
                type="number"
                value={filterPubId}
                onChange={(e) => setFilterPubId(e.target.value)}
                startDecorator={<FilterListIcon />}
                endDecorator={
                  filterPubId && (
                    <IconButton size="sm" variant="plain" color="neutral" onClick={onClearFilter}>
                      <ClearIcon />
                    </IconButton>
                  )
                }
              />
            </FormControl>
            <Button type="submit" size="sm" startDecorator={<SearchIcon />}>
              Buscar
            </Button>
          </form>
        </Box>
      )}
    </Box>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function ReportesAdmin() {
  const [order, setOrder] = React.useState('desc');
  const [orderBy, setOrderBy] = React.useState('id');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  // Estado para filtros
  const [filterPubId, setFilterPubId] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState(null);

  // 1. Obtener Reportes (Con lógica de filtro)
  const fetchReportes = async (publicacionId = null) => {
    setLoading(true);
    try {
      let url = `${API_URL}/reportes`;
      
      // Si hay filtro, cambiamos URL
      if (publicacionId) {
        url = `${API_URL}/reportes/publicacion/${publicacionId}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        let lista = Array.isArray(data) ? data : [];

        // --- INYECCIÓN DE ID SI FALTA (Para que el link funcione) ---
        if (publicacionId) {
            lista = lista.map(reporte => ({
                ...reporte,
                id_publicacion: reporte.id_publicacion || publicacionId
            }));
        }
        // -----------------------------------------------------------

        setRows(lista);
        setPage(0);
        setSelected([]); // Limpiar selección al cambiar vista
      } else {
        console.error("Error obteniendo reportes");
        setRows([]);
      }
    } catch (error) {
      console.error("Error de red:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReportes();
  }, []);

  // Manejadores de Filtro
  const handleFilterSubmit = () => {
    if (filterPubId.trim()) {
      setActiveFilter(filterPubId);
      fetchReportes(filterPubId);
    } else {
      handleClearFilter();
    }
  };

  const handleClearFilter = () => {
    setFilterPubId('');
    setActiveFilter(null);
    fetchReportes(null); // Traer todos
  };

  // 2. Eliminar Individual
  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar/cerrar este reporte?")) return;
    try {
      const res = await fetch(`${API_URL}/reportes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRows(prev => prev.filter(r => r.id !== id));
        setSelected(prev => prev.filter(itemId => itemId !== id));
      } else {
        alert("Error al eliminar reporte");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 3. Eliminar Masivo
  const handleDeleteSelected = async () => {
    if (!window.confirm(`¿Eliminar ${selected.length} reportes?`)) return;
    
    const promises = selected.map(id => 
        fetch(`${API_URL}/reportes/${id}`, { method: 'DELETE' })
    );

    try {
        await Promise.all(promises);
        setRows(prev => prev.filter(r => !selected.includes(r.id)));
        setSelected([]);
    } catch (error) {
        console.error("Error en borrado masivo", error);
    }
  };

  // --- Helpers UI ---
  const getChipColor = (tipo) => {
    if (!tipo) return 'neutral';
    const lower = tipo.toLowerCase();
    if (lower.includes('abuso') || lower.includes('fraude') || lower.includes('peligroso')) return 'danger';
    if (lower.includes('spam') || lower.includes('engañoso')) return 'warning';
    return 'primary';
  };

  // --- Manejadores de Tabla ---
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

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
    if (selectedIndex === -1) newSelected = newSelected.concat(selected, id);
    else if (selectedIndex === 0) newSelected = newSelected.concat(selected.slice(1));
    else if (selectedIndex === selected.length - 1) newSelected = newSelected.concat(selected.slice(0, -1));
    else if (selectedIndex > 0) newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    setSelected(newSelected);
  };

  const handleChangePage = (newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event, newValue) => {
    setRowsPerPage(parseInt(newValue.toString(), 10));
    setPage(0);
  };

  // Paginación
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;
  function labelDisplayedRows({ from, to, count }) { return `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`; }
  const getLabelDisplayedRowsTo = () => rows.length === -1 ? (page + 1) * rowsPerPage : (rowsPerPage === -1 ? rows.length : Math.min(rows.length, (page + 1) * rowsPerPage));

  return (
    <CssVarsProvider>
      <JoyCssBaseline />
      <Sheet
        variant="outlined"
        sx={{
          width: '100%',
          maxWidth: '1100px',
          mx: 'auto',
          boxShadow: 'sm',
          borderRadius: 'sm',
          p: 2,
          mt: 4
        }}
      >
        <EnhancedTableToolbar 
            numSelected={selected.length} 
            onDeleteSelected={handleDeleteSelected}
            // Props de filtrado
            filterPubId={filterPubId}
            setFilterPubId={setFilterPubId}
            onFilterSubmit={handleFilterSubmit}
            onClearFilter={handleClearFilter}
        />

        <Table hoverRow sx={{ '& tr > *:last-child': { textAlign: 'center' } }}>
          <EnhancedTableHead
            numSelected={selected.length}
            order={order}
            orderBy={orderBy}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            rowCount={rows.length}
          />
          <tbody>
            {[...rows]
              .sort(getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                const isItemSelected = selected.includes(row.id);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <tr
                    key={row.id}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    selected={isItemSelected}
                    style={isItemSelected ? { '--TableCell-dataBackground': 'var(--TableCell-selectedBackground)' } : {}}
                  >
                    <td style={{ textAlign: 'center' }}>
                      <Checkbox
                        checked={isItemSelected}
                        onChange={(event) => handleClick(event, row.id)}
                        slotProps={{ input: { 'aria-labelledby': labelId } }}
                      />
                    </td>
                    <td><Typography level="body-xs">{row.id}</Typography></td>
                    <td>
                        <Chip color={getChipColor(row.tipo)} size="sm" variant="soft">
                            {row.tipo}
                        </Chip>
                    </td>
                    <td>
                        <Typography level="body-sm" noWrap sx={{ maxWidth: '250px' }}>
                            {row.descripcion}
                        </Typography>
                    </td>
                    <td><Typography level="body-xs">{row.id_usuario || 'Anon'}</Typography></td>
                    <td>
                        <Link href={`/publicacion/${row.id_publicacion}`} target="_blank" level="body-xs">
                            {row.id_publicacion}
                        </Link>
                    </td>
                    <td>
                        <Typography level="body-xs">
                            {/* Usamos fecha_creacion y formateamos incluyendo hora */}
                            {row.fecha_creacion 
                                ? new Date(row.fecha_creacion).toLocaleString('es-AR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) 
                                : '-'}
                        </Typography>
                    </td>
                    <td>
                      <Tooltip title="Eliminar / Resolver">
                        <IconButton size="sm" color="danger" variant="plain" onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(row.id);
                        }}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                );
              })}
            
            {rows.length === 0 && !loading && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>No hay reportes.</td></tr>
            )}
            {emptyRows > 0 && <tr style={{ height: `calc(${emptyRows} * 40px)` }}><td colSpan={7} /></tr>}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={7}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                  <FormControl orientation="horizontal" size="sm">
                    <FormLabel>Filas:</FormLabel>
                    <Select onChange={handleChangeRowsPerPage} value={rowsPerPage}>
                      <Option value={5}>5</Option>
                      <Option value={10}>10</Option>
                      <Option value={25}>25</Option>
                    </Select>
                  </FormControl>
                  <Typography sx={{ textAlign: 'center', minWidth: 80 }}>
                    {labelDisplayedRows({ from: rows.length === 0 ? 0 : page * rowsPerPage + 1, to: getLabelDisplayedRowsTo(), count: rows.length === -1 ? -1 : rows.length })}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="sm" color="neutral" variant="outlined" disabled={page === 0} onClick={() => handleChangePage(page - 1)}>
                      <KeyboardArrowLeftIcon />
                    </IconButton>
                    <IconButton size="sm" color="neutral" variant="outlined" disabled={rows.length !== -1 ? page >= Math.ceil(rows.length / rowsPerPage) - 1 : false} onClick={() => handleChangePage(page + 1)}>
                      <KeyboardArrowRightIcon />
                    </IconButton>
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