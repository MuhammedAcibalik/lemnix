/**
 * Profile Definitions Table
 */

import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Typography,
  CircularProgress,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useDesignSystem } from '@/shared/hooks';
import { TextField } from '@/shared';
import { useProfileDefinitions, useUpdateProfileDefinition, useDeleteProfileDefinition } from '../model/useProfileManagement';
import { alpha } from '@mui/material/styles';

export const ProfileDefinitionsTable: React.FC = () => {
  const ds = useDesignSystem();
  const { data: profiles, isLoading } = useProfileDefinitions(false);
  const updateMutation = useUpdateProfileDefinition();
  const deleteMutation = useDeleteProfileDefinition();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ profileCode: '', profileName: '' });

  const handleEdit = (profile: { id: string; profileCode: string; profileName: string }) => {
    setEditingId(profile.id);
    setEditForm({ profileCode: profile.profileCode, profileName: profile.profileName });
  };

  const handleSave = async (id: string) => {
    await updateMutation.mutateAsync({
      id,
      data: {
        profileCode: editForm.profileCode,
        profileName: editForm.profileName
      }
    });
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ profileCode: '', profileName: '' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu profil tanımını silmek istediğinizden emin misiniz?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: ds.spacing['6'] }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profiles || profiles.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: ds.spacing['6'] }}>
        <Typography color="text.secondary">Henüz profil tanımı yok</Typography>
        <Typography variant="caption" color="text.secondary">
          Excel yükleyerek profil ekleyebilirsiniz
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer sx={{ px: 0, pb: ds.spacing['1'] }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: ds.typography.fontWeight.semibold }}>
              Profil Kodu
            </TableCell>
            <TableCell sx={{ fontWeight: ds.typography.fontWeight.semibold }}>
              Profil Adı
            </TableCell>
            <TableCell sx={{ fontWeight: ds.typography.fontWeight.semibold }}>
              Stok Uzunlukları
            </TableCell>
            <TableCell sx={{ fontWeight: ds.typography.fontWeight.semibold }}>
              Durum
            </TableCell>
            <TableCell sx={{ fontWeight: ds.typography.fontWeight.semibold, width: 120 }}>
              İşlemler
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {profiles.map((profile) => (
            <TableRow
              key={profile.id}
              sx={{
                '&:hover': {
                  backgroundColor: alpha(ds.colors.primary.main, 0.05),
                }
              }}
            >
              <TableCell>
                {editingId === profile.id ? (
                  <TextField
                    size="small"
                    value={editForm.profileCode}
                    onChange={(e) => setEditForm({ ...editForm, profileCode: e.target.value })}
                    sx={{ width: 140 }}
                  />
                ) : (
                  <Typography
                    sx={{
                      fontWeight: ds.typography.fontWeight.medium,
                      fontFamily: 'monospace'
                    }}
                  >
                    {profile.profileCode}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                {editingId === profile.id ? (
                  <TextField
                    size="small"
                    value={editForm.profileName}
                    onChange={(e) => setEditForm({ ...editForm, profileName: e.target.value })}
                    sx={{ width: 200 }}
                  />
                ) : (
                  profile.profileName
                )}
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.75}>
                  {profile.stockLengths
                    .sort((a, b) => a.priority - b.priority)
                    .map((sl) => (
                      <Chip
                        key={sl.id}
                        label={`${sl.stockLength}mm`}
                        size="small"
                        variant={sl.isDefault ? 'filled' : 'outlined'}
                        color={sl.isDefault ? 'primary' : 'default'}
                        sx={{
                          fontSize: '0.7rem',
                          height: 22,
                          borderRadius: `${ds.borderRadius.sm}px`
                        }}
                      />
                    ))}
                </Stack>
              </TableCell>
              <TableCell>
                <Chip
                  icon={profile.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                  label={profile.isActive ? 'Aktif' : 'Pasif'}
                  size="small"
                  color={profile.isActive ? 'success' : 'default'}
                  sx={{
                    borderRadius: `${ds.borderRadius.sm}px`,
                    fontWeight: ds.typography.fontWeight.medium
                  }}
                />
              </TableCell>
              <TableCell>
                {editingId === profile.id ? (
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Kaydet">
                      <IconButton
                        size="small"
                        onClick={() => handleSave(profile.id)}
                        disabled={updateMutation.isPending}
                        sx={{ color: ds.colors.success.main }}
                      >
                        <SaveIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="İptal">
                      <IconButton size="small" onClick={handleCancel}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                ) : (
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Düzenle">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(profile)}
                        sx={{
                          color: ds.colors.text.secondary,
                          '&:hover': { color: ds.colors.primary.main }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(profile.id)}
                        disabled={deleteMutation.isPending}
                        sx={{
                          color: ds.colors.text.secondary,
                          '&:hover': { color: ds.colors.error.main }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

