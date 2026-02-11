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
import ArticleIcon from '@mui/icons-material/Article';
import PersonIcon from '@mui/icons-material/Person';
import CommentIcon from '@mui/icons-material/Comment';

import { visuallyHidden } from '@mui/utils';
import { CssVarsProvider } from '@mui/joy/styles';
import JoyCssBaseline from '@mui/joy/CssBaseline';

// --- IMPORTACIÓN DEL SERVICIO ---
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

// --- Configuración de Columnas ---
const headCells = [
  { id: 'id', numeric: true, disablePadding: true, label: 'ID' },
  { id: 'tipo_reporte', numeric: false, disablePadding: false, label: 'Motivo' },
  { id: 'objetivo_tipo', numeric: false, disablePadding: false, label: 'Objetivo' },
  { id: 'objetivo_id', numeric: true, disablePadding: false, label: 'ID Ref' },
  { id: 'descripcion', numeric: false, disablePadding: false, label: 'Detalle' },
  { id: 'id_usuario_denunciante', numeric: true, disablePadding: false, label: 'Denunciante' },
  { id: 'fecha', numeric: false, disablePadding: false, label: 'Fecha' },
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
              style={{ width: headCell.id === 'descripcion' ? 'auto' : '100px' }}
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
                  sx={{ fontWeight: 'lg' }}
                >
                  {headCell.label}
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

// --- Barra de Herramientas ---
function EnhancedTableToolbar({ numSelected, onDeleteSelected, filterPubId, setFilterPubId, onFilterSubmit, onClearFilter }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, px: 2, bgcolor: numSelected > 0 ? 'background.level1' : 'background.surface', borderRadius: 'sm', mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
      {numSelected > 0 ? (
        <Typography sx={{ flex: '1 1 100%' }} component="div">{numSelected} seleccionado(s)</Typography>
      ) : (
        <Typography level="h3" component="div">Gestión de Reportes</Typography>
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
              <FormLabel>Filtrar por ID Referencia</FormLabel>
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

// --- COMPONENTE PRINCIPAL ---
export default function ReportesAdmin() {
  const [order, setOrder] = React.useState('desc');
  const [orderBy, setOrderBy] = React.useState('id');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [filterPubId, setFilterPubId] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState(null);

  const fetchReportes = async (publicacionId = null) => {
    setLoading(true);
    try {
      let url = `${API_URL}/reportes`;
      if (publicacionId) url = `${API_URL}/reportes/publicacion/${publicacionId}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
        setPage(0);
        setSelected([]);
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

  React.useEffect(() => { fetchReportes(); }, []);

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
    fetchReportes(null);
  };

  // --- ELIMINAR INDIVIDUAL CON confirmService ---
  const handleDelete = (id) => {
    confirmarAccion({
      tipo: 'reporte',
      onConfirm: async () => {
        const res = await fetch(`${API_URL}/reportes/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            throw new Error("No se pudo eliminar el reporte");
        }
        // Actualizar estado local
        setRows(prev => prev.filter(r => r.id !== id));
        setSelected(prev => prev.filter(itemId => itemId !== id));
      }
    });
  };

  // --- ELIMINAR MÚLTIPLE CON confirmService ---
  const handleDeleteSelected = () => {
    confirmarAccion({
        tipo: 'reporte',
        dato: `${selected.length} reportes`,
        onConfirm: async () => {
            const promises = selected.map(id => fetch(`${API_URL}/reportes/${id}`, { method: 'DELETE' }).then(res => {
                if(!res.ok) throw new Error(`Error en ID ${id}`);
                return res;
            }));
            await Promise.all(promises);
            // Actualizar estado local
            setRows(prev => prev.filter(r => !selected.includes(r.id)));
            setSelected([]);
        }
    });
  };

  // Helpers UI
  const getMotivoColor = (tipo) => {
    if (!tipo) return 'neutral';
    const lower = tipo.toLowerCase();
    if (lower.includes('abuso') || lower.includes('fraude')) return 'danger';
    if (lower.includes('spam')) return 'warning';
    return 'primary';
  };

  const getObjetivoIcon = (tipo) => {
      switch(tipo) {
          case 'Publicación': return <ArticleIcon />;
          case 'Usuario': return <PersonIcon />;
          case 'Comentario': return <CommentIcon />;
          default: return null;
      }
  };

  const getObjetivoColor = (tipo) => {
      switch(tipo) {
          case 'Publicación': return 'success';
          case 'Usuario': return 'primary';
          case 'Comentario': return 'warning';
          default: return 'neutral';
      }
  };

  // Manejadores Tabla
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;
  function labelDisplayedRows({ from, to, count }) { return `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`; }
  const getLabelDisplayedRowsTo = () => rows.length === -1 ? (page + 1) * rowsPerPage : (rowsPerPage === -1 ? rows.length : Math.min(rows.length, (page + 1) * rowsPerPage));

  return (
    <CssVarsProvider>
      <JoyCssBaseline />
      <Sheet variant="outlined" sx={{ width: '100%', maxWidth: '1200px', mx: 'auto', boxShadow: 'sm', borderRadius: 'sm', p: 2, mt: 4 }}>
        <EnhancedTableToolbar numSelected={selected.length} onDeleteSelected={handleDeleteSelected} filterPubId={filterPubId} setFilterPubId={setFilterPubId} onFilterSubmit={handleFilterSubmit} onClearFilter={handleClearFilter} />
        <Table hoverRow sx={{ '& tr > *:last-child': { textAlign: 'center' } }}>
          <EnhancedTableHead numSelected={selected.length} order={order} orderBy={orderBy} onSelectAllClick={handleSelectAllClick} onRequestSort={handleRequestSort} rowCount={rows.length} />
          <tbody>
            {[...rows].sort(getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
              const isItemSelected = selected.includes(row.id);
              const labelId = `enhanced-table-checkbox-${index}`;
              return (
                <tr key={row.id} role="checkbox" aria-checked={isItemSelected} selected={isItemSelected} style={isItemSelected ? { '--TableCell-dataBackground': 'var(--TableCell-selectedBackground)' } : {}}>
                  <td style={{ textAlign: 'center' }}>
                    <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, row.id)} slotProps={{ input: { 'aria-labelledby': labelId } }} />
                  </td>
                  <td><Typography level="body-xs">{row.id}</Typography></td>
                  <td><Chip color={getMotivoColor(row.tipo_reporte)} size="sm" variant="soft">{row.tipo_reporte}</Chip></td>
                  <td>
                    <Chip color={getObjetivoColor(row.objetivo_tipo)} startDecorator={getObjetivoIcon(row.objetivo_tipo)} size="sm" variant="outlined">{row.objetivo_tipo}</Chip>
                  </td>
                  <td>
                    {row.objetivo_tipo === 'Publicación' && (<Link href={`/publicacion/${row.objetivo_id}`} target="_blank" level="body-xs">{row.objetivo_id}</Link>)}
                    {row.objetivo_tipo === 'Usuario' && (<Link href={`/perfil/${row.objetivo_slug}`} target="_blank" level="body-xs">{row.objetivo_id}</Link>)}
                    {row.objetivo_tipo === 'Comentario' && (<Link href={`/publicacion/${row.id_publicacion}`} target="_blank" level="body-xs" sx={{ color: 'warning.plainColor' }}>{row.objetivo_id}</Link>)}
                  </td>
                  <td><Typography level="body-sm" noWrap sx={{ maxWidth: '200px' }} title={row.descripcion}>{row.descripcion || "-"}</Typography></td>
                  <td><Typography level="body-sm">{row.id_usuario_denunciante}</Typography></td>
                  <td>
                    <Typography level="body-xs">
                        {row.fecha_creacion ? new Date(row.fecha_creacion).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                    </Typography>
                  </td>
                  <td>
                    <Tooltip title="Eliminar reporte">
                      <IconButton size="sm" color="danger" variant="plain" onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && !loading && (<tr><td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>No hay reportes.</td></tr>)}
            {emptyRows > 0 && <tr style={{ height: `calc(${emptyRows} * 40px)` }}><td colSpan={8} /></tr>}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                  <FormControl orientation="horizontal" size="sm">
                    <FormLabel>Filas:</FormLabel>
                    <Select onChange={handleChangeRowsPerPage} value={rowsPerPage}>
                      <Option value={5}>5</Option>
                      <Option value={10}>10</Option>
                      <Option value={25}>25</Option>
                    </Select>
                  </FormControl>
                  <Typography sx={{ textAlign: 'center', minWidth: 80 }}>{labelDisplayedRows({ from: rows.length === 0 ? 0 : page * rowsPerPage + 1, to: getLabelDisplayedRowsTo(), count: rows.length === -1 ? -1 : rows.length })}</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="sm" color="neutral" variant="outlined" disabled={page === 0} onClick={() => handleChangePage(page - 1)}><KeyboardArrowLeftIcon /></IconButton>
                    <IconButton size="sm" color="neutral" variant="outlined" disabled={rows.length !== -1 ? page >= Math.ceil(rows.length / rowsPerPage) - 1 : false} onClick={() => handleChangePage(page + 1)}><KeyboardArrowRightIcon /></IconButton>
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