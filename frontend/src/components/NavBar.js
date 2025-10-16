import * as React from 'react';
import { useState, useEffect } from 'react';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import { Link, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar'; // Removed MuiAppBarProps
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ChecklistIcon from '@mui/icons-material/Checklist';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import Collapse from '@mui/material/Collapse';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import AssignmentIcon from '@mui/icons-material/Assignment';
import getFile from '../assets/getFile.png';
import Tooltip from '@mui/material/Tooltip';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SummarizeIcon from '@mui/icons-material/Summarize';
import BadgeIcon from '@mui/icons-material/Badge';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import DnsIcon from '@mui/icons-material/Dns';
import TaskIcon from '@mui/icons-material/Task';
import Avatar from '@mui/material/Avatar';
import LogoutIcon from '@mui/icons-material/Logout';
import ScaleIcon from '@mui/icons-material/Scale';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import BackupTableIcon from '@mui/icons-material/BackupTable';
import StorageIcon from '@mui/icons-material/Storage';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import PaymentsIcon from '@mui/icons-material/Payments';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';

const drawerWidth = 270;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(8)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    variants: [
      {
        props: ({ open }) => open,
        style: {
          ...openedMixin(theme),
          '& .MuiDrawer-paper': openedMixin(theme),
        },
      },
      {
        props: ({ open }) => !open,
        style: {
          ...closedMixin(theme),
          '& .MuiDrawer-paper': closedMixin(theme),
        },
      },
    ],
  }),
);


export default function MiniDrawer() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [InfraOpen, setInfraOpen] = React.useState(false);
  const [ManageParameterOpen, setManageParameterOpen] = React.useState(false);
  const [monthlyAuditOpen, setMonthlyAuditOpen] = React.useState(false);
  const [username, setUsername] = useState('');
  const [userGroup, setUserGroup] = useState('');

  const location = useLocation();
  const path = location.pathname;
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedUserGroup = localStorage.getItem('userGroup');
    if (storedUsername && storedUserGroup) {
      setUsername(storedUsername);
      setUserGroup(storedUserGroup);
      setOpen(true);
      console.log('Stored Username:', storedUsername); 
      console.log('Stored UserGroup:', storedUserGroup);
    } else {
      console.log('No user information found');
    }
  }, []);
  

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleInfraClick = () => {
    setInfraOpen(!InfraOpen);
  };

  const handleMonthlyAuditClick = () => {
    setMonthlyAuditOpen(!monthlyAuditOpen);
  };

  const handleMangeParameterClick = () => {
    setManageParameterOpen(!ManageParameterOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('userGroup');
    localStorage.removeItem('userid');
    window.location.href = '/login'; 
    setOpen(false); // This can also be '/';
  };
  

  const roleAccess = {
    Admin_User: ['all'],
    Management_User: [
      'all',
      '!store',
      '!invoicehandovering',
      '!expenseclaim',
    ],
    Front_Desk_User: ['invoicehandovering', 'expenseclaim', 'home'],
    End_User: [
      'all',
      '!invoicehandovering',
      '!expenseclaim',
      '!daily_checklist',
      '!store',
    ],
  };

  const canAccess = (menuKey) => {
    const accessRules = roleAccess[userGroup] || [];
    if (accessRules.includes('all')) return !accessRules.includes(`!${menuKey}`);
    return accessRules.includes(menuKey);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} sx={{ backgroundColor: '#113f6c' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={[
              {
                marginRight: 5,
              },
              open && { display: 'none' },
            ]}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            OpTracker
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {username && userGroup ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: '#ffffff', color: '#113f6c' }}>
                {username.charAt(0).toUpperCase()} 
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff' }}>
                  {username}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#ddd' }}>
                  {userGroup}
                </Typography>
              </Box>
              <Tooltip title="Logout">
                <IconButton color="inherit" onClick={handleLogout} sx={{ marginLeft: 2 }}>
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            <Typography variant="h6" component="div" sx={{ color: '#fff' }}>
            </Typography>
          )}
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
            {open && (
              <img src={getFile} alt="Logo" style={{ height: '40px', marginRight: '60px' }} />
            )}
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
        {canAccess('home') && (
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/"  selected={path === "/"}>
              <ListItemIcon  sx={{ color: '#193f62', minWidth: 55 }}>
                <Tooltip title="Home" arrow>
                  <HomeIcon />
                </Tooltip>
              </ListItemIcon>
              <ListItemText primary={"Home"} primaryTypographyProps={{ fontSize: '0.95rem' }} />
            </ListItemButton>
          </ListItem>
          )}
          {canAccess('plu2_Checklist') && (
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/plu2_Checklist" selected={"/plu2_Checklist" === path}>
              <ListItemIcon sx={{ color: '#193f62', minWidth: 55 }}>
                <Tooltip title="Plu2 Checklist" arrow>
                  <ChecklistIcon />
                </Tooltip>
              </ListItemIcon>
              <ListItemText primary={"Plu2 Checklist"}  primaryTypographyProps={{ fontSize: '0.95rem' }} />
            </ListItemButton>
          </ListItem>
          )}
          {canAccess('daily_checklist') && (
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/daily_checklist" selected={"/daily_checklist" === path}>
              <ListItemIcon sx={{ color: '#193f62', minWidth: 55 }}>
                <Tooltip title="Daily Checklist" arrow>
                  <DoneAllIcon />
                </Tooltip>
              </ListItemIcon>
              <ListItemText primary={"Daily Checklist"}  primaryTypographyProps={{ fontSize: '0.95rem' }} />
            </ListItemButton>
          </ListItem>
          )}
          {canAccess('sale_posting') && (
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/sale_posting" selected={"/sale_posting" === path}>
              <ListItemIcon sx={{ color: '#193f62', minWidth: 55 }}>
                <Tooltip title="Sale Posting" arrow>
                  <ShowChartIcon />
                </Tooltip>
              </ListItemIcon>
              <ListItemText primary={"Sale Posting"}  primaryTypographyProps={{ fontSize: '0.95rem' }}/>
            </ListItemButton>
          </ListItem>
          )}
          {canAccess('invoicehandovering') && (
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/invoicehandovering" selected={"/invoicehandovering" === path}>
              <ListItemIcon sx={{ color: '#193f62', minWidth: 55 }}>
                <Tooltip title="Invoice Handovering" arrow>
                  <ReceiptLongIcon />
                </Tooltip>
              </ListItemIcon>
              <ListItemText primary={"Invoice Handovering"}  primaryTypographyProps={{ fontSize: '0.95rem' }}/>
            </ListItemButton>
          </ListItem>
          )}
          {canAccess('expenseclaim') && (
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/expenseclaim" selected={"/expenseclaim" === path}>
              <ListItemIcon sx={{ color: '#193f62', minWidth: 55 }}>
                <Tooltip title="Expense Claim" arrow>
                  <PaymentsIcon />
                </Tooltip>
              </ListItemIcon>
              <ListItemText primary={"Expense Claim"}  primaryTypographyProps={{ fontSize: '0.95rem' }}/>
            </ListItemButton>
          </ListItem>
          )}
          {canAccess('Pos_Backup') && (
          <ListItem disablePadding>
            <ListItemButton onClick={handleInfraClick}>
              <ListItemIcon sx={{ color: '#193f62', minWidth: 55 }}>
                <Tooltip title="Pos & Backup List" arrow>
                  <FactCheckIcon />
                </Tooltip>
              </ListItemIcon>
              <ListItemText primary={"Pos & Backup List"}  primaryTypographyProps={{ fontSize: '0.95rem' }}/>
              {InfraOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          )}
          <Collapse in={InfraOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton component={Link} to="/pos_status" sx={{ pl: 3.5}}>
                <ListItemIcon sx={{ color: '#154b7e', minWidth: 47 }}>
                  <Tooltip title="Pos Status" arrow>
                    <PointOfSaleIcon />
                  </Tooltip>
                </ListItemIcon>
                <ListItemText primary="Pos Status"  primaryTypographyProps={{ fontSize: '0.95rem' }} sx={{ color: '#757575'}}/>
              </ListItemButton>
              <ListItemButton component={Link} to="/pos_performance_checklist" sx={{ pl: 3.5  }}>
                <ListItemIcon sx={{ color: '#154b7e', minWidth: 47 }}>
                  <Tooltip title="Pos Performance" arrow>
                    <AccessTimeIcon  />
                  </Tooltip>
                </ListItemIcon>
                <ListItemText primary="Pos Performance"  primaryTypographyProps={{ fontSize: '0.95rem' }} sx={{ color: '#757575'}}/>
              </ListItemButton>
              <ListItemButton component={Link} to="/scale_status" sx={{ pl: 3.5 }}>
                <ListItemIcon sx={{ color: '#154b7e' , minWidth: 47}}>
                  <Tooltip title="Scale Status" arrow>
                    <ScaleIcon />
                  </Tooltip>
                </ListItemIcon>
                <ListItemText primary="Scale Status"  primaryTypographyProps={{ fontSize: '0.95rem' }} sx={{ color: '#757575', }}/>
              </ListItemButton>
              <ListItemButton component={Link} to="/ups_amc_status" sx={{ pl: 3.5 }}>
                <ListItemIcon sx={{ color: '#154b7e' , minWidth: 47}}>
                  <Tooltip title="UPS AMC Status" arrow>
                    <ElectricalServicesIcon />
                  </Tooltip>
                </ListItemIcon>
                <ListItemText primary="UPS AMC Status"  primaryTypographyProps={{ fontSize: '0.95rem' }} sx={{ color: '#757575'}}/>
              </ListItemButton>
              <ListItemButton component={Link} to="/pdt_status" sx={{ pl: 3.5 }}>
                <ListItemIcon sx={{ color: '#154b7e' , minWidth: 47}}>
                  <Tooltip title="PDT Status" arrow>
                    <BackupTableIcon />
                  </Tooltip>
                </ListItemIcon>
                <ListItemText primary="PDT status"  primaryTypographyProps={{ fontSize: '0.95rem' }} sx={{ color: '#757575'}}/>
              </ListItemButton>
              <ListItemButton component={Link} to="/server_status" sx={{ pl: 3.5}}>
                <ListItemIcon sx={{ color: '#154b7e' , minWidth: 47}}>
                  <Tooltip title="Server Status" arrow>
                    <DnsIcon />
                  </Tooltip>
                </ListItemIcon>
                <ListItemText primary="Server Status"  primaryTypographyProps={{ fontSize: '0.95rem' }} sx={{ color: '#757575'}}/>
              </ListItemButton>
              <ListItemButton component={Link} to="/server_storage_status" sx={{ pl: 3.5}}>
                <ListItemIcon sx={{ color: '#154b7e' , minWidth: 47}}>
                  <Tooltip title="Server Storage Status" arrow>
                    <SpaceDashboardIcon />
                  </Tooltip>
                </ListItemIcon>
                <ListItemText primary="Server Storage Status"  primaryTypographyProps={{ fontSize: '0.95rem' }} sx={{ color: '#757575'}}/>
              </ListItemButton>
              <ListItemButton component={Link} to="/ind_store_backup_status" sx={{ pl: 3.5}}>
                <ListItemIcon sx={{ color: '#154b7e' , minWidth: 47}}>
                  <Tooltip title="Ind-Store Backup Status" arrow>
                    <StorageIcon />
                  </Tooltip>
                </ListItemIcon>
                <ListItemText primary="Ind-Store Backup Status"  primaryTypographyProps={{ fontSize: '0.95rem' }} sx={{ color: '#757575'}}/>
              </ListItemButton>
              <ListItemButton component={Link} to="/acronics_backup_status" sx={{ pl: 3.5}}>
                <ListItemIcon sx={{ color: '#154b7e' , minWidth: 47}}>
                  <Tooltip title="Acronics Backup Status" arrow>
                    <LibraryAddCheckIcon />
                  </Tooltip>
                </ListItemIcon>
                <ListItemText primary="Acronics Backup Status"  primaryTypographyProps={{ fontSize: '0.95rem' }} sx={{ color: '#757575'}}/>
              </ListItemButton>
              <ListItemButton component={Link} to="/sales_status" sx={{ pl: 3.5}}>
                <ListItemIcon sx={{ color: '#154b7e' , minWidth: 47}}>
                  <Tooltip title="Sales status" arrow>
                    <QueryStatsIcon />
                  </Tooltip>
                </ListItemIcon>
                <ListItemText primary="Sales Status"  primaryTypographyProps={{ fontSize: '0.95rem' }} sx={{ color: '#757575'}}/>
              </ListItemButton>
              <ListItemButton component={Link} to="/zvchr_status" sx={{ pl: 3.5}}>
                <ListItemIcon sx={{ color: '#154b7e' , minWidth: 47}}>
                  <Tooltip title="ZVCHR Status" arrow>
                    <TaskIcon />
                  </Tooltip>
                </ListItemIcon>
                <ListItemText primary="ZVCHR Status"  primaryTypographyProps={{ fontSize: '0.95rem' }} sx={{ color: '#757575'}}/>
              </ListItemButton>
              <ListItemButton component={Link} to="/ad_user_list" sx={{ pl: 3.5 }}>
                <ListItemIcon sx={{ color: '#154b7e' , minWidth: 47}}>
                  <Tooltip title="AD User List" arrow>
                    <PeopleAltIcon  />
                  </Tooltip>
                </ListItemIcon>
                <ListItemText primary="AD User List"  primaryTypographyProps={{ fontSize: '0.95rem' }} sx={{ color: '#757575'}}/>
              </ListItemButton>
              <ListItemButton component={Link} to="/idt_register" sx={{ pl: 3.5 }}>
                <ListItemIcon sx={{ color: '#154b7e' , minWidth: 47}}>
                  <Tooltip title="IDT Register" arrow>
                    <BadgeIcon  />
                  </Tooltip>
                </ListItemIcon>
                <ListItemText primary="IDT Register"  primaryTypographyProps={{ fontSize: '0.95rem' }} sx={{ color: '#757575'}}/>
              </ListItemButton>
            </List>
          </Collapse>
          {canAccess('Monthly_Audit') && (
          <ListItem disablePadding>
            <ListItemButton onClick={handleMonthlyAuditClick}>
              <ListItemIcon sx={{ color: '#154b7e', minWidth: 55 }}>
                <Tooltip title="Monthly Audit" arrow>
                  <AssignmentIcon />
                </Tooltip>
              </ListItemIcon>
              <ListItemText primary="Monthly Audit"  primaryTypographyProps={{ fontSize: '0.95rem' }} />
              {monthlyAuditOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          )}
          <Collapse in={monthlyAuditOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
            <ListItemButton component={Link} to="/pos_db_backup_status" sx={{ pl: 3.5}}>
              <ListItemIcon sx={{ color: '#154b7e' , minWidth: 47}}>
                <Tooltip title="Pos DB Backup Status" arrow>
                  <DataUsageIcon />
                </Tooltip>
              </ListItemIcon>
            <ListItemText primary="Pos DB Backup Status"  primaryTypographyProps={{ fontSize: '0.95rem' }} sx={{ color: '#757575'}}/>
            </ListItemButton>
            <ListItemButton component={Link} to="/governance_report" sx={{ pl:  3.5  }}>
              <ListItemIcon sx={{ color: '#154b7e', minWidth: 47 }}>
                <Tooltip title="Governance Report" arrow>
                  <SummarizeIcon  />
                </Tooltip>
              </ListItemIcon>
              <ListItemText primary="Governance Report"  primaryTypographyProps={{ fontSize: '0.95rem' }} sx={{ color: '#757575'}}/>
            </ListItemButton>
            <ListItemButton component={Link} to="/nas_backup" sx={{ pl:  3.5 }}>
              <ListItemIcon sx={{ color: '#154b7e', minWidth: 47 }}>
                <Tooltip title="NAS Backup" arrow>
                  <DnsIcon  />
                </Tooltip>
              </ListItemIcon>
              <ListItemText primary="NAS Backup"  primaryTypographyProps={{ fontSize: '0.95rem' }} sx={{ color: '#757575'}}/>
            </ListItemButton>
            <ListItemButton component={Link} to="/pos_user_review" sx={{ pl: 3.5 }}>
              <ListItemIcon sx={{ color: '#154b7e' , minWidth: 47}}>
                <Tooltip title="Pos User Review" arrow>
                  <TaskIcon  />
                </Tooltip>
              </ListItemIcon>
              <ListItemText primary="Pos User Review"   primaryTypographyProps={{ fontSize: '0.95rem' }} sx={{ color: '#757575'}}/>
            </ListItemButton>
          </List>
          </Collapse>

          {canAccess('Mange_Parameter') && (
          <ListItem disablePadding>
            <ListItemButton onClick={handleMangeParameterClick}>
              <ListItemIcon sx={{ color: '#154b7e', minWidth: 55 }}>
                <Tooltip title="Add/Remove Parameter" arrow>
                  <AddIcon />
                </Tooltip>
              </ListItemIcon>
              <ListItemText primary="Manage Parameter"  primaryTypographyProps={{ fontSize: '0.95rem' }} />
              {ManageParameterOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          )}
          <Collapse in={ManageParameterOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
          {canAccess('store') && (
            <ListItemButton component={Link} to="/store" selected={"/store" === path} sx={{ pl: 3.5  }}>
              <ListItemIcon sx={{ color: '#193f62', minWidth: 55 }}>
                <Tooltip title="Manage Store" arrow>
                  <AddBusinessIcon />
                </Tooltip>
              </ListItemIcon>
            <ListItemText primary={"Manage Store"}  primaryTypographyProps={{ fontSize: '0.95rem' }}/>
            </ListItemButton>
            )}
            <ListItemButton component={Link} to="/pos_scale_pdt" selected={"/pos_scale_pdt" === path} sx={{ pl: 3.5  }}>
              <ListItemIcon sx={{ color: '#193f62', minWidth: 55 }}>
                <Tooltip title="Manage POS/PDT/SCALE" arrow>
                  <ManageHistoryIcon />
                </Tooltip>
              </ListItemIcon>
              <ListItemText primary={"Manage POS/PDT/SCALE"}  primaryTypographyProps={{ fontSize: '0.9rem' }}/>
            </ListItemButton>
            <ListItemButton component={Link} to="/manageserver" selected={"/manageserver" === path} sx={{ pl: 3.5  }}>
              <ListItemIcon sx={{ color: '#193f62', minWidth: 55 }}>
                <Tooltip title="Manage Server" arrow>
                  <SettingsSuggestIcon />
                </Tooltip>
              </ListItemIcon>
            <ListItemText primary={"Manage Server"}  primaryTypographyProps={{ fontSize: '0.95rem' }}/>
            </ListItemButton>
            <ListItemButton component={Link} to="/manageups" selected={"/manageups" === path}sx={{ pl: 3.5  }}>
              <ListItemIcon sx={{ color: '#193f62', minWidth: 55 }}>
                <Tooltip title="Manage UPS" arrow>
                  <EditNoteIcon />
                </Tooltip>
              </ListItemIcon>
            <ListItemText primary={"Manage UPS"}  primaryTypographyProps={{ fontSize: '0.95rem' }}/>
            </ListItemButton>
          {canAccess('profile') && (
            <ListItemButton component={Link} to="/profile" selected={"/profile" === path}sx={{ pl: 3.5  }}>
              <ListItemIcon sx={{ color: '#193f62', minWidth: 55 }}>
                <Tooltip title="Manage Profile" arrow>
                  <PersonSearchIcon />
                </Tooltip>
              </ListItemIcon>
            <ListItemText primary={"Manage Profile"}  primaryTypographyProps={{ fontSize: '0.95rem' }}/>
            </ListItemButton>
          )}
          </List>
          </Collapse>  
      </List>
        <Divider />
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
      </Box>
    </Box>
  );
}

