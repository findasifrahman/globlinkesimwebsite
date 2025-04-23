import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
} from '@mui/material';
import { Public, Flag, AccessTime, Speed } from '@mui/icons-material';
import { ProcessedPackage } from '@/types/package';

interface PackageCardProps {
  packageData: ProcessedPackage;
  onDetailsClick: () => void;
}

export default function PackageCard({ packageData, onDetailsClick }: PackageCardProps) {
  const {
    packageName,
    location,
    duration,
    price,
    currencyCode,
    speed,
    multiregion,
  } = packageData;

  return (
    <Card sx={{ width: 300, display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {multiregion ? (
            <Public color="primary" sx={{ mr: 1 }} />
          ) : (
            <Flag color="primary" sx={{ mr: 1 }} />
          )}
          <Typography variant="h6" component="div" noWrap>
            {packageName}
          </Typography>
        </Box>
        
        <Typography color="text.secondary" gutterBottom>
          {location}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AccessTime fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {duration} days
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Speed fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {speed}
          </Typography>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Chip 
            label={multiregion ? "Multi-Region" : "Single Country"} 
            color={multiregion ? "primary" : "secondary"} 
            size="small" 
          />
        </Box>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Typography variant="h6" color="primary">
          {currencyCode} {price}
        </Typography>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={onDetailsClick}
        >
          Details
        </Button>
      </CardActions>
    </Card>
  );
} 