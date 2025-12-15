import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  TextField,
  IconButton,
  Divider,
  Chip,
  Grid,
  Paper,
  Box
} from '@mui/material';
import { useToast } from '../../contexts/ToastContext';
import { Close as CloseIcon } from '@mui/icons-material';
import QualityBadge from './QualityBadge';
import { StoreItem } from '../../types/store';
import storeService from '../../services/store.service';

interface Props {
  item: StoreItem;
  onClose: () => void;
  onChanged: () => void;
}

const StoreItemDetailDialog: React.FC<Props> = ({ item, onClose, onChanged }) => {
  const [busy, setBusy] = useState(false);
  const [adjQty, setAdjQty] = useState<number>(0);
  const [useQty, setUseQty] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const { showToast } = useToast();

  const doAdjust = async () => {
    if (!adjQty) return;
    setBusy(true);
    try {
      await storeService.adjustQuantity(item.id, adjQty, notes);
      onChanged();
      showToast('Quantity adjusted', 'success');
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Adjustment failed';
      showToast(msg, 'error');
    } finally { setBusy(false); }
  };
  const doUse = async () => {
    if (!useQty) return;
    setBusy(true);
    try {
      await storeService.useItem(item.id, useQty, notes);
      onChanged();
      showToast('Item used', 'success');
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Use failed';
      showToast(msg, 'error');
    } finally { setBusy(false); }
  };
  const doWriteOff = async () => {
    setBusy(true);
    try {
      await storeService.writeOff(item.id, notes);
      onChanged();
      showToast('Item written off', 'success');
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Write-off failed';
      showToast(msg, 'error');
    } finally { setBusy(false); }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
          color: 'white',
          borderRadius: '4px 4px 0 0',
          position: 'relative',
          padding: 2
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6">Store Item • {item.sku}</Typography>
          <Chip label={item.quality} color="default" variant="outlined" size="small" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.7)' }} />
        </Stack>
        <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={7}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">Details</Typography>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Fabric</Typography>
                  <Typography variant="body2" fontWeight={600}>{item.fabric?.name} ({item.fabric?.fabricCode})</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Product Type</Typography>
                  <Typography variant="body2" fontWeight={600}>{item.productType?.name}</Typography>
                </Stack>
                {item.styleCode && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Style Code</Typography>
                    <Typography variant="body2" fontWeight={600}>{item.styleCode}</Typography>
                  </Stack>
                )}
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Quantity</Typography>
                  <Typography variant="body2" fontWeight={600}>{item.quantity}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Quality</Typography>
                  <QualityBadge quality={item.quality} />
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Source</Typography>
                  <Typography variant="body2" fontWeight={600}>{item.sourceType}</Typography>
                </Stack>
                {item.sourceOrderNumber && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Order #</Typography>
                    <Typography variant="body2" fontWeight={600}>{item.sourceOrderNumber}</Typography>
                  </Stack>
                )}
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Price</Typography>
                  <Typography variant="body2" fontWeight={600}>{item.originalPrice ? `৳ ${item.originalPrice}` : '-'}</Typography>
                </Stack>
              </Stack>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, mt: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
              <Divider sx={{ my: 1 }} />
              <TextField placeholder="Add an optional note" value={notes} onChange={(e) => setNotes(e.target.value)} fullWidth multiline minRows={2} />
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, mt: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Adjustments & Usage</Typography>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <TextField type="number" size="small" label="Adjust ±" value={adjQty} onChange={(e) => setAdjQty(Number(e.target.value))} sx={{ width: 140 }} />
                <Button variant="outlined" onClick={doAdjust} disabled={busy || adjQty === 0}>Apply</Button>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField type="number" size="small" label="Use qty" value={useQty} onChange={(e) => setUseQty(Number(e.target.value))} sx={{ width: 140 }} />
                <Button variant="contained" onClick={doUse} disabled={busy || useQty <= 0}>Use</Button>
                <Button color="error" onClick={doWriteOff} disabled={busy}>Write-off</Button>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={5}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Recent Transactions</Typography>
              <Divider sx={{ my: 1 }} />
              <Stack spacing={1}>
                {item.recentTransactions?.length ? item.recentTransactions.map((tx: any) => (
                  <Box key={tx.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">{tx.transactionType}</Typography>
                    <Typography variant="body2" fontWeight={600}>Qty: {tx.quantity}</Typography>
                  </Box>
                )) : (
                  <Typography variant="body2" color="text.secondary">No transactions</Typography>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={onClose}>Close</Button>
        <Button disabled={busy} variant="contained" color="primary" onClick={async () => { setBusy(true); try { await storeService.useItem(item.id, 1, notes || 'Used from detail'); onChanged(); } finally { setBusy(false); } }}>Quick Use 1</Button>
      </DialogActions>
    </Dialog>
  );
};

export default StoreItemDetailDialog;
