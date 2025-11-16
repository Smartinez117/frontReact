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

  const effectiveFields = Array.isArray(fields) && fields.length > 0
    ? fields
    : (data ? Object.keys(data).map(k => ({ name: k, label: capitalize(k), type: 'text' })) : []);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const renderOption = (opt) => {
    // acepta opt = primitive (string/num) o { value, label }
    if (opt && typeof opt === 'object' && ('value' in opt || 'label' in opt)) {
      const val = opt.value !== undefined ? opt.value : opt.label;
      const lab = opt.label !== undefined ? opt.label : String(opt.value ?? opt);
      return { val, lab };
    }
    return { val: opt, lab: String(opt) };
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
                  renderValue={val => {
                    // mostrar la etiqueta legible en el select cuando options son objetos
                    const found = Array.isArray(options) ? options.map(renderOption).find(o => String(o.val) === String(val)) : null;
                    return found ? found.lab : String(val);
                  }}
                >
                  {Array.isArray(options) && options.map((optRaw) => {
                    const { val, lab } = renderOption(optRaw);
                    return <MenuItem key={String(val)} value={val}>{lab}</MenuItem>;
                  })}
                </Select>
              </FormControl>
            );
          }

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
