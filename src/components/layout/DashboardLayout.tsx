import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  InputBase,
  Badge,
  ListItem,
  Paper,
  Popover,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AddIcon from '@mui/icons-material/Add';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useThemeContext } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { projectService } from '../../services/projectService';
import { differenceInDays } from 'date-fns';

const drawerWidth = 240;

const Main = styled('main', {
  shouldForwardProp: (prop) => prop !== 'open' && prop !== 'isMobile',
})<{
  open?: boolean;
  isMobile?: boolean;
}>(({ theme, open, isMobile }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: isMobile ? 0 : `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
  backgroundColor: theme.palette.background.default,
}));

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open?: boolean }>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: 'none',
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const SearchInput = styled(InputBase)(({ theme }) => ({
  width: '100%',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1, 1, 1, 5),
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.05)',
  },
  '&:focus-within': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.07)',
    boxShadow: '0 0 0 2px rgba(0, 123, 255, 0.25)',
  },
}));

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/app/dashboard' },
  { text: 'New Project', icon: <AddIcon />, path: '/app/new-project' },
  { text: 'Projects', icon: <AssignmentIcon />, path: '/app/projects' },
  { text: 'Team', icon: <PeopleIcon />, path: '/app/team' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/app/settings' },
];

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { mode, toggleTheme } = useThemeContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchAnchorEl, setSearchAnchorEl] = useState<null | HTMLElement>(null);
  const [overdueProjects, setOverdueProjects] = useState<any[]>([]);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);

  // Check for projects that will be overdue soon (within 3 days)
  useEffect(() => {
    const checkOverdueProjects = async () => {
      try {
        const projects = await projectService.getProjects();
        const today = new Date();
        const soonOverdue = projects.filter(project => {
          if (!project.endDate) return false;
          const daysRemaining = differenceInDays(new Date(project.endDate), today);
          return daysRemaining >= 0 && daysRemaining <= 3; // 0-3 days remaining
        });
        setOverdueProjects(soonOverdue);
      } catch (error) {
        console.error('Error checking overdue projects:', error);
      }
    };

    checkOverdueProjects();
  }, []);

  // Close drawer when navigating to a new page
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [isMobile, location.pathname]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await signOut();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Simple search: Find projects with matching title or description
    const searchProjects = async () => {
      try {
        const projects = await projectService.getProjects();
        const results = projects.filter(project => 
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching projects:', error);
      }
    };
    
    searchProjects();
  };

  const handleSearchIconClick = (event: React.MouseEvent<HTMLElement>) => {
    setSearchAnchorEl(event.currentTarget);
    if (searchQuery.trim()) {
      handleSearch(event as unknown as React.FormEvent);
    }
  };

  const handleNotificationsClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNavigateToMenuItem = (path: string) => {
    navigate(path);
  };

  const searchOpen = Boolean(searchAnchorEl);
  const notificationsOpen = Boolean(notificationAnchorEl);
  
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBarStyled position="fixed" open={open && !isMobile}>
        <Toolbar sx={{ gap: 2 }}>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            width: '100%',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Tooltip title="Create New">
                <IconButton 
                  color="primary" 
                  onClick={() => navigate('/app/new-project')}
                  sx={{ 
                    bgcolor: 'primary.light', 
                    '&:hover': { bgcolor: 'primary.main' },
                    display: { xs: 'none', sm: 'flex' }
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
              <Box component="form" onSubmit={handleSearch} sx={{ 
                position: 'relative',
                width: { xs: '100%', sm: '300px' },
                maxWidth: '500px'
              }}>
                <IconButton 
                  onClick={handleSearchIconClick}
                  sx={{ 
                    position: 'absolute', 
                    left: 8, 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: 'text.secondary'
                  }}
                >
                  <SearchIcon />
                </IconButton>
                <SearchInput 
                  placeholder="Search projects..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e as unknown as React.FormEvent)}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
              <Tooltip title="Notifications">
                <IconButton 
                  sx={{ color: 'text.primary' }}
                  onClick={handleNotificationsClick}
                >
                  <Badge badgeContent={overdueProjects.length} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              <Tooltip title={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
                <IconButton onClick={toggleTheme} sx={{ color: 'text.primary' }}>
                  {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Profile">
                <IconButton 
                  onClick={handleProfileMenuOpen}
                  sx={{ 
                    color: 'text.primary',
                    ml: { xs: 0, sm: 1 }
                  }}
                >
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Toolbar>
      </AppBarStyled>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={open}
        onClose={handleDrawerToggle}
      >
        <DrawerHeader>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              ml: 2,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Taskr
          </Typography>
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.text}
              selected={location.pathname === item.path}
              onClick={() => handleNavigateToMenuItem(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Main open={open} isMobile={isMobile}>
        <DrawerHeader />
        {children}
      </Main>

      {/* Search Results Popover */}
      <Popover
        open={searchOpen}
        anchorEl={searchAnchorEl}
        onClose={() => setSearchAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: { width: 300, maxHeight: 400, mt: 1 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Search Results</Typography>
          {searchResults.length > 0 ? (
            <List>
              {searchResults.map(project => (
                <ListItem 
                  key={project.id}
                  button
                  onClick={() => {
                    navigate(`/app/projects/${project.id}`);
                    setSearchAnchorEl(null);
                  }}
                  sx={{ mb: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.875rem' }}>
                      {project.title.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ overflow: 'hidden' }}>
                      <Typography variant="body1" noWrap>{project.title}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {project.description || 'No description'}
                      </Typography>
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary">No results found</Typography>
          )}
        </Box>
      </Popover>

      {/* Notifications Popover */}
      <Popover
        open={notificationsOpen}
        anchorEl={notificationAnchorEl}
        onClose={() => setNotificationAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 320, maxHeight: 400, mt: 1 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Upcoming Deadlines</Typography>
          {overdueProjects.length > 0 ? (
            <List>
              {overdueProjects.map(project => {
                const daysLeft = differenceInDays(new Date(project.endDate), new Date());
                let message = '';
                let color = '';
                
                if (daysLeft === 0) {
                  message = 'Due today!';
                  color = 'error.main';
                } else if (daysLeft === 1) {
                  message = 'Due tomorrow';
                  color = 'warning.main';
                } else {
                  message = `Due in ${daysLeft} days`;
                  color = 'info.main';
                }
                
                return (
                  <Paper 
                    key={project.id} 
                    elevation={0} 
                    sx={{ 
                      mb: 1, 
                      p: 1.5, 
                      borderRadius: 1,
                      borderLeft: 3,
                      borderColor: color,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' } 
                    }}
                    onClick={() => {
                      navigate(`/app/projects/${project.id}`);
                      setNotificationAnchorEl(null);
                    }}
                  >
                    <Typography variant="body1" fontWeight={500}>{project.title}</Typography>
                    <Typography variant="body2" color={color} fontWeight={500}>{message}</Typography>
                  </Paper>
                );
              })}
            </List>
          ) : (
            <Typography color="text.secondary">No upcoming deadlines</Typography>
          )}
        </Box>
      </Popover>

      {/* Enhanced Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 200,
            borderRadius: 1,
          },
        }}
      >
        <MenuItem onClick={() => { 
          handleMenuClose(); 
          navigate('/app/profile'); 
        }}
        sx={{ gap: 1.5 }}
        >
          <AccountCircleIcon fontSize="small" />
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ gap: 1.5 }}>
          <LogoutIcon fontSize="small" />
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}; 