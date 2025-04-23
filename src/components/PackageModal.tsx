import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import { Public, Flag, AccessTime, Speed, Info } from '@mui/icons-material';
import { ProcessedPackage } from '@/types/package';

interface PackageModalProps {
  open: boolean;
  onClose: () => void;
  packageData: ProcessedPackage | null;
  onBuyNow: (quantity: number) => void;
}

export default function PackageModal({ 
  open, 
  onClose, 
  packageData, 
  onBuyNow 
}: PackageModalProps) {
  const [quantity, setQuantity] = useState(1);
  
  if (!packageData) return null;
  
  const {
    packageName,
    packageCode,
    location,
    duration,
    price,
    currencyCode,
    speed,
    multiregion,
    smsStatus,
    activeType,
    retailPrice,
  } = packageData;
  
  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };
  
  const handleBuyNow = () => {
    onBuyNow(quantity);
  };
  
  const totalPrice = price * quantity;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {multiregion ? (
            <Public color="primary" sx={{ mr: 1 }} />
          ) : (
            <Flag color="primary" sx={{ mr: 1 }} />
          )}
          <Typography variant="h6">{packageName}</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" color="text.secondary">
                Package Code: {packageCode}
              </Typography>
              <Chip 
                label={multiregion ? "Multi-Region" : "Single Country"} 
                color={multiregion ? "primary" : "secondary"} 
                size="small" 
              />
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Info fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Location:
              </Typography>
            </Box>
            <Typography variant="body1">{location}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTime fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Duration:
              </Typography>
            </Box>
            <Typography variant="body1">{duration} days</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Speed fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Speed:
              </Typography>
            </Box>
            <Typography variant="body1">{speed}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Info fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Active Type:
              </Typography>
            </Box>
            <Typography variant="body1">{activeType}</Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">Price per unit:</Typography>
              <Typography variant="body1" fontWeight="bold">
                {currencyCode} {price}
              </Typography>
            </Box>
            
            {retailPrice > price && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Retail Price:
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                  {currencyCode} {retailPrice}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                Quantity:
              </Typography>
              <TextField
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                inputProps={{ min: 1 }}
                size="small"
                sx={{ width: 80 }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" color="primary">
                {currencyCode} {totalPrice.toFixed(2)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleBuyNow}
        >
          Buy Now
        </Button>
      </DialogActions>
    </Dialog>
  );
} 