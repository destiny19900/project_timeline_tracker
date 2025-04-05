import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Tooltip,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InfoIcon from '@mui/icons-material/Info';
import { format } from 'date-fns';

interface AIUsageLimits {
  hasReachedLimit: boolean;
  remaining: number;
  resetTime?: Date;
}

interface AIUsageCardProps {
  usageLimits: AIUsageLimits | null;
}

export const AIUsageCard: React.FC<AIUsageCardProps> = ({ usageLimits }) => {
  return (
    <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AutoAwesomeIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">AI Project Generation</Typography>
          <Tooltip title="You can generate up to 10 AI projects per week" arrow>
            <InfoIcon fontSize="small" color="action" sx={{ ml: 1 }} />
          </Tooltip>
        </Box>
              
        {usageLimits ? (
          <>
            <Box sx={{ mb: 2, mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Weekly Limit
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {usageLimits.remaining} of 10 remaining
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={((10 - usageLimits.remaining) / 10) * 100} 
                sx={{ 
                  height: 10, 
                  borderRadius: 5,
                  bgcolor: 'background.default',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: usageLimits.remaining > 3 
                      ? 'success.main' 
                      : usageLimits.remaining > 0 
                        ? 'warning.main' 
                        : 'error.main'
                  }
                }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {usageLimits.hasReachedLimit 
                  ? 'Limit resets on:' 
                  : 'Projects generated this week:'}
              </Typography>
              {usageLimits.hasReachedLimit ? (
                <Chip 
                  label={usageLimits.resetTime 
                    ? format(usageLimits.resetTime, 'MMM dd, yyyy') 
                    : 'In about a week'}
                  size="small"
                  color="primary"
                />
              ) : (
                <Typography variant="body1" fontWeight="medium">
                  {10 - usageLimits.remaining}
                </Typography>
              )}
            </Box>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            No AI projects generated yet. You can create up to 10 AI-generated projects per week.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}; 