import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/joy/Box';
import Table from '@mui/joy/Table';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import Checkbox from '@mui/joy/Checkbox';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import Link from '@mui/joy/Link';
import Tooltip from '@mui/joy/Tooltip';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';

// Iconos
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import { visuallyHidden } from '@mui/utils';
import { CssVarsProvider } from '@mui/joy/styles';
import JoyCssBaseline from '@mui/joy/CssBaseline';

// --- IMPORTACIÓN DEL SERVICIO ---
import { confirmarAccion, mostrarAlerta } from "../../../utils/confirmservice";

// --- 1. CORRECCIÓN DE URL (NORMALIZACIÓN) ---
const RAW_URL = import.meta.env.VITE_API_URL;
const API_URL = RAW_URL.endsWith('/') ? RAW_URL : `${RAW_URL}/`;

// --- Funciones de Utilidad para Ordenamiento ---
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
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
  { id: 'nombre', numeric: false, disablePadding: false, label: 'Nombre de Etiqueta' },
  { id: 'acciones', numeric: false, disablePadding: false, label: 'Acciones' },
];

// --- Componente Cabecera de Tabla ---
function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <thead>
      <tr>
        <th>
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            slotProps={{ input: { 'aria-label': 'select all labels' } }}
            sx={{ verticalAlign: 'sub' }}
          />
        </th>
        {headCells.map((headCell) => {
          const active = orderBy === headCell.id;
          return (
            <th
              key={headCell.id}
              aria-sort={active ? { asc: 'ascending', desc: 'descending' }[order] : undefined}
              style={{ width: headCell.id === 'id' ? '10%' : headCell.id === 'nombre' ? '60%' : '30%' }}
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

// --- Barra de Herramientas ---
function EnhancedTableToolbar(props) {
  const { numSelected, onDeleteSelected, onAddNew } = props;

  return (
    <Box
      sx={[
        {
          display: 'flex', alignItems: 'center', py: 1, pl: { sm: 2 }, pr: { xs: 1, sm: 1 },
          borderTopLeftRadius: 'var(--unstable_actionRadius)',
          borderTopRightRadius: 'var(--unstable_actionRadius)',
        },
        numSelected > 0 && { bgcolor: 'background.level1' },
      ]}
    >
      {numSelected > 0 ? (
        <Typography sx={{ flex: '1 1 100%' }} component="div">{numSelected} seleccionada(s)</Typography>
      ) : (
        <Typography level="body-lg" sx={{ flex: '1 1 100%' }} id="tableTitle" component="div">Gestión de Etiquetas</Typography>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Eliminar seleccionados">
          <IconButton size="sm" color="danger" variant="solid" onClick={onDeleteSelected}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Box sx={{ display: 'flex', gap: 1 }}>
            <Button startDecorator={<AddIcon />} size="sm" onClick={onAddNew}>Nueva Etiqueta</Button>
            <Tooltip title="Filter list">
                <IconButton size="sm" variant="outlined" color="neutral"><FilterListIcon /></IconButton>
            </Tooltip>
        </Box>
      )}
    </Box>
  );
}

// --- COMPONENTE PRINCIPAL ---
export default function EtiquetasAdmin() {
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('nombre');
  const [selected, setSelected] = React.useState([]); 
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = React.useState([]);
  const [openModal, setOpenModal] = React.useState(false);
  const [newTagName, setNewTagName] = React.useState('');

  // 1. CARGAR DATOS (GET)
  const fetchEtiquetas = async () => {
    try {
        const response = await fetch(`${API_URL}api/etiquetas`);
        if (response.ok) {
            const data = await response.json();
            setRows(data);
        } else {
            console.error('Error al cargar etiquetas');
        }
    } catch (error) {
        console.error('Error de red:', error);
    }
  };

  React.useEffect(() => { fetchEtiquetas(); }, []);

  // 2. CREAR ETIQUETA (POST)
  const handleCreateEtiqueta = async () => {
    if (!newTagName.trim()) return;
    try {
        const response = await fetch(`${API_URL}api/etiquetas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: newTagName })
        });

        if (response.ok) {
            setNewTagName('');
            setOpenModal(false);
            fetchEtiquetas(); 
            // Feedback visual positivo opcional
            mostrarAlerta({ titulo: 'Creada', mensaje: 'Etiqueta creada correctamente', tipo: 'success', duracion: 1500 });
        } else {
            const errorData = await response.json();
            // REEMPLAZO DE ALERT
            mostrarAlerta({ titulo: 'Error', mensaje: errorData.error || 'No se pudo crear', tipo: 'error' });
        }
    } catch (error) {
        console.error('Error al crear:', error);
        mostrarAlerta({ titulo: 'Error', mensaje: 'Error de conexión', tipo: 'error' });
    }
  };

  // 3. ELIMINAR ETIQUETA (DELETE) - Individual
  const handleDeleteEtiqueta = (id) => {
    confirmarAccion({
        tipo: 'etiqueta',
        onConfirm: async () => {
             const response = await fetch(`${API_URL}api/etiquetas/${id}`, { method: 'DELETE' });
             if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.error || 'No se pudo eliminar la etiqueta');
             }
             // Si todo sale bien, actualizamos estado
             setSelected(prev => prev.filter(itemId => itemId !== id));
             fetchEtiquetas(); 
        }
    });
  };

  // 4. ELIMINAR MÚLTIPLES
  const handleDeleteSelected = () => {
    confirmarAccion({
        tipo: 'etiqueta',
        dato: `${selected.length} etiquetas`, // Feedback visual en el mensaje
        onConfirm: async () => {
            const deletePromises = selected.map(id => 
                fetch(`${API_URL}api/etiquetas/${id}`, { method: 'DELETE' }).then(res => {
                    if(!res.ok) throw new Error(`Error eliminando ID ${id}`);
                    return res;
                })
            );
            await Promise.all(deletePromises);
            setSelected([]);
            fetchEtiquetas();
        }
    });
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

  const handleChangePage = (newPage) => { setPage(newPage); };
  const handleChangeRowsPerPage = (event, newValue) => {
    setRowsPerPage(parseInt(newValue.toString(), 10));
    setPage(0);
  };

  // --- Renderizado Auxiliar ---
  function labelDisplayedRows({ from, to, count }) {
    return `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`;
  }

  const getLabelDisplayedRowsTo = () => {
    if (rows.length === -1) return (page + 1) * rowsPerPage;
    return rowsPerPage === -1 ? rows.length : Math.min(rows.length, (page + 1) * rowsPerPage);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <CssVarsProvider>
      <JoyCssBaseline />
      
      {/* --- MODAL PARA NUEVA ETIQUETA --- */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <ModalDialog>
            <Typography level="h4">Nueva Etiqueta</Typography>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateEtiqueta(); }}>
                <FormControl>
                    <FormLabel>Nombre</FormLabel>
                    <Input autoFocus required value={newTagName} onChange={(e) => setNewTagName(e.target.value)} />
                </FormControl>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
                    <Button variant="plain" color="neutral" onClick={() => setOpenModal(false)}>Cancelar</Button>
                    <Button type="submit">Guardar</Button>
                </Box>
            </form>
        </ModalDialog>
      </Modal>

      {/* --- TABLA --- */}
      <Sheet variant="outlined" sx={{ width: '100%', boxShadow: 'sm', borderRadius: 'sm' }}>
        <EnhancedTableToolbar numSelected={selected.length} onDeleteSelected={handleDeleteSelected} onAddNew={() => setOpenModal(true)} />
        <Table aria-labelledby="tableTitle" hoverRow sx={{ '& tr > *:last-child': { textAlign: 'right' } }}>
          <EnhancedTableHead numSelected={selected.length} order={order} orderBy={orderBy} onSelectAllClick={handleSelectAllClick} onRequestSort={handleRequestSort} rowCount={rows.length} />
          <tbody>
            {[...rows].sort(getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
              const isItemSelected = selected.includes(row.id);
              const labelId = `enhanced-table-checkbox-${index}`;
              return (
                <tr role="checkbox" aria-checked={isItemSelected} tabIndex={-1} key={row.id} selected={isItemSelected}>
                  <th scope="row">
                    <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, row.id)} slotProps={{ input: { 'aria-labelledby': labelId } }} sx={{ verticalAlign: 'top' }} />
                  </th>
                  <th id={labelId} scope="row">{row.id}</th>
                  <td><Typography fontWeight="lg">{row.nombre}</Typography></td>
                  <td>
                    <IconButton size="sm" color="danger" variant="plain" onClick={(e) => { e.stopPropagation(); handleDeleteEtiqueta(row.id); }}>
                      <DeleteIcon />
                    </IconButton>
                  </td>
                </tr>
              );
            })}
            {emptyRows > 0 && ( <tr style={{ height: `calc(${emptyRows} * 40px)` }}><td colSpan={4} aria-hidden /></tr> )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                  <FormControl orientation="horizontal" size="sm">
                    <FormLabel>Filas por página:</FormLabel>
                    <Select onChange={handleChangeRowsPerPage} value={rowsPerPage}>
                      <Option value={5}>5</Option>
                      <Option value={10}>10</Option>
                      <Option value={25}>25</Option>
                    </Select>
                  </FormControl>
                  <Typography sx={{ textAlign: 'center', minWidth: 80 }}>{labelDisplayedRows({ from: rows.length === 0 ? 0 : page * rowsPerPage + 1, to: getLabelDisplayedRowsTo(), count: rows.length === -1 ? -1 : rows.length })}</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="sm" color="neutral" variant="outlined" disabled={page === 0} onClick={() => handleChangePage(page - 1)} sx={{ bgcolor: 'background.surface' }}><KeyboardArrowLeftIcon /></IconButton>
                    <IconButton size="sm" color="neutral" variant="outlined" disabled={rows.length !== -1 ? page >= Math.ceil(rows.length / rowsPerPage) - 1 : false} onClick={() => handleChangePage(page + 1)} sx={{ bgcolor: 'background.surface' }}><KeyboardArrowRightIcon /></IconButton>
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