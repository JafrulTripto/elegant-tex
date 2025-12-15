import React, { useEffect, useState } from 'react';
import { 
  Box, Button, Container, Paper, Stack, Typography, useTheme,
  Card, CardContent, Tooltip
} from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { 
  CheckCircleOutline as ApproveIcon, 
  CancelOutlined as RejectIcon,
  PendingActions as PendingIcon
} from '@mui/icons-material';
import storeService from '../services/store.service';
import { StoreAdjustment } from '../types/store';
import QualityBadge from '../components/store/QualityBadge';
import { useToast } from '../contexts/ToastContext';

const PendingApprovalsPage: React.FC = () => {
    const theme = useTheme();
    const { showSuccess, showError } = useToast();
  const [rows, setRows] = useState<StoreAdjustment[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });

  const load = async () => {
    setLoading(true);
    try {
      const res = await storeService.listAdjustments('PENDING', paginationModel.page, paginationModel.pageSize);
      setRows(res.content);
      setTotal(res.totalElements);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [paginationModel]);

  const approve = async (id: number) => { 
    try {
      await storeService.approveAdjustment(id); 
      showSuccess('Adjustment approved successfully');
      load(); 
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Failed to approve adjustment');
    }
  };
  
  const reject = async (id: number) => { 
    try {
      await storeService.rejectAdjustment(id, 'Rejected by reviewer'); 
      showSuccess('Adjustment rejected');
      load(); 
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Failed to reject adjustment');
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { 
      field: 'fabricName', 
      headerName: 'Fabric', 
      flex: 1, 
      minWidth: 160, 
      valueGetter: (value, row) => row.fabric ? `${row.fabric.name} (${row.fabric.fabricCode})` : '-' 
    },
    { 
      field: 'productTypeName', 
      headerName: 'Product Type', 
      flex: 1, 
      minWidth: 140, 
      valueGetter: (value, row) => row.productType?.name || '-' 
    },
    { field: 'requestedQuantity', headerName: 'Qty', width: 100 },
    { 
      field: 'quality', 
      headerName: 'Quality', 
      width: 130,
      renderCell: (params) => <QualityBadge quality={params.value} />
    },
    { field: 'reason', headerName: 'Reason', flex: 1, minWidth: 160 },
    { field: 'requestedAt', headerName: 'Requested At', width: 180 },
        { field: 'adjustmentType', headerName: 'Type', width: 130 },
    {
      field: 'actions', 
      headerName: 'Actions', 
      width: 180, 
      sortable: false, 
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Approve">
            <Button 
              size="small" 
              variant="contained" 
              color="success"
              startIcon={<ApproveIcon />}
              onClick={() => approve(params.row.id)}
              sx={{ 
                minWidth: 90,
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4
                }
              }}
            >
              Approve
            </Button>
          </Tooltip>
          <Tooltip title="Reject">
            <Button 
              size="small" 
              variant="outlined" 
              color="error"
              startIcon={<RejectIcon />}
              onClick={() => reject(params.row.id)}
              sx={{ 
                minWidth: 90,
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2
                }
              }}
            >
              Reject
            </Button>
          </Tooltip>
        </Stack>
      )
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ my: { xs: 2, sm: 3, md: 4 } }}>
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
              <PendingIcon sx={{ mr: 1, color: 'warning.main' }} />
              <Typography 
                variant="h5" 
                component="h1"
                sx={{ fontWeight: 500 }}
              >
                Approvals
              </Typography>
            </Box>
          </Box>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ ml: { sm: 4 } }}
          >
            Review and approve store adjustment requests
          </Typography>
        </Box>

      <Paper sx={{ p: 1 }}>
        <Box sx={{ width: '100%' }}>
          <DataGrid
            autoHeight
            rows={rows}
            columns={columns}
            getRowId={(r) => r.id}
            loading={loading}
            paginationMode="server"
            rowCount={total}
            onPaginationModelChange={setPaginationModel}
            paginationModel={paginationModel}
          />
        </Box>
      </Paper>
      </Box>
    </Container>
  );
};

export default PendingApprovalsPage;
