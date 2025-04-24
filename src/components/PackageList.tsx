import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Alert,
  InputAdornment,
  Typography,
  Autocomplete,
  Paper,
} from '@mui/material';
import { Search, Public, Flag, Favorite } from '@mui/icons-material';
import { ProcessedPackage } from '@/types/package';
import { useRouter } from 'next/navigation';

export default function PackageList() {
  const router = useRouter();
  const [allPackages, setAllPackages] = useState<ProcessedPackage[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<ProcessedPackage[]>([]);
  const [search, setSearch] = useState('');
  const [regionType, setRegionType] = useState<'multi' | 'single'>('single');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all packages once when component mounts
  useEffect(() => {
    fetchAllPackages();
  }, []);

  // Filter packages whenever search or regionType changes
  useEffect(() => {
    filterPackages();
  }, [search, regionType, allPackages]);

  const fetchAllPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if packages are already in localStorage
      const storedPackages = localStorage.getItem('packages');
      if (storedPackages) {
        try {
          const parsedPackages = JSON.parse(storedPackages);
          if (Array.isArray(parsedPackages)) {
            setAllPackages(parsedPackages);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error('Error parsing stored packages:', e);
          // If parsing fails, continue to fetch from API
        }
      }
      
      // If not in localStorage or parsing failed, fetch from API
      const response = await fetch('/api/packages');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Store in localStorage for future use
      localStorage.setItem('packages', JSON.stringify(data));
      
      setAllPackages(data);
    } catch (error) {
      console.error('Error fetching packages:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  const filterPackages = () => {
    let filtered = allPackages;

    // Filter by region type
    filtered = filtered.filter(pkg => 
      regionType === 'multi' ? pkg.multiregion : !pkg.multiregion
    );

    // Filter by search query if exists
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(pkg =>
        pkg.packageName.toLowerCase().includes(searchLower) ||
        pkg.location.toLowerCase().includes(searchLower)
      );
    }

    setFilteredPackages(filtered);
  };

  const handleRegionChange = (
    _event: React.MouseEvent<HTMLElement>,
    newRegionType: 'multi' | 'single' | null,
  ) => {
    if (newRegionType !== null) {
      setRegionType(newRegionType);
    }
  };

  const handlePackageClick = (packageCode: string) => {
    router.push(`/package-detail/${packageCode}`);
  };

  const formatPackageName = (name: string) => {
    // Extract country/continent name (assuming it's in parentheses)
    const match = name.match(/\((.*?)\)/);
    if (match) {
      const countryName = match[1];
      const restOfName = name.replace(/\(.*?\)/, '').trim();
      return (
        <Typography variant="body1" noWrap>
          {restOfName}{' '}
          <Typography component="span" color="primary" fontWeight="bold">
            ({countryName})
          </Typography>
        </Typography>
      );
    }
    return <Typography variant="body1" noWrap>{name}</Typography>;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <ToggleButtonGroup
            value={regionType}
            exclusive
            onChange={handleRegionChange}
            aria-label="region type"
            sx={{
              '& .MuiToggleButton-root': {
                px: 3,
                py: 1,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              },
            }}
          >
            <ToggleButton value="single" aria-label="single-region">
              <Flag sx={{ mr: 1 }} />
              Single-Region
            </ToggleButton>
            <ToggleButton value="multi" aria-label="multi-region">
              <Public sx={{ mr: 1 }} />
              Multi-Region
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        <Autocomplete
          freeSolo
          options={allPackages
            .filter(pkg => regionType === 'multi' ? pkg.multiregion : !pkg.multiregion)
            .map(pkg => pkg.packageName)}
          value={search}
          onChange={(_event, newValue) => {
            setSearch(newValue || '');
            // If a package is selected from the dropdown, navigate to its detail page
            if (newValue) {
              const selectedPackage = allPackages.find(pkg => pkg.packageName === newValue);
              if (selectedPackage) {
                handlePackageClick(selectedPackage.packageCode);
              }
            }
          }}
          onInputChange={(_event, newInputValue) => setSearch(newInputValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              variant="outlined"
              placeholder={`Search ${regionType === 'multi' ? 'multi-region' : 'single-region'} packages...`}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                },
              }}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </Box>

      <Box
        display="grid"
        gap={3}
        gridTemplateColumns={{
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)'
        }}
      >
        {filteredPackages.map((pkg) => (
          <Paper
            key={pkg.packageCode}
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              cursor: 'pointer',
              transition: 'all 0.2s',
              borderRadius: '12px',
              background: pkg.multiregion 
                ? 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)' 
                : 'linear-gradient(135deg, #fff5f5 0%, #ffe3e3 100%)',
              border: pkg.multiregion 
                ? '1px solid #c8d0e0' 
                : '1px solid #ffc9c9',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
                background: pkg.multiregion 
                  ? 'linear-gradient(135deg, #e4e8f0 0%, #d4dae6 100%)' 
                  : 'linear-gradient(135deg, #ffe3e3 0%, #ffd1d1 100%)',
              },
            }}
            onClick={() => handlePackageClick(pkg.packageCode)}
          >
            {pkg.multiregion ? (
              <Public color="primary" fontSize="large" />
            ) : (
              <Flag color="error" fontSize="large" />
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {formatPackageName(pkg.packageName)}
            </Box>
            {pkg.favourite && (
              <Favorite color="error" fontSize="small" />
            )}
          </Paper>
        ))}
      </Box>

      {filteredPackages.length === 0 && (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" color="text.secondary">
            No packages found
          </Typography>
        </Box>
      )}
    </Box>
  );
} 