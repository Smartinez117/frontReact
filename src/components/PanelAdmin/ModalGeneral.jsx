// ModalGeneral.jsx
import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

export default function ModalGeneral({ open, entity, data, onClose, onSave }) {
  const [formData, setFormData] = React.useState(data || {});

  React.useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{entity ? `Editar ${entity}` : 'Modal'}</DialogTitle>
      <DialogContent dividers>
        {formData ? (
          <>
            {Object.keys(formData).map((key) => (
              <TextField
                key={key}
                margin="dense"
                label={key}
                name={key}
                fullWidth
                value={formData[key]}
                onChange={handleChange}
              />
            ))}
          </>
        ) : (
          <p>No hay datos</p>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}
