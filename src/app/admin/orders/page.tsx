'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  TextField,
  Button,
  Chip,
  TablePagination
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

interface Order {
  id: string;
  orderNo: string;
  paymentOrderNo: string | null;
  finalAmountPaid: number | null;
  user: {
    email: string;
  };
  packageCode: string;
  status: string;
  esimStatus: string | null;
  paymentState: string;
  paidAmount: number | string;
  transactionId: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/orders?page=${page}&limit=${rowsPerPage}&search=${searchTerm}&showAll=${showAll}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      const processedOrders = data.orders.map((order: Order) => ({
        ...order,
        paidAmount: typeof order.paidAmount === 'string' 
          ? parseFloat(order.paidAmount) 
          : order.paidAmount
      }));
      setOrders(processedOrders);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      setOrders(orders.filter(order => order.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleShowAll = () => {
    setShowAll(!showAll);
    setPage(0);
  };

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, searchTerm, showAll]);

  if (loading && orders.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Orders
        </Typography>
        <Button
          variant="contained"
          onClick={toggleShowAll}
          color={showAll ? 'secondary' : 'primary'}
        >
          {showAll ? 'Show Last 30 Days' : 'Show All Orders'}
        </Button>
      </Box>

      <TextField
        fullWidth
        label="Search Orders"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearch}
        sx={{ mb: 2 }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order No</TableCell>
              <TableCell>Payment Order No</TableCell>
              <TableCell>Final Amount</TableCell>
              <TableCell>User Email</TableCell>
              <TableCell>Package Code</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Esim Status</TableCell>
              <TableCell>Payment State</TableCell>
              <TableCell>Paid Amount</TableCell>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.orderNo}</TableCell>
                <TableCell>{order.paymentOrderNo || '-'}</TableCell>
                <TableCell>{order.finalAmountPaid?.toFixed(2) || '-'}</TableCell>
                <TableCell>{order.user.email}</TableCell>
                <TableCell>{order.packageCode}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={
                      order.status === 'COMPLETED'
                        ? 'success'
                        : order.status === 'FAILED'
                        ? 'error'
                        : 'warning'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {order.esimStatus && (
                    <Chip
                      label={order.esimStatus}
                      color={
                        order.esimStatus === 'IN_USE'
                          ? 'success'
                          : order.esimStatus === 'USED_UP'
                          ? 'error'
                          : 'warning'
                      }
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={order.paymentState}
                    color={order.paymentState === 'paid' ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {typeof order.paidAmount === 'number' 
                    ? order.paidAmount.toFixed(2)
                    : parseFloat(order.paidAmount).toFixed(2)}
                </TableCell>
                <TableCell>{order.transactionId}</TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(order.id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
} 