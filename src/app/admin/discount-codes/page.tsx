'use client';

import { useState } from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import CreateDiscountCode from './CreateDiscountCode';
import ListDiscountCodes from './ListDiscountCodes';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`discount-tabpanel-${index}`}
      aria-labelledby={`discount-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function DiscountCodesPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Create Discount Code" />
          <Tab label="List Discount Codes" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <CreateDiscountCode />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <ListDiscountCodes />
        </TabPanel>
      </Paper>
    </Box>
  );
} 