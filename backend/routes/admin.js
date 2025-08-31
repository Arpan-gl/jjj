import express from 'express';
import { userModel } from '../models/user.models.js';
import { issueModel } from '../models/issue.models.js';
import { responseModel } from '../models/response.models.js';
import { hireModel } from '../models/hire.models.js';
import { lawyerApplicationModel } from '../models/lawyerApplication.models.js';
import { verifyUser } from '../middleware.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Admin middleware - check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    next();
  } catch (error) {
    console.error('Error in admin middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Apply authentication middleware first, then admin middleware
router.use(verifyUser);
router.use(requireAdmin);

// Get system statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalLawyers,
      verifiedLawyers,
      pendingApplications,
      totalIssues,
      totalResponses,
      totalHires,
      activeUsers
    ] = await Promise.all([
      userModel.countDocuments(),
      userModel.countDocuments({ role: 'lawyer' }),
      userModel.countDocuments({ 
        role: 'lawyer', 
        'lawyerProfile.isVerified': true 
      }),
      lawyerApplicationModel.countDocuments({ 
        status: { $in: ['pending', 'under_review'] } 
      }),
      issueModel.countDocuments(),
      responseModel.countDocuments(),
      hireModel.countDocuments(),
      userModel.countDocuments({ isActive: true })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalLawyers,
        verifiedLawyers,
        pendingApplications,
        totalIssues,
        totalResponses,
        totalHires,
        activeUsers
      }
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all users with pagination and filters
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;
    
    const users = await userModel.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await userModel.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get specific user
router.get('/users/:id', async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new user
router.post('/users', async (req, res) => {
  try {
    const { username, email, password, role, isActive = true } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, password, and role are required'
      });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userData = {
      username,
      email,
      password: hashedPassword,
      role,
      isActive,
      uploader: []
    };

    // If creating a lawyer, add lawyer profile
    if (role === 'lawyer') {
      userData.lawyerProfile = {
        isVerified: false,
        verificationStatus: 'pending',
        applicationDate: new Date()
      };
    }

    const newUser = await userModel.create(userData);

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { username, email, role, isActive } = req.body;
    const userId = req.params.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if username/email already exists (excluding current user)
    if (username && username !== user.username) {
      const existingUser = await userModel.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
      }
    }

    if (email && email !== user.email) {
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Update user
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    // Handle role change to lawyer
    if (role === 'lawyer' && user.role !== 'lawyer') {
      updateData.lawyerProfile = {
        isVerified: false,
        verificationStatus: 'pending',
        applicationDate: new Date()
      };
    }

    // Handle role change from lawyer
    if (user.role === 'lawyer' && role !== 'lawyer') {
      updateData.$unset = { lawyerProfile: 1 };
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user.role === 'admin' && userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own admin account'
      });
    }

    // Delete user
    await userModel.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Bulk user actions
router.post('/users/bulk-action', async (req, res) => {
  try {
    const { action, userIds, data } = req.body;

    if (!action || !userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        message: 'Action and user IDs are required'
      });
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'activate':
        updateData = { isActive: true };
        message = 'Users activated successfully';
        break;
      case 'deactivate':
        updateData = { isActive: false };
        message = 'Users deactivated successfully';
        break;
      case 'change-role':
        if (!data.role) {
          return res.status(400).json({
            success: false,
            message: 'Role is required for role change action'
          });
        }
        updateData = { role: data.role };
        message = 'User roles updated successfully';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    const result = await userModel.updateMany(
      { _id: { $in: userIds } },
      updateData
    );

    res.json({
      success: true,
      message,
      data: {
        modifiedCount: result.modifiedCount,
        totalCount: userIds.length
      }
    });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user activity logs
router.get('/users/:id/activity', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get user's recent activity
    const [issues, responses, hires] = await Promise.all([
      issueModel.find({ author: userId }).sort({ createdAt: -1 }).limit(10).lean(),
      responseModel.find({ lawyer: userId }).sort({ createdAt: -1 }).limit(10).lean(),
      hireModel.find({ 
        $or: [{ client: userId }, { lawyer: userId }] 
      }).sort({ createdAt: -1 }).limit(10).lean()
    ]);

    const activity = [
      ...issues.map(issue => ({
        type: 'issue_created',
        date: issue.createdAt,
        data: { title: issue.title, category: issue.category }
      })),
      ...responses.map(response => ({
        type: 'response_posted',
        date: response.createdAt,
        data: { issueId: response.issue }
      })),
      ...hires.map(hire => ({
        type: 'hire_created',
        date: hire.createdAt,
        data: { status: hire.status, amount: hire.contractTerms?.amount }
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get system reports
router.get('/reports', async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    
    let start = new Date(0);
    let end = new Date();
    
    if (startDate) start = new Date(startDate);
    if (endDate) end = new Date(endDate);

    let reportData = {};

    switch (type) {
      case 'user-registration':
        const userStats = await userModel.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lte: end }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
              },
              count: { $sum: 1 },
              roles: { $push: "$role" }
            }
          },
          { $sort: { _id: 1 } }
        ]);
        reportData = userStats;
        break;

      case 'lawyer-applications':
        const appStats = await lawyerApplicationModel.aggregate([
          {
            $match: {
              applicationDate: { $gte: start, $lte: end }
            }
          },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          }
        ]);
        reportData = appStats;
        break;

      case 'legal-issues':
        const issueStats = await issueModel.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lte: end }
            }
          },
          {
            $group: {
              _id: "$category",
              count: { $sum: 1 },
              avgBudget: { $avg: "$budget" }
            }
          }
        ]);
        reportData = issueStats;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Export user data
router.get('/export/users', async (req, res) => {
  try {
    const users = await userModel.find({})
      .select('-password')
      .lean();

    // Convert to CSV format
    const csvData = users.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      verificationStatus: user.lawyerProfile?.verificationStatus || 'N/A'
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    
    // Simple CSV generation
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    res.send(csv);
  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
