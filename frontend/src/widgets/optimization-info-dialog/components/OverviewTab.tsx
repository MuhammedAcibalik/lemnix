/**
 * @fileoverview Overview Tab Component for Optimization Info Dialog
 * @module OverviewTab
 * @version 1.0.0
 */

import React from 'react';
import {
  Grid,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  alpha,
  useTheme
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Build as BuildIcon,
  AutoGraph as AutoGraphIcon,
  AttachMoney as MoneyIcon,
  Nature as EcoIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { messages } from '../constants';
import { OverviewTabProps } from '../types';

/**
 * Overview Tab Component
 */
export const OverviewTab: React.FC<OverviewTabProps> = ({
  algorithms,
  features,
  metrics,
  optimizationSteps
}) => {
  const theme = useTheme();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>{messages.overview.title}</AlertTitle>
          {messages.overview.description}
        </Alert>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              <BuildIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              {messages.overview.features.title}
            </Typography>
            <List dense>
              {messages.overview.features.items.map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                  <ListItemText 
                    primary={item.primary}
                    secondary={item.secondary}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              <AutoGraphIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              {messages.overview.advantages.title}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><MoneyIcon color="warning" /></ListItemIcon>
                <ListItemText 
                  primary={messages.overview.advantages.items[0].primary}
                  secondary={messages.overview.advantages.items[0].secondary}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><EcoIcon color="success" /></ListItemIcon>
                <ListItemText 
                  primary={messages.overview.advantages.items[1].primary}
                  secondary={messages.overview.advantages.items[1].secondary}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><SpeedIcon color="info" /></ListItemIcon>
                <ListItemText 
                  primary={messages.overview.advantages.items[2].primary}
                  secondary={messages.overview.advantages.items[2].secondary}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><TrendingUpIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary={messages.overview.advantages.items[3].primary}
                  secondary={messages.overview.advantages.items[3].secondary}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
          <Typography variant="body1" paragraph>
            <strong>Nasıl Çalışır?</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sistem, verdiğiniz parça listesini alır ve seçtiğiniz algoritmaya göre en verimli kesim planını oluşturur.
            Her algoritma farklı senaryolar için optimize edilmiştir. Hız mı önemli? FFD veya BFD kullanın.
            Maksimum verimlilik mi gerekli? Genetic Algorithm v1.7.1 tercih edin. Çoklu iş emri mi? Profile Pooling kullanın.
            Sistem, kerf kaybı, güvenlik payları ve malzeme özelliklerini de hesaba katarak gerçekçi sonuçlar üretir.
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};
