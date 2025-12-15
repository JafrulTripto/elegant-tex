import React, { useEffect, useMemo, useState } from 'react';
import { 
  Box, Button, Container, Paper, Stack, TextField, Typography, useTheme,
  IconButton
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { DataGrid, GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useAuth } from '../hooks/useAuth';
import { useTheme as useAppTheme } from '../hooks/useTheme';
import { spacing } from '../theme/styleUtils';
import storeService from '../services/store.service';
import { StoreItem, STORE_QUALITIES } from '../types/store';
import QualityBadge from '../components/store/QualityBadge';
import AddManualItemDialog from '../components/store/AddManualItemDialog';
import StoreItemDetailDialog from '../components/store/StoreItemDetailDialog';
import { 
  Info as InfoIcon, 
  AddCircleOutline as AddIcon,
  Inventory2Outlined as InventoryIcon
} from '@mui/icons-material';

const StorePage: React.FC = () => {
  const theme = useTheme();
  const { mode } = useAppTheme();
  const { authState } = useAuth();
  const canUpdate = authState.user?.permissions?.includes('STORE_UPDATE') || authState.user?.roles.includes('ROLE_ADMIN');

  const [rows, setRows] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'createdAt', sort: 'desc' }] );
  const [skuSearch, setSkuSearch] = useState('');
  const [qualityFilter, setQualityFilter] = useState<string>('');
  const [onlyWithStock, setOnlyWithStock] = useState<boolean>(false);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);

  const columns: GridColDef[] = [
    { field: 'sku', headerName: 'SKU', flex: 1, minWidth: 140 },
    { field: 'fabricName', headerName: 'Fabric', flex: 1, minWidth: 140, valueGetter: (_, row) => row?.fabric?.name ?? ''  },
    { field: 'productTypeName', headerName: 'Product Type', flex: 1, minWidth: 140, valueGetter: (_, row) => row?.productType?.name ?? '' },
    { field: 'styleCode', headerName: 'Style Code', width: 140, valueGetter: (_, row) => row?.styleCode ?? '-' },
    { field: 'quantity', headerName: 'Qty', width: 90, type: 'number' },
    { field: 'quality', headerName: 'Quality', width: 120, renderCell: (p) => <QualityBadge quality={p.value} /> },
    { field: 'sourceType', headerName: 'Source', width: 150 },
    { field: 'sourceOrderNumber', headerName: 'Order #', width: 140 },
    { field: 'originalPrice', headerName: 'Price', width: 110, type: 'number', valueFormatter: (value) => value ? `৳ ${value}` : '-' },
    { field: 'actions', headerName: 'Actions', width: 110, sortable: false, filterable: false,
      renderCell: (params) => (
        <IconButton aria-label="details" color="primary" onClick={() => setSelectedItem(params.row as StoreItem)}>
          <InfoIcon />
        </IconButton>
      )
    },
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const sort = sortModel[0] ? `${sortModel[0].field},${sortModel[0].sort}` : undefined;
      const pageRes = await storeService.listItems({
        sku: skuSearch || undefined,
        quality: qualityFilter || undefined,
        onlyWithStock,
        page: paginationModel.page,
        size: paginationModel.pageSize,
        sort,
      });
      setRows(pageRes.content);
      setTotal(pageRes.totalElements);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [paginationModel, sortModel]);

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ my: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header Section - Match FabricsPage style */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            mb: 2,
            pb: 1,
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <InventoryIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography 
                variant="h5" 
                component="h1"
                sx={{ fontWeight: 500 }}
              >
                Store
              </Typography>
            </Box>
            {canUpdate && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setManualDialogOpen(true)}
                sx={{ 
                  height: { xs: 36, sm: 40 },
                  px: { xs: 1.5, sm: 2 }
                }}
              >
                Add Manual Item
              </Button>
            )}
          </Box>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ ml: { sm: 4 } }}
          >
            Manage your store inventory and adjustments
          </Typography>
        </Box>

      {/* Filters Section */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <TextField size="small" label="Search SKU" value={skuSearch} onChange={(e) => setSkuSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { setPaginationModel({ ...paginationModel, page: 0 }); loadData(); } }} />
          <TextField
            select
            size="small"
            label="Quality"
            value={qualityFilter}
            onChange={(e) => { setQualityFilter(e.target.value); setPaginationModel({ ...paginationModel, page: 0 }); }}
            SelectProps={{ native: true }}
            sx={{ minWidth: 160 }}
          >
            <option value="">All</option>
            {STORE_QUALITIES.map(q => <option key={q} value={q}>{q.replace(/_/g, ' ')}</option>)}
          </TextField>
            <Button variant={onlyWithStock ? 'contained' : 'outlined'} onClick={() => { setOnlyWithStock(!onlyWithStock); setPaginationModel({ ...paginationModel, page: 0 }); }}>Only With Stock</Button>
            <Button variant="contained" onClick={() => { setPaginationModel({ ...paginationModel, page: 0 }); loadData(); }}>Search</Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 1 }}>
        <Box sx={{ width: '100%' }}>
          <DataGrid
            autoHeight
            rows={rows}
            columns={columns}
            getRowId={(r) => r.id}
            loading={loading}
            paginationMode="server"
            sortingMode="server"
            rowCount={total}
            onPaginationModelChange={setPaginationModel}
            paginationModel={paginationModel}
            onSortModelChange={setSortModel}
            sortModel={sortModel}
            onRowDoubleClick={(params) => setSelectedItem(params.row as StoreItem)}
            sx={{
              '& .MuiDataGrid-cell': {
                borderColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              }
            }}
          />
        </Box>
      </Paper>

      <AddManualItemDialog
        open={manualDialogOpen}
        onClose={() => setManualDialogOpen(false)}
        onCreated={() => { setManualDialogOpen(false); setPaginationModel({ ...paginationModel, page: 0 }); loadData(); }}
      />

      {selectedItem && (
        <StoreItemDetailDialog
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onChanged={() => { setSelectedItem(null); loadData(); }}
        />
      )}
      </Box>
    </Container>
  );
}

export default StorePage;
