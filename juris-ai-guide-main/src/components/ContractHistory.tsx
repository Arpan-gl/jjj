import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  FileText, 
  Clock, 
  Eye, 
  Download, 
  Trash2, 
  BarChart3, 
  Calendar,
  FileType,
  HardDrive
} from 'lucide-react';
import axios from '../axios';

interface ContractHistoryItem {
  _id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  analysisDate: string;
  accessCount: number;
  lastAccessed: string;
  status: string;
}

interface ContractStats {
  totalContracts: number;
  totalAccessCount: number;
  averageAccessCount: number;
  totalFileSize: number;
  lastUploadDate: string | null;
}

interface FileTypeBreakdown {
  _id: string;
  count: number;
}

interface RecentContract {
  fileName: string;
  analysisDate: string;
  accessCount: number;
}

interface ContractHistoryData {
  contracts: ContractHistoryItem[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}

const ContractHistory = () => {
  const [contracts, setContracts] = useState<ContractHistoryItem[]>([]);
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [fileTypeBreakdown, setFileTypeBreakdown] = useState<FileTypeBreakdown[]>([]);
  const [recentContracts, setRecentContracts] = useState<RecentContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchContractHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/smart-contract-analysis/user/contracts?page=${currentPage}&limit=10`);

      if (response.data.success) {
        setContracts(response.data.contracts);
        setTotalPages(response.data.pagination.pages);
      } else {
        setError('Failed to fetch contract history');
      }
    } catch (err) {
      console.error('Error fetching contract history:', err);
      setError('Failed to fetch contract history');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get('/smart-contract-analysis/stats');

      if (response.data.success) {
        setStats(response.data.stats);
        setFileTypeBreakdown(response.data.fileTypeBreakdown);
        setRecentContracts(response.data.recentContracts);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchContractHistory();
    fetchStats();
  }, [currentPage, fetchContractHistory, fetchStats]);

  const handleDeleteContract = async (contractId: string) => {
    if (!window.confirm('Are you sure you want to delete this contract? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(`/contract-signature/${contractId}`);

      if (response.data.success) {
        // Refresh the contract list
        fetchContractHistory();
        fetchStats();
      } else {
        setError('Failed to delete contract');
      }
    } catch (err) {
      console.error('Error deleting contract:', err);
      setError('Failed to delete contract');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('docx')) return '📝';
    if (fileType.includes('text')) return '📃';
    return '📄';
  };

  const getFileTypeColor = (fileType: string) => {
    if (fileType.includes('pdf')) return 'bg-red-100 text-red-800';
    if (fileType.includes('word') || fileType.includes('docx')) return 'bg-blue-100 text-blue-800';
    if (fileType.includes('text')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading && contracts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">
            Contract History
          </h1>
          <p className="text-lg text-gray-600">
            View and manage your previously analyzed contracts
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="contracts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="contracts">My Contracts</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>

          <TabsContent value="contracts" className="space-y-4">
            {contracts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts found</h3>
                  <p className="text-gray-500">You haven't analyzed any contracts yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {contracts.map((contract) => (
                  <Card key={contract._id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">
                            {getFileTypeIcon(contract.fileType)}
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">{contract.fileName}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                              <span className="flex items-center">
                                <HardDrive className="h-4 w-4 mr-1" />
                                {formatFileSize(contract.fileSize)}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(contract.analysisDate)}
                              </span>
                              <span className="flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                {contract.accessCount} views
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getFileTypeColor(contract.fileType)}>
                            {contract.fileType.split('/')[1]?.toUpperCase() || 'FILE'}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteContract(contract._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-2xl font-bold">{stats.totalContracts}</p>
                        <p className="text-sm text-gray-600">Total Contracts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Eye className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-2xl font-bold">{stats.totalAccessCount}</p>
                        <p className="text-sm text-gray-600">Total Views</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <BarChart3 className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-2xl font-bold">{Math.round(stats.averageAccessCount)}</p>
                        <p className="text-sm text-gray-600">Avg Views</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <HardDrive className="h-8 w-8 text-orange-600" />
                      <div className="ml-4">
                        <p className="text-2xl font-bold">{formatFileSize(stats.totalFileSize)}</p>
                        <p className="text-sm text-gray-600">Total Size</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {fileTypeBreakdown.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>File Type Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {fileTypeBreakdown.map((item) => (
                      <div key={item._id} className="flex items-center justify-between">
                        <span className="flex items-center">
                          <span className="mr-2">{getFileTypeIcon(item._id)}</span>
                          {item._id.split('/')[1]?.toUpperCase() || 'UNKNOWN'}
                        </span>
                        <Badge variant="outline">{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            {recentContracts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No recent contracts</h3>
                  <p className="text-gray-500">Your recent contract activity will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {recentContracts.map((contract, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{contract.fileName}</h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(contract.analysisDate)} • {contract.accessCount} views
                          </p>
                        </div>
                        <Badge variant="outline">Recent</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ContractHistory;
