import React, { useState } from 'react';
import {
  Box, Typography, Chip, IconButton, 
  Toolbar, TextField, InputAdornment, 
  Grid, FormControl, InputLabel, Select,
  MenuItem, Button, Paper, FormHelperText
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { Formik, Form, Field, FieldProps } from 'formik';
import { DataGrid, GridColDef, GridValueGetterParams, GridRenderCellParams } from '@mui/x-data-grid';
import { WorkOrder, WorkOrderFilter } from '../../types/workOrder';
import { format } from 'date-fns';

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  loading: boolean;
  page: number;
  totalPages: number;
  rowsPerPage: number;
  sortBy: string;
  sortDir: string;
  filters?: WorkOrderFilter;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onSortChange: (sortBy: string, sortDir: string) => void;
  onFilterChange: (filters: WorkOrderFilter) => void;
  onEdit: (workOrder: WorkOrder) => void;
  onDelete: (workOrder: WorkOrder) => void;
}

const WorkOrderTable: React.FC<WorkOrderTableProps> = ({
  workOrders,
  loading,
  page,
  totalPages,
  rowsPerPage,
  sortBy,
  sortDir,
  filters = {},
  onPageChange,
  onRowsPerPageChange,
  onSortChange,
  onFilterChange,
  onEdit,
  onDelete
}) => {
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter validation function
  const validateFilters = (values: WorkOrderFilter) => {
    const errors: Partial<Record<keyof WorkOrderFilter, string>> = {};
    
    if (values.startDate && values.endDate) {
      const startDate = new Date(values.startDate);
      const endDate = new Date(values.endDate);
      
      if (startDate > endDate) {
        errors.startDate = 'Start date must be before end date';
      }
      
      if (endDate < startDate) {
        errors.endDate = 'End date must be after start date';
      }
    }
    
    return errors;
  };
  
  const handleApplyFilters = (values: WorkOrderFilter) => {
    onFilterChange(values);
  };
  
  const handleResetFilters = (resetForm: () => void) => {
    resetForm();
    onFilterChange({});
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'success';
      case 'RTV Fixed':
        return 'error';
      case 'QC Done':
        return 'info';
      case 'Saved':
        return 'default';
      case 'Follow Up':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  const handleSortModelChange = (model: any) => {
    if (model.length > 0) {
      const { field, sort } = model[0];
      onSortChange(field, sort);
    } else {
      onSortChange('id', 'asc');
    }
  };
  
  const handlePageChange = (newPage: number) => {
    onPageChange(newPage);
  };
  
  const handlePageSizeChange = (newPageSize: number) => {
    onRowsPerPageChange(newPageSize);
  };
  
  const columns: GridColDef[] = [
    { 
      field: 'woNumber', 
      headerName: 'WO Number', 
      flex: 1,
      minWidth: 120
    },
    { 
      field: 'workType', 
      headerName: 'Work Type', 
      flex: 1,
      minWidth: 150
    },
    { 
      field: 'client', 
      headerName: 'Client', 
      flex: 1,
      minWidth: 120
    },
    { 
      field: 'photoCount', 
      headerName: 'Photo', 
      width: 80,
      type: 'number'
    },
    { 
      field: 'state', 
      headerName: 'State', 
      width: 80
    },
    { 
      field: 'clientDueDate', 
      headerName: 'Due Date', 
      width: 120,
      valueGetter: (params: GridValueGetterParams) => {
        return params.row.clientDueDate ? new Date(params.row.clientDueDate) : null;
      },
      valueFormatter: (params) => {
        return params.value ? format(params.value, 'MM-dd-yy') : '';
      }
    },
    { 
      field: 'updater', 
      headerName: 'Updater', 
      width: 120
    },
    { 
      field: 'orderStatus', 
      headerName: 'Status', 
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value} 
          color={getStatusColor(params.value as string) as any}
          size="small"
        />
      )
    },
    { 
      field: 'remarkCategory', 
      headerName: 'Remark/Category', 
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ 
          bgcolor: params.row.isRush ? 'error.main' : 'inherit',
          color: params.row.isRush ? 'white' : 'inherit',
          p: params.row.isRush ? 1 : 0,
          borderRadius: 1,
          width: '100%'
        }}>
          {params.value}
        </Box>
      )
    },
    { 
      field: 'actions', 
      headerName: 'Actions', 
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton size="small" onClick={() => onEdit(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(params.row)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    }
  ];
  
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Work Orders
        </Typography>
        
        <IconButton onClick={() => setShowFilters(!showFilters)}>
          <FilterIcon />
        </IconButton>
      </Toolbar>
      
      {showFilters && (
        <Box sx={{ p: 2 }}>
          <Formik
            initialValues={filters}
            validate={validateFilters}
            onSubmit={handleApplyFilters}
          >
            {({ resetForm }) => (
              <Form>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <Field name="woNumber">
                      {({ field, meta }: FieldProps) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Work Order Number"
                          error={meta.touched && Boolean(meta.error)}
                          helperText={meta.touched && meta.error}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    </Field>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Field name="client">
                      {({ field, meta }: FieldProps) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Client"
                          error={meta.touched && Boolean(meta.error)}
                          helperText={meta.touched && meta.error}
                        />
                      )}
                    </Field>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Field
                        name="orderStatus"
                        as={Select}
                        label="Status"
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="Submitted">Submitted</MenuItem>
                        <MenuItem value="RTV Fixed">RTV Fixed</MenuItem>
                        <MenuItem value="QC Done">QC Done</MenuItem>
                        <MenuItem value="Saved">Saved</MenuItem>
                        <MenuItem value="Follow Up">Follow Up</MenuItem>
                      </Field>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>State</InputLabel>
                      <Field
                        name="state"
                        as={Select}
                        label="State"
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="TN">TN</MenuItem>
                        <MenuItem value="LA">LA</MenuItem>
                        <MenuItem value="SC">SC</MenuItem>
                        <MenuItem value="NC">NC</MenuItem>
                        <MenuItem value="IL">IL</MenuItem>
                        <MenuItem value="TX">TX</MenuItem>
                        <MenuItem value="NY">NY</MenuItem>
                        <MenuItem value="WV">WV</MenuItem>
                      </Field>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Field name="startDate">
                      {({ field, meta }: FieldProps) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Start Date"
                          type="date"
                          error={meta.touched && Boolean(meta.error)}
                          helperText={meta.touched && meta.error}
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                    </Field>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Field name="endDate">
                      {({ field, meta }: FieldProps) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="End Date"
                          type="date"
                          error={meta.touched && Boolean(meta.error)}
                          helperText={meta.touched && meta.error}
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                    </Field>
                  </Grid>
                  
                  <Grid item xs={12} sm={12} md={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      <Button 
                        type="submit"
                        variant="contained" 
                        color="primary" 
                        startIcon={<FilterIcon />}
                      >
                        Apply Filters
                      </Button>
                      <Button 
                        type="button"
                        variant="outlined" 
                        color="secondary" 
                        startIcon={<ClearIcon />}
                        onClick={() => handleResetFilters(resetForm)}
                      >
                        Clear Filters
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Box>
      )}
      
      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={workOrders}
          columns={columns}
          loading={loading}
          pageSizeOptions={[5, 10, 25, 50]}
          paginationModel={{
            page,
            pageSize: rowsPerPage
          }}
          paginationMode="server"
          sortingMode="server"
          onPaginationModelChange={(model) => {
            handlePageChange(model.page);
            handlePageSizeChange(model.pageSize);
          }}
          onSortModelChange={handleSortModelChange}
          initialState={{
            sorting: {
              sortModel: [{ field: sortBy, sort: sortDir as 'asc' | 'desc' }],
            },
          }}
          rowCount={totalPages * rowsPerPage}
          disableRowSelectionOnClick
          getRowClassName={(params) => 
            params.row.isRush ? 'rush-row' : ''
          }
          sx={{
            '& .rush-row': {
              bgcolor: 'rgba(255, 0, 0, 0.1)',
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default WorkOrderTable;
