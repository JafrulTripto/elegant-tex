import React, { useEffect, useState, useMemo } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Stack, IconButton, Divider, Typography, Grid, Paper, Box, Chip } from '@mui/material';
import { Close as CloseIcon, Inventory2Outlined, CategoryOutlined, NumbersOutlined, FactCheckOutlined, NoteOutlined } from '@mui/icons-material';
import { ManualStoreItemRequest, STORE_QUALITIES } from '../../types/store';
import * as fabricService from '../../services/fabric.service';
import * as productTypeService from '../../services/productType.service';
import storeService from '../../services/store.service';
import { Fabric } from '../../types/fabric';
import { ProductType } from '../../types/productType';
import { ConfirmationDialog } from '../common';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const AddManualItemDialog: React.FC<Props> = ({ open, onClose, onCreated }) => {
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [form, setForm] = useState<ManualStoreItemRequest>({ fabricId: 0, productTypeId: 0, quantity: 1, quality: 'GOOD', reason: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const selectedFabric = useMemo(() => fabrics.find(f => f.id === form.fabricId), [fabrics, form.fabricId]);
  const selectedProductType = useMemo(() => productTypes.find(pt => pt.id === form.productTypeId), [productTypes, form.productTypeId]);

  useEffect(() => {
    if (open) {
      // load first page of fabrics and all active product types
      fabricService.getFabrics(0, 50, 'name', 'asc', '', true).then((res) => setFabrics(res.content || res)).catch(() => {});
      productTypeService.getActiveProductTypes().then(setProductTypes).catch(() => {});
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!form.fabricId || !form.productTypeId || !form.quantity) return;
    setSubmitting(true);
    try {
      await storeService.createManualItem(form);
      onCreated();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
          color: 'white',
          borderRadius: '4px 4px 0 0',
          position: 'relative',
          padding: 2
        }}
      >
        <Typography variant="h6" component="h2">Add Manual Store Item</Typography>
        <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Item Details</Typography>
              <Divider sx={{ my: 1 }} />
              <Stack spacing={2}>
          <TextField
            select
            label="Fabric"
            value={form.fabricId || ''}
            onChange={(e) => setForm({ ...form, fabricId: Number(e.target.value) })}
            fullWidth
          >
            {fabrics.map(f => (
              <MenuItem key={f.id} value={f.id}>{f.name} ({f.fabricCode})</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Product Type"
            value={form.productTypeId || ''}
            onChange={(e) => setForm({ ...form, productTypeId: Number(e.target.value) })}
            fullWidth
          >
            {productTypes.map(pt => (
              <MenuItem key={pt.id} value={pt.id}>{pt.name}</MenuItem>
            ))}
          </TextField>

          <TextField
            type="number"
            label="Quantity"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: Math.max(1, Number(e.target.value)) })}
            fullWidth
          />

          <TextField
            select
            label="Quality"
            value={form.quality}
            onChange={(e) => setForm({ ...form, quality: e.target.value })}
            fullWidth
          >
            {STORE_QUALITIES.map(q => (
              <MenuItem key={q} value={q}>{q.replace('_', ' ')}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Reason"
            value={form.reason || ''}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            fullWidth
          />
          <TextField
            label="Notes"
            value={form.notes || ''}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            fullWidth
            multiline
            minRows={2}
          />
              </Stack>
            </Paper>
          </Grid>
          {/* Review removed as requested */}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={() => setConfirmOpen(true)} 
          disabled={submitting || !form.fabricId || !form.productTypeId || !form.quantity}
          sx={{ textTransform: 'none' }}
        >
          Add to Inventory
        </Button>
      </DialogActions>

      {/* Confirm Add to Inventory - Enhanced dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
            color: 'white',
            borderRadius: '4px 4px 0 0',
            position: 'relative',
            padding: 2
          }}
        >
          Confirm Inventory Addition
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Inventory2Outlined fontSize="small" color="primary" />
              <Typography variant="body2" fontWeight={600} sx={{ minWidth: 120 }}>Fabric</Typography>
              <Chip label={selectedFabric ? `${selectedFabric.name} (${selectedFabric.fabricCode})` : '-'} size="small" />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <CategoryOutlined fontSize="small" color="primary" />
              <Typography variant="body2" fontWeight={600} sx={{ minWidth: 120 }}>Product Type</Typography>
              <Chip label={selectedProductType ? selectedProductType.name : '-'} size="small" />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <NumbersOutlined fontSize="small" color="primary" />
              <Typography variant="body2" fontWeight={600} sx={{ minWidth: 120 }}>Quantity</Typography>
              <Chip label={String(form.quantity)} size="small" color={form.quantity > 100 ? 'warning' : 'default'} />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <FactCheckOutlined fontSize="small" color="primary" />
              <Typography variant="body2" fontWeight={600} sx={{ minWidth: 120 }}>Quality</Typography>
              <Chip label={form.quality.replace('_', ' ')} size="small" variant="outlined" />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <NoteOutlined fontSize="small" color="primary" />
              <Typography variant="body2" fontWeight={600} sx={{ minWidth: 120 }}>Reason</Typography>
              <Typography variant="body2">{form.reason || '-'}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <NoteOutlined fontSize="small" color="primary" />
              <Typography variant="body2" fontWeight={600} sx={{ minWidth: 120 }}>Notes</Typography>
              <Typography variant="body2">{form.notes || '-'}</Typography>
            </Stack>
            {form.quantity > 100 && (
              <Typography variant="caption" color="warning.main" sx={{ mt: 1 }}>
                Large quantity detected. Please double-check before confirming.
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={async () => { await handleSubmit(); }} 
            disabled={submitting}
            sx={{ textTransform: 'none' }}
          >
            {submitting ? 'Adding...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default AddManualItemDialog;
