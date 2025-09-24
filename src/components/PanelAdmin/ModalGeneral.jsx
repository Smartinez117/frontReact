// src/components/PanelAdmin/ModalGeneral.jsx
import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

function capitalize(s) {
  return typeof s === 'string' && s.length > 0 ? s[0].toUpperCase() + s.slice(1) : s;
}

export default function ModalGeneral({
  open = false,
  entity = '',
  data = null,
  fields = null,
  onClose = () => {},
  onSave = () => {}
}) {
  const [formData, setFormData] = useState(data || {});

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  if (!open) return null;

  // Si no recibimos "fields", los generamos a partir de las keys de data (todos text)
  const effectiveFields = Array.isArray(fields) && fields.length > 0
    ? fields
    : (data ? Object.keys(data).map(k => ({ name: k, label: capitalize(k), type: 'text' })) : []);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{entity ? `Editar ${capitalize(entity)}` : 'Editar'}</DialogTitle>
      <DialogContent dividers>
        {effectiveFields.length === 0 && <p>No hay campos para editar</p>}
        {effectiveFields.map(field => {
          const { name, label = capitalize(name), type = 'text', options = [] } = field;
          const value = formData?.[name] ?? '';

          if (type === 'select') {
            return (
              <FormControl key={name} fullWidth margin="normal">
                <InputLabel id={`label-${name}`}>{label}</InputLabel>
                <Select
                  labelId={`label-${name}`}
                  label={label}
                  value={value}
                  onChange={(e) => handleChange(name, e.target.value)}
                >
                  {Array.isArray(options) && options.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          }

          // por defecto text input
          return (
            <TextField
              key={name}
              label={label}
              name={name}
              fullWidth
              margin="normal"
              value={value}
              onChange={(e) => handleChange(name, e.target.value)}
            />
          );
        })}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={() => onSave(formData)}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}
