import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Briefcase, 
  Shield, 
  Settings, 
  BarChart3, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  UserPlus,
  UserMinus,
  Activity,
  FileText,
  MessageSquare,
  DollarSign,
  Calendar,
  MapPin,
  Phone,
  Globe,
  Award,
  Building,
  Star,
  MoreHorizontal,
  Plus,
  Download,
  Upload,
  Database,
  TrendingUp,
  TrendingDown,
  Target,
  PieChart,
  LineChart
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axios from '../axios';
import AdminLawyerVerification from './AdminLawyerVerification';
import AdminUserManagement from './AdminUserManagement';
import AdminAnalytics from './AdminAnalytics';
import AdminSystemSettings from './AdminSystemSettings';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'lawyer' | 'admin';
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  lawyerProfile?: {
    isVerified: boolean;
    verificationStatus: 'pending' | 'approved' | 'rejected';
    applicationDate?: string;
    verificationDate?: string;
  };
}

interface LawyerApplication {
  _id: string;
  applicant: {
    _id: string;
    username: string;
    email: string;
  };
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  applicationDate: string;
  reviewDate?: string;
  barNumber: string;
  barAssociation: string;
  practiceAreas: string[];
  yearsOfExperience: number;
  lawSchool: string;
  officeAddress: {
    state: string;
    city: string;
  };
}

interface SystemStats {
  totalUsers: number;
  totalLawyers: number;
  verifiedLawyers: number;
  pendingApplications: number;
  totalIssues: number;
  totalResponses: number;
  totalHires: number;
  activeUsers: number;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<LawyerApplication[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Filters and search
  const [userFilters, setUserFilters] = useState({
    role: '',
    status: '',
    search: ''
  });
  
  const [userModal, setUserModal] = useState({
    action: 'edit' as 'edit' | 'create',
    formData: {
      username: '',
      email: '',
      role: 'user' as 'user' | 'lawyer' | 'admin',
      isActive: true
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch users
      const usersResponse = await axios.get('/admin/users');
      if (usersResponse.data.success) {
        setUsers(usersResponse.data.data);
      }
      
      // Fetch applications
      const appsResponse = await axios.get('/lawyer-applications/admin');
      if (appsResponse.data.success) {
        setApplications(appsResponse.data.data);
      }
      
      // Fetch system stats
      const statsResponse = await axios.get('/admin/stats');
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (action: string, userId?: string) => {
    try {
      if (action === 'create') {
        const response = await axios.post('/admin/users', userModal.formData);
        if (response.data.success) {
          toast({
            title: "Success",
            description: "User created successfully",
            variant: "default",
          });
          setShowUserModal(false);
          fetchDashboardData();
        }
      } else if (action === 'update' && userId) {
        const response = await axios.put(`/admin/users/${userId}`, userModal.formData);
        if (response.data.success) {
          toast({
            title: "Success",
            description: "User updated successfully",
            variant: "default",
          });
          setShowUserModal(false);
          fetchDashboardData();
        }
      } else if (action === 'delete' && userId) {
        const response = await axios.delete(`/admin/users/${userId}`);
        if (response.data.success) {
          toast({
            title: "Success",
            description: "User deleted successfully",
            variant: "default",
          });
          setShowDeleteModal(false);
          fetchDashboardData();
        }
      }
    } catch (error: any) {
      console.error('Error performing user action:', error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to perform action",
        variant: "destructive",
      });
    }
  };

  const openUserModal = (action: 'create' | 'edit', user?: User) => {
    if (action === 'create') {
      setUserModal({
        action: 'create',
        formData: {
          username: '',
          email: '',
          role: 'user',
          isActive: true
        }
      });
    } else if (action === 'edit' && user) {
      setUserModal({
        action: 'edit',
        formData: {
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        }
      });
      setSelectedUser(user);
    }
    setShowUserModal(true);
  };

  const filteredUsers = users.filter(user => {
    if (userFilters.role && user.role !== userFilters.role) return false;
    if (userFilters.status === 'active' && !user.isActive) return false;
    if (userFilters.status === 'inactive' && user.isActive) return false;
    if (userFilters.search) {
      const searchTerm = userFilters.search.toLowerCase();
      return (
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }
    return true;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'lawyer':
        return <Briefcase className="h-4 w-4 text-blue-500" />;
      case 'user':
        return <Users className="h-4 w-4 text-green-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'lawyer':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, lawyers, and system operations
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Admin Access
        </Badge>
      </div>

      {/* System Overview Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeUsers} active users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lawyers</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLawyers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.verifiedLawyers} verified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApplications}</div>
              <p className="text-xs text-muted-foreground">
                Require review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Legal Issues</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalIssues}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalResponses} responses
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="lawyers" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Lawyers
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Applications
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <UserPlus className="h-4 w-4 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">New user registered</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Lawyer application approved</p>
                      <p className="text-xs text-muted-foreground">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <MessageSquare className="h-4 w-4 text-purple-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">New legal issue posted</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    onClick={() => openUserModal('create')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New User
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('applications')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Review Applications
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('lawyers')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Manage Lawyers
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('analytics')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <AdminUserManagement />
        </TabsContent>

        {/* Lawyers Tab */}
        <TabsContent value="lawyers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Lawyer Management
              </CardTitle>
              <CardDescription>
                Manage verified lawyers and their profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.filter(u => u.role === 'lawyer').map((lawyer) => (
                  <div
                    key={lawyer._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-blue-500" />
                        <div>
                          <h3 className="font-medium">{lawyer.username}</h3>
                          <p className="text-sm text-muted-foreground">{lawyer.email}</p>
                          {lawyer.lawyerProfile && (
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={lawyer.lawyerProfile.isVerified ? "default" : "secondary"}>
                                {lawyer.lawyerProfile.isVerified ? "Verified" : "Pending"}
                              </Badge>
                              {lawyer.lawyerProfile.verificationStatus && (
                                <Badge variant="outline">
                                  {lawyer.lawyerProfile.verificationStatus}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openUserModal('edit', lawyer)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Navigate to lawyer profile view
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-6">
          <AdminLawyerVerification />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <AdminAnalytics />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <AdminSystemSettings />
        </TabsContent>
      </Tabs>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {userModal.action === 'create' ? 'Create New User' : 'Edit User'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={userModal.formData.username}
                  onChange={(e) => setUserModal({
                    ...userModal,
                    formData: { ...userModal.formData, username: e.target.value }
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={userModal.formData.email}
                  onChange={(e) => setUserModal({
                    ...userModal,
                    formData: { ...userModal.formData, email: e.target.value }
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={userModal.formData.role}
                  onValueChange={(value: 'user' | 'lawyer' | 'admin') => setUserModal({
                    ...userModal,
                    formData: { ...userModal.formData, role: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="lawyer">Lawyer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={userModal.formData.isActive}
                  onChange={(e) => setUserModal({
                    ...userModal,
                    formData: { ...userModal.formData, isActive: e.target.checked }
                  })}
                />
                <Label htmlFor="isActive">Active Account</Label>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => handleUserAction(userModal.action, selectedUser?._id)}
                  className="flex-1"
                >
                  {userModal.action === 'create' ? 'Create' : 'Update'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowUserModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Confirm Deletion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Are you sure you want to delete user <strong>{selectedUser.username}</strong>? 
                This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  onClick={() => handleUserAction('delete', selectedUser._id)}
                  className="flex-1"
                >
                  Delete User
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
