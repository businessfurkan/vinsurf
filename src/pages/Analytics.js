import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { 
  Box, 
  Typography, 
  Grid, 
  Button, 
  Paper,
  ButtonGroup,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  Divider,
  IconButton,
  Chip,
  CircularProgress
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { format, subDays, isToday, isThisWeek } from 'date-fns';
import { tr } from 'date-fns/locale';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import yksData from '../utils/yksData';
import CloseIcon from '@mui/icons-material/Close';

const Analytics = () => {
  const theme = useTheme();
  const [user] = useAuthState(auth);
  const [studyData, setStudyData] = useState([]);
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'all'
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [topicData, setTopicData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todayTotal, setTodayTotal] = useState(0);
  const [weekTotal, setWeekTotal] = useState(0);

  const COLORS = [
    '#4285f4', '#34a853', '#fbbc05', '#ea4335', 
    '#5e35b1', '#00acc1', '#43a047', '#fb8c00'
  ];

  useEffect(() => {
    const fetchStudyData = async () => {
      if (!user) return;
      setIsLoading(true);

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

        // Create a query that works without requiring composite indexes
        const studyQuery = query(
          collection(db, 'studyRecords'),
          where('userId', '==', user.uid)
        );

        const querySnapshot = await getDocs(studyQuery);
        const allRecords = [];
        
        let todayTotalMinutes = 0;
        let weekTotalMinutes = 0;
        
        querySnapshot.forEach((doc) => {
          const record = { id: doc.id, ...doc.data() };
          allRecords.push(record);
        });
        
        // Filter and sort records in JavaScript instead of Firestore
        let records = allRecords;
        
        // Apply date filtering based on timeRange
        if (startDate) {
          records = records.filter(record => {
            const recordDate = record.timestamp.toDate ? record.timestamp.toDate() : new Date(record.timestamp);
            return recordDate >= startDate;
          });
        }
        
        // Sort by timestamp in descending order
        records.sort((a, b) => {
          const dateA = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
          const dateB = b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
          return dateB - dateA; // Descending order
        });
        
        // Calculate today's and this week's total study time
        records.forEach(record => {
          const recordDate = record.timestamp.toDate ? record.timestamp.toDate() : new Date(record.timestamp);
          
          if (isToday(recordDate)) {
            todayTotalMinutes += record.duration / 60; // Convert seconds to minutes
          }
          
          if (isThisWeek(recordDate, { weekStartsOn: 1 })) { // Week starts on Monday
            weekTotalMinutes += record.duration / 60;
          }
        });
        
        setStudyData(records);
        setTodayTotal(Math.round(todayTotalMinutes));
        setWeekTotal(Math.round(weekTotalMinutes));
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching study data:', error);
        setIsLoading(false);
      }
    };

    fetchStudyData();
  }, [user, timeRange]);

  // Process data by subject for the chart
  const processDataBySubject = () => {
    const subjectData = {};
    
    // Ensure studyData is an array
    if (!Array.isArray(studyData)) {
      console.error('studyData is not an array:', studyData);
      return [];
    }
    
    // Filter data based on selected time range
    const filteredData = studyData.filter(record => {
      if (!record || !record.timestamp) return false;
      
      let recordDate;
      try {
        // Güvenli bir şekilde tarihi dönüştür
        if (record.timestamp.toDate && typeof record.timestamp.toDate === 'function') {
          recordDate = record.timestamp.toDate();
        } else if (record.timestamp.seconds) {
          recordDate = new Date(record.timestamp.seconds * 1000);
        } else {
          recordDate = new Date(record.timestamp);
        }
        
        const today = new Date();
        
        if (timeRange === 'week') {
          return isThisWeek(recordDate);
        } else if (timeRange === 'month') {
          const thirtyDaysAgo = subDays(today, 30);
          return recordDate >= thirtyDaysAgo;
        }
        return true; // 'all' time range
      } catch (error) {
        console.error('Error processing record date for filtering:', error, record);
        return false;
      }
    });
    
    // Aggregate by subject
    filteredData.forEach(record => {
      if (!record) return;
      
      const subject = record.subject || 'Diğer';
      if (!subjectData[subject]) {
        subjectData[subject] = 0;
      }
      // Ensure duration is a number
      const duration = typeof record.duration === 'number' ? record.duration : 0;
      subjectData[subject] += duration / 60; // Convert seconds to minutes
    });
    
    // Convert to array format for chart
    return Object.keys(subjectData)
      .map(subject => ({
        name: subject,
        value: Math.round(subjectData[subject] || 0), // Round to whole minutes and ensure it's not NaN
      }))
      .sort((a, b) => b.value - a.value); // Sort by value (descending)
  };

  
  // Get topic data for a specific subject
  const getTopicDataForSubject = (subject) => {
    if (!subject || !Array.isArray(studyData)) return [];
    
    const topicData = {};
    const subjectRecords = studyData.filter(record => 
      record && record.subject === subject && record.topic
    );
    
    subjectRecords.forEach(record => {
      const topic = record.topic || 'Belirtilmemiş';
      if (!topicData[topic]) {
        topicData[topic] = 0;
      }
      // Ensure duration is a number
      const duration = typeof record.duration === 'number' ? record.duration : 0;
      topicData[topic] += duration;
    });
    
    // Calculate total study time for this subject
    const totalSubjectTime = Object.values(topicData).reduce((total, time) => total + (time || 0), 0);
    
    return Object.keys(topicData).map(topic => ({
      name: topic || 'Belirtilmemiş',
      value: Math.round((topicData[topic] || 0) / 60), // Convert seconds to minutes
      percentage: totalSubjectTime > 0 ? Math.round(((topicData[topic] || 0) / totalSubjectTime) * 100) : 0,
      seconds: topicData[topic] || 0
    }));
  };
  
  // Handle opening the topic dialog
  const handleOpenTopicDialog = (subject) => {
    setSelectedSubject(subject);
    const topics = getTopicDataForSubject(subject);
    setTopicData(topics);
    setTopicDialogOpen(true);
  };
  
  // Handle closing the topic dialog
  const handleCloseTopicDialog = () => {
    setTopicDialogOpen(false);
    setSelectedSubject(null);
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
    if (Array.isArray(studyData)) {
      studyData.forEach(record => {
        if (!record || !record.timestamp) return;
        
        let recordDate;
        try {
          // Güvenli bir şekilde tarihi dönüştür
          if (record.timestamp.toDate && typeof record.timestamp.toDate === 'function') {
            recordDate = record.timestamp.toDate();
          } else if (record.timestamp.seconds) {
            recordDate = new Date(record.timestamp.seconds * 1000);
          } else {
            recordDate = new Date(record.timestamp);
          }
          
          const recordDateStr = format(recordDate, 'dd/MM', { locale: tr });
          
          // Check if this record is from the last 7 days
          const sevenDaysAgo = subDays(today, 7);
          if (recordDate >= sevenDaysAgo && dailyData[recordDateStr] !== undefined) {
            // Ensure duration is a number
            const duration = typeof record.duration === 'number' ? record.duration : 0;
            dailyData[recordDateStr] += duration / 60; // Convert seconds to minutes
          }
        } catch (error) {
          console.error('Error processing record date:', error, record);
        }
      });
    }
    
    // Convert to array format for chart
    return Object.keys(dailyData).map(date => ({
      name: date,
      value: Math.round(dailyData[date] || 0), // Round to whole minutes and ensure it's not NaN
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
    if (active && payload && payload.length && payload[0]) {
      return (
        <Paper sx={{ p: 1.5, boxShadow: 3, bgcolor: 'background.paper' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {label || (payload[0].name || 'Bilinmiyor')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatMinutes(payload[0].value || 0)}
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
                        {formatMinutes(processDailyStudyData().reduce((tot, day) => tot + (day.value || 0), 0) / 7)}
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
                            key={`cell-${idx}`}
                            fill={COLORS[idx % COLORS.length] || theme.palette.info.main}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                {/* Today's and Weekly Study Summary */}
                <Box sx={{ mb: 4, mt: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          bgcolor: '#E3F2FD',
                          border: '1px solid #90CAF9',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontFamily: 'Quicksand',
                            fontWeight: 600,
                            color: '#1565C0',
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          <AccessTimeIcon fontSize="small" /> Bugünkü Çalışma
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            fontFamily: 'Quicksand',
                            fontWeight: 700,
                            color: '#0D47A1'
                          }}
                        >
                          {formatMinutes(todayTotal)}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          bgcolor: '#E8F5E9',
                          border: '1px solid #A5D6A7',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontFamily: 'Quicksand',
                            fontWeight: 600,
                            color: '#2E7D32',
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          <AccessTimeIcon fontSize="small" /> Bu Haftaki Çalışma
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            fontFamily: 'Quicksand',
                            fontWeight: 700,
                            color: '#1B5E20'
                          }}
                        >
                          {formatMinutes(weekTotal)}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
                
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Quicksand',
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    mb: 2,
                    mt: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <MenuBookIcon /> Ders Bazlı Çalışma Analizleri
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {isLoading ? (
                    <Grid item xs={12} sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress size={40} />
                      <Typography sx={{ mt: 2, color: 'text.secondary' }}>
                        Çalışma verileri yükleniyor...
                      </Typography>
                    </Grid>
                  ) : processDataBySubject().length === 0 ? (
                    <Grid item xs={12}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 4,
                          borderRadius: 2,
                          bgcolor: '#ede8ce',
                          border: '1px dashed #FFD54F',
                          textAlign: 'center'
                        }}
                      >
                        <Typography
                          color="text.secondary"
                          sx={{
                            fontFamily: 'Quicksand',
                            fontSize: '1.1rem',
                            mb: 2
                          }}
                        >
                          Henüz kaydedilmiş çalışma verisi bulunmuyor.
                        </Typography>
                        <Typography
                          color="text.secondary"
                          sx={{
                            fontFamily: 'Quicksand',
                            fontSize: '0.9rem'
                          }}
                        >
                          Anasayfadaki Analitik Kronometre ile çalışmalarınızı kaydetmeye başlayın.
                        </Typography>
                      </Paper>
                    </Grid>
                  ) : (
                    processDataBySubject().map((subject, idx) => (
                      <Grid item xs={12} sm={6} md={4} key={subject.name + idx}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: 2,
                            bgcolor: '#ede8ce',
                            border: `1px solid ${subject.color}40`,
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden',
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '5px',
                              height: '100%',
                              backgroundColor: subject.color,
                              borderTopLeftRadius: '4px',
                              borderBottomLeftRadius: '4px'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontFamily: 'Quicksand',
                                fontWeight: 700,
                                color: subject.color,
                                mb: 0.5
                              }}
                            >
                              {subject.name}
                            </Typography>
                            <Chip 
                              label={`${subject.percentage}%`}
                              size="small"
                              sx={{ 
                                bgcolor: `${subject.color}20`, 
                                color: subject.color,
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          </Box>
                          
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'Quicksand',
                              color: 'text.secondary',
                              mb: 2,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}
                          >
                            <AccessTimeIcon fontSize="small" sx={{ fontSize: 16 }} />
                            {formatMinutes(subject.value)}
                          </Typography>
                          
                          {/* Progress bar */}
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                Toplam çalışma içindeki payı
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={subject.percentage} 
                              sx={{ 
                                height: 8, 
                                borderRadius: 4,
                                bgcolor: '#f5f5f5',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: subject.color
                                }
                              }}
                            />
                          </Box>
                          
                          {/* Topics button */}
                          <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => handleOpenTopicDialog(subject.name)}
                            sx={{
                              mt: 1,
                              borderColor: `${subject.color}60`,
                              color: subject.color,
                              '&:hover': {
                                borderColor: subject.color,
                                bgcolor: `${subject.color}10`
                              },
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600
                            }}
                          >
                            {subject.topicCount} Konu Göster
                          </Button>
                        </Paper>
                      </Grid>
                    ))
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Topic Dialog */}
          <Dialog
            open={topicDialogOpen}
            onClose={handleCloseTopicDialog}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 2,
                bgcolor: 'var(--background-color)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
              }
            }}
          >
            <DialogTitle sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: '1px solid #f0f0f0',
              pb: 2
            }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: yksData[selectedSubject]?.color || '#333' }}>
                {selectedSubject} Konuları
              </Typography>
              <IconButton onClick={handleCloseTopicDialog} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ py: 3 }}>
              {topicData.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    Bu ders için kayıtlı konu bulunamadı.
                  </Typography>
                </Box>
              ) : (
                <List sx={{ width: '100%' }}>
                  {topicData.sort((a, b) => b.value - a.value).map((topic, index) => (
                    <React.Fragment key={topic.name}>
                      {index > 0 && <Divider component="li" />}
                      <ListItem sx={{ py: 2 }}>
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {topic.name}
                            </Typography>
                            <Chip 
                              label={`${topic.percentage}%`}
                              size="small"
                              sx={{ 
                                bgcolor: `${yksData[selectedSubject]?.color || '#333'}20`, 
                                color: yksData[selectedSubject]?.color || '#333',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          </Box>
                          
                          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeIcon fontSize="small" sx={{ fontSize: 16 }} />
                            {formatMinutes(topic.value)}
                          </Typography>
                          
                          <LinearProgress 
                            variant="determinate" 
                            value={topic.percentage} 
                            sx={{ 
                              height: 6, 
                              borderRadius: 3,
                              bgcolor: '#f5f5f5',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: yksData[selectedSubject]?.color || '#333'
                              }
                            }}
                          />
                        </Box>
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default Analytics;