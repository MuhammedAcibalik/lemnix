/**
 * @fileoverview Cutting Plan Table Component
 * @module CuttingPlanTable
 * @version 1.0.0
 */

import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Alert,
  AlertTitle
} from '@mui/material';
import { WorkOrderRow } from './WorkOrderRow';
import { WorkOrder, Cut } from '../../types';

interface CuttingPlanTableProps {
  aggregatedWorkOrders: WorkOrder[];
  expandedWorkOrder: string | null;
  onWorkOrderClick: (workOrderId: string) => void;
  onCuttingPlanDetails: (stock: Cut) => void;
  getAlgorithmProfile: (algorithm?: string) => { icon: React.ReactNode; label: string };
}

export const CuttingPlanTable: React.FC<CuttingPlanTableProps> = ({
  aggregatedWorkOrders,
  expandedWorkOrder,
  onWorkOrderClick,
  onCuttingPlanDetails,
  getAlgorithmProfile
}) => {
  return (
    <TableContainer
      component={Paper}
      sx={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
        backdropFilter: "blur(20px)",
        border: "2px solid rgba(0,0,0,0.08)",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
        borderRadius: 3,
        overflow: "hidden",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background:
            "linear-gradient(90deg, #1e40af 0%, #7c3aed 50%, #1e40af 100%)", // Industrial Harmony
          zIndex: 1,
        },
      }}
    >
      <Table sx={{ tableLayout: "fixed" }}>
        <TableHead>
          <TableRow
            sx={{
              background:
                "linear-gradient(135deg, rgba(30,64,175,0.1) 0%, rgba(124,58,237,0.1) 100%)", // Industrial Harmony
              position: "relative",
              zIndex: 2,
            }}
          >
            <TableCell
              sx={{
                width: "15%",
                textAlign: "center",
                fontWeight: "bold",
                color: "primary.main",
                fontSize: "0.95rem",
                py: 2,
                borderBottom: "2px solid rgba(30,64,175,0.2)", // Industrial Harmony
              }}
            >
              İş Emri
            </TableCell>
            <TableCell
              sx={{
                width: "12%",
                textAlign: "center",
                fontWeight: "bold",
                color: "primary.main",
                fontSize: "0.95rem",
                py: 2,
                borderBottom: "2px solid rgba(30,64,175,0.2)", // Industrial Harmony
              }}
            >
              Algoritma
            </TableCell>
            <TableCell
              sx={{
                width: "12%",
                textAlign: "center",
                fontWeight: "bold",
                color: "primary.main",
                fontSize: "0.95rem",
                py: 2,
                borderBottom: "2px solid rgba(30,64,175,0.2)", // Industrial Harmony
              }}
            >
              Boy Profil
            </TableCell>
            <TableCell
              sx={{
                width: "12%",
                textAlign: "center",
                fontWeight: "bold",
                color: "primary.main",
                fontSize: "0.95rem",
                py: 2,
                borderBottom: "2px solid rgba(30,64,175,0.2)", // Industrial Harmony
              }}
            >
              Toplam Parça
            </TableCell>
            <TableCell
              sx={{
                width: "12%",
                textAlign: "center",
                fontWeight: "bold",
                color: "primary.main",
                fontSize: "0.95rem",
                py: 2,
                borderBottom: "2px solid rgba(30,64,175,0.2)", // Industrial Harmony
              }}
            >
              Verimlilik
            </TableCell>
            <TableCell
              sx={{
                width: "12%",
                textAlign: "center",
                fontWeight: "bold",
                color: "primary.main",
                fontSize: "0.95rem",
                py: 2,
                borderBottom: "2px solid rgba(30,64,175,0.2)", // Industrial Harmony
              }}
            >
              Plan Sayısı
            </TableCell>
            <TableCell
              sx={{
                width: "12%",
                textAlign: "center",
                fontWeight: "bold",
                color: "primary.main",
                fontSize: "0.95rem",
                py: 2,
                borderBottom: "2px solid rgba(30,64,175,0.2)", // Industrial Harmony
              }}
            >
              Toplam Kesim
            </TableCell>
            <TableCell
              sx={{
                width: "13%",
                textAlign: "center",
                fontWeight: "bold",
                color: "primary.main",
                fontSize: "0.95rem",
                py: 2,
                borderBottom: "2px solid rgba(30,64,175,0.2)", // Industrial Harmony
              }}
            >
              Detaylar
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {aggregatedWorkOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} sx={{ textAlign: "center", py: 4 }}>
                <Alert severity="warning">
                  <AlertTitle>Sonuç Bulunamadı</AlertTitle>
                  Geçerli filtrelerle sonuç bulunamadı.
                </Alert>
              </TableCell>
            </TableRow>
          ) : (
            aggregatedWorkOrders.map((workOrder: WorkOrder) => {
              const isExpanded = expandedWorkOrder === String(workOrder.workOrderId);
              
              return (
                <WorkOrderRow
                  key={workOrder.workOrderId}
                  workOrder={workOrder}
                  isExpanded={isExpanded}
                  onWorkOrderClick={onWorkOrderClick}
                  onCuttingPlanDetails={onCuttingPlanDetails}
                  getAlgorithmProfile={getAlgorithmProfile}
                />
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
