import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { WorkOrderStats as Stats } from '../../types/workOrder';

interface WorkOrderStatsProps {
  stats: Stats;
  loading?: boolean;
}

const WorkOrderStats: React.FC<WorkOrderStatsProps> = ({ stats, loading = false }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={2.4}>
        <Paper 
          sx={{ 
            p: 2, 
            textAlign: 'center',
            bgcolor: 'success.light',
            color: 'white',
            height: '100%'
          }}
        >
          <Typography variant="h6">Submitted</Typography>
          <Typography variant="h4">{loading ? '-' : stats.submitted}</Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={2.4}>
        <Paper 
          sx={{ 
            p: 2, 
            textAlign: 'center',
            bgcolor: 'error.light',
            color: 'white',
            height: '100%'
          }}
        >
          <Typography variant="h6">GC/SN Submitted</Typography>
          <Typography variant="h4">{loading ? '-' : stats.gcSnSubmitted}</Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={2.4}>
        <Paper 
          sx={{ 
            p: 2, 
            textAlign: 'center',
            bgcolor: 'error.light',
            color: 'white',
            height: '100%'
          }}
        >
          <Typography variant="h6">RTV Fixed</Typography>
          <Typography variant="h4">{loading ? '-' : stats.rtvFixed}</Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={2.4}>
        <Paper 
          sx={{ 
            p: 2, 
            textAlign: 'center',
            bgcolor: 'grey.600',
            color: 'white',
            height: '100%'
          }}
        >
          <Typography variant="h6">Saved</Typography>
          <Typography variant="h4">{loading ? '-' : stats.saved}</Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={2.4}>
        <Paper 
          sx={{ 
            p: 2, 
            textAlign: 'center',
            bgcolor: 'success.dark',
            color: 'white',
            height: '100%'
          }}
        >
          <Typography variant="h6">Total Processed</Typography>
          <Typography variant="h4">{loading ? '-' : stats.totalProcessed}</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default WorkOrderStats;
