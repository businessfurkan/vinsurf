import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { 
  Box, 
  Typography, 
  Grid, 
  Button, 
  Paper,
  ButtonGroup
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { format, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';
// import { Link } from 'react-router-dom';

const Analytics = () => {
  const theme = useTheme();
  const [user] = useAuthState(auth);
  const [studyData, setStudyData] = useState([]);
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'all'

  const COLORS = [
    '#4285f4', '#34a853', '#fbbc05', '#ea4335', 
    '#5e35b1', '#00acc1', '#43a047', '#fb8c00'
  ];

  useEffect(() => {
    const fetchStudyData = async () => {
      if (!user) return;

      try {
        // Get current date
        const now = new Date();
        let startDate = new Date();
        
        // Set start date based on selected time range
        if (timeRange === 'week') {
          startDate.setDate(now.getDate() - 7);
        } else if (timeRange === 'month') {
          startDate.setMonth(now.getMonth() - 1);
        } else {
          // For 'all', we don't filter by date
          startDate = null;
        }

        let studyQuery;
        if (startDate) {
          studyQuery = query(
            collection(db, 'studyRecords'),
            where('userId', '==', user.uid),
            where('timestamp', '>=', startDate),
            orderBy('timestamp', 'desc')
          );
        } else {
          studyQuery = query(
            collection(db, 'studyRecords'),
            where('userId', '==', user.uid),
            orderBy('timestamp', 'desc')
          );
        }

        const querySnapshot = await getDocs(studyQuery);
        const records = [];
        
        querySnapshot.forEach((doc) => {
          records.push({ id: doc.id, ...doc.data() });
        });
        
        setStudyData(records);
      } catch (error) {
        console.error('Error fetching study data:', error);
      }
    };

    fetchStudyData();
  }, [user, timeRange]);

  // Process data for charts
  const processDataBySubject = () => {
    const subjectData = {};
    
    studyData.forEach(record => {
      if (!subjectData[record.subject]) {
        subjectData[record.subject] = 0;
      }
      subjectData[record.subject] += record.duration;
    });
    
    return Object.keys(subjectData).map(subject => ({
      name: subject,
      value: Math.round(subjectData[subject] / 60), // Convert seconds to minutes
    }));
  };

  // Process data for daily study time chart (last 7 days)
  const processDailyStudyData = () => {
    const dailyData = {};
    const today = new Date();
    
    // Initialize data for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const formattedDate = format(date, 'dd/MM', { locale: tr });
      dailyData[formattedDate] = 0;
    }
    
    // Fill in study data
    studyData.forEach(record => {
      const recordDate = record.timestamp.toDate ? record.timestamp.toDate() : new Date(record.timestamp);
      const recordDateStr = format(recordDate, 'dd/MM', { locale: tr });
      
      // Check if this record is from the last 7 days
      const sevenDaysAgo = subDays(today, 7);
      if (recordDate >= sevenDaysAgo && dailyData[recordDateStr] !== undefined) {
        dailyData[recordDateStr] += record.duration / 60; // Convert seconds to minutes
      }
    });
    
    // Convert to array format for chart
    return Object.keys(dailyData).map(date => ({
      name: date,
      value: Math.round(dailyData[date]), // Round to whole minutes
    }));
  };

  // Format minutes to hours and minutes
  const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours} saat ${mins > 0 ? `${mins} dk` : ''}`;
    }
    return `${mins} dk`;
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5, boxShadow: 3, bgcolor: 'background.paper' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {label || payload[0].name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatMinutes(payload[0].value)}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 3 } }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 700, 
              mb: 3,
              color: theme.palette.primary.main,
              fontFamily: 'Quicksand'
            }}
          >
            Çalışma Analizleri
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <ButtonGroup variant="outlined" aria-label="outlined button group">
            <Button 
              variant={timeRange === 'week' ? 'contained' : 'outlined'} 
              onClick={() => handleTimeRangeChange('week')}
              sx={{ 
                borderRadius: 2,
                fontFamily: 'Quicksand',
                fontWeight: 600
              }}
            >
              Son 7 Gün
            </Button>
            <Button 
              variant={timeRange === 'month' ? 'contained' : 'outlined'} 
              onClick={() => handleTimeRangeChange('month')}
              sx={{ 
                borderRadius: 2,
                fontFamily: 'Quicksand',
                fontWeight: 600
              }}
            >
              Son 30 Gün
            </Button>
            <Button 
              variant={timeRange === 'all' ? 'contained' : 'outlined'} 
              onClick={() => handleTimeRangeChange('all')}
              sx={{ 
                borderRadius: 2,
                fontFamily: 'Quicksand',
                fontWeight: 600
              }}
            >
              Tüm Zamanlar
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>

      {studyData.length === 0 ? (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            borderRadius: 3,
            bgcolor: 'background.paper',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              fontFamily: 'Quicksand',
              fontWeight: 600,
              color: 'text.secondary',
              mb: 2
            }}
          >
            Henüz çalışma kaydınız bulunmuyor
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
          >
            Kayıt ekleyerek analiz sonuçlarını görüntüleyebilirsiniz.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Daily Study Chart */}
          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
                  height: '100%' 
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      fontFamily: 'Quicksand',
                      color: 'primary.main'
                    }}
                  >
                    Son 7 Gün Çalışma Süreleri
                  </Typography>
                </Box>
                <Box sx={{ height: 400, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={processDailyStudyData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={theme.palette.divider}
                      />
                      <XAxis 
                        dataKey="name"
                        tick={{ 
                          fontFamily: 'Quicksand',
                          fontSize: 12,
                          fill: theme.palette.text.secondary
                        }}
                        tickLine={{ stroke: theme.palette.divider }}
                        axisLine={{ stroke: theme.palette.divider }}
                      />
                      <YAxis 
                        label={{ 
                          value: 'Dakika', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { 
                            textAnchor: 'middle',
                            fontFamily: 'Quicksand',
                            fontSize: 12,
                            fill: theme.palette.text.secondary
                          }
                        }}
                        tick={{ 
                          fontFamily: 'Quicksand',
                          fontSize: 12,
                          fill: theme.palette.text.secondary
                        }}
                        tickLine={{ stroke: theme.palette.divider }}
                        axisLine={{ stroke: theme.palette.divider }}
                      />
                      <Tooltip 
                        content={<CustomTooltip />}
                        cursor={{ 
                          fill: theme.palette.action.hover,
                          radius: 4
                        }}
                      />
                      <Legend 
                        wrapperStyle={{
                          fontFamily: 'Quicksand',
                          fontSize: 12
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        name="Günlük Çalışma (Dakika)" 
                        radius={[4, 4, 0, 0]}
                        maxBarSize={50}
                        fill={theme.palette.primary.main}
                        style={{
                          filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))',
                          cursor: 'pointer'
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                <Grid container spacing={2} sx={{ mt: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: `${theme.palette.primary.main}15`,
                        border: `1px solid ${theme.palette.primary.main}30`,
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontFamily: 'Quicksand',
                          fontWeight: 600,
                          color: theme.palette.primary.main,
                          mb: 1
                        }}
                      >
                        Toplam Çalışma Süresi
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: 'Quicksand',
                          fontWeight: 700,
                          color: theme.palette.text.primary
                        }}
                      >
                        {formatMinutes(processDailyStudyData().reduce((tot, day) => tot + day.value, 0) / 7)}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          {/* Subject-based Chart */}
          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 6px 25px rgba(0,0,0,0.12)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      fontFamily: 'Quicksand',
                      color: 'primary.main'
                    }}
                  >
                    Çalışma İstatistikleri
                  </Typography>
                </Box>
                <Box sx={{ height: 400, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={processDataBySubject()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={theme.palette.divider}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{
                          fontFamily: 'Quicksand',
                          fontSize: 12,
                          fill: theme.palette.text.secondary
                        }}
                        tickLine={{ stroke: theme.palette.divider }}
                        axisLine={{ stroke: theme.palette.divider }}
                      />
                      <YAxis
                        label={{
                          value: 'Dakika',
                          angle: -90,
                          position: 'insideLeft',
                          style: {
                            textAnchor: 'middle',
                            fontFamily: 'Quicksand',
                            fontSize: 12,
                            fill: theme.palette.text.secondary
                          }
                        }}
                        tick={{
                          fontFamily: 'Quicksand',
                          fontSize: 12,
                          fill: theme.palette.text.secondary
                        }}
                        tickLine={{ stroke: theme.palette.divider }}
                        axisLine={{ stroke: theme.palette.divider }}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{
                          fill: theme.palette.action.hover,
                          radius: 4
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          fontFamily: 'Quicksand',
                          fontSize: 12
                        }}
                      />
                      <Bar
                        dataKey="value"
                        name="Konu Bazlı Çalışma (Dakika)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={50}
                        fill={theme.palette.info.main}
                        style={{
                          filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))',
                          cursor: 'pointer'
                        }}
                      >
                        {processDataBySubject().map((entry, idx) => (
                          <Cell
                            key={entry.name}
                            fill={COLORS[idx % COLORS.length] || theme.palette.info.main}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                <Grid container spacing={2} sx={{ mt: 3 }}>
                  {processDataBySubject().length === 0 ? (
                    <Grid item xs={12}>
                      <Typography
                        color="text.secondary"
                        sx={{
                          fontFamily: 'Quicksand',
                          textAlign: 'center',
                          mt: 2
                        }}
                      >
                        Kayıtlı konu bazlı çalışma bulunamadı.
                      </Typography>
                    </Grid>
                  ) : (
                    processDataBySubject().map((subject, idx) => (
                      <Grid item xs={12} sm={6} md={4} key={subject.name + idx}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: `${COLORS[idx % COLORS.length] || theme.palette.info.main}15`,
                            border: `1px solid ${COLORS[idx % COLORS.length] || theme.palette.info.main}30`,
                            transition: 'transform 0.2s',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                            }
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontFamily: 'Quicksand',
                              fontWeight: 600,
                              color: COLORS[idx % COLORS.length] || theme.palette.info.main,
                              mb: 1
                            }}
                          >
                            {subject.name}
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              fontFamily: 'Quicksand',
                              fontWeight: 700,
                              color: theme.palette.text.primary
                            }}
                          >
                            {formatMinutes(subject.value)}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Analytics;