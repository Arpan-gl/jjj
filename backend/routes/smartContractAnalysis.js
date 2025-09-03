import express from 'express';
import { uploadSingleFile } from '../utils/multer.js';
import { contractSignatureModel } from '../models/contractSignature.models.js';
import { contractSignatureService, encryptionService } from '../utils/encryption.js';
import { verifyUser } from '../middleware.js';
import axios from 'axios';
import FormData from 'form-data';
import upload from '../utils/multer.js';

const router = express.Router();

// Use shared multer middleware

/**
 * POST /api/smart-contract-analysis/analyze
 * Smart contract analysis with signature logging
 */
router.post('/analyze', verifyUser, uploadSingleFile('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Generate file hash for duplicate detection
    const fileHash = encryptionService.generateFileHash(req.file.buffer);
    
    // Check if contract already exists
    const existingContract = await contractSignatureModel.findOne({
      fileHash,
      uploadedBy: req.user._id,
      status: 'active'
    });

    if (existingContract) {
      // Increment access count and return exis
      // ting analysis
      await existingContract.incrementAccess();
      
      const decryptedAnalysis = existingContract.getDecryptedAnalysis();
      const decryptedContent = existingContract.getDecryptedContent();
      
      return res.status(200).json({
        success: true,
        message: 'Contract already analyzed. Returning previous analysis.',
        isDuplicate: true,
        analysis: decryptedAnalysis,
        extracted_text: decryptedContent.extractedText,
        contractId: existingContract._id,
        accessCount: existingContract.accessCount,
        lastAnalyzed: existingContract.analysisDate,
        contractInfo: {
          fileName: existingContract.fileName,
          fileSize: existingContract.fileSize,
          analysisDate: existingContract.analysisDate
        }
      });
    }

    // If contract doesn't exist, proceed with analysis
    try {
      // Create form data to send to Python analysis service (Node)
      const formData = new FormData();
      formData.append('file', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        knownLength: req.file.size
      });

      // Call the Python analysis service
      const analysisResponse = await axios.post('http://localhost:5001/analyze', formData, {
        headers: {
          ...formData.getHeaders(),
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 60000 // 60 second timeout
      });

      if (!analysisResponse.data || !analysisResponse.data.analysis) {
        throw new Error('Invalid response from analysis service');
      }

      const { analysis, extracted_text } = analysisResponse.data;

      // Create encrypted signature
      const signatureData = contractSignatureService.createSignature(
        {
          fileName: req.file.originalname,
          fileSize: req.file.size,
          fileType: req.file.mimetype,
          uploadDate: new Date(),
          extractedText: extracted_text
        },
        analysis,
        req.user._id
      );

      // Save to database
      const contractSignature = new contractSignatureModel({
        fileHash,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        uploadedBy: req.user._id,
        encryptedContent: signatureData.encryptedContent,
        encryptedAnalysis: signatureData.encryptedAnalysis,
        encryptionKey: signatureData.key,
        iv: signatureData.iv,
        contentTag: signatureData.contentTag,
        analysisTag: signatureData.analysisTag
      });

      await contractSignature.save();

      res.status(200).json({
        success: true,
        message: 'Contract analyzed and stored successfully',
        isDuplicate: false,
        analysis,
        extracted_text,
        contractId: contractSignature._id,
        contractInfo: {
          fileName: contractSignature.fileName,
          fileSize: contractSignature.fileSize,
          analysisDate: contractSignature.analysisDate
        }
      });

    } catch (analysisError) {
      console.error('Analysis service error:', analysisError);
      
      // If analysis fails, still try to store the file for future processing
      if (analysisError.response && analysisError.response.status === 500) {
        return res.status(500).json({
          success: false,
          message: 'Contract analysis failed. Please try again.',
          error: analysisError.response.data?.error || 'Analysis service error'
        });
      }
      
      throw analysisError;
    }

  } catch (error) {
    console.error('Smart contract analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze contract',
      error: error.message
    });
  }
});

/**
 * POST /api/smart-contract-analysis/check-duplicate
 * Check if a contract already exists without performing analysis
 */
router.post('/check-duplicate', verifyUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileHash = encryptionService.generateFileHash(req.file.buffer);
    
    const existingContract = await contractSignatureModel.findOne({
      fileHash,
      uploadedBy: req.user._id,
      status: 'active'
    });

    if (existingContract) {
      const analysis = existingContract.getDecryptedAnalysis();
      const content = existingContract.getDecryptedContent();
      
      res.status(200).json({
        success: true,
        isDuplicate: true,
        contractId: existingContract._id,
        analysis,
        extracted_text: content.extractedText,
        contractInfo: {
          fileName: existingContract.fileName,
          fileSize: existingContract.fileSize,
          analysisDate: existingContract.analysisDate,
          accessCount: existingContract.accessCount
        }
      });
    } else {
      res.status(200).json({
        success: true,
        isDuplicate: false,
        message: 'Contract not found in database. Analysis required.'
      });
    }

  } catch (error) {
    console.error('Duplicate check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check for duplicate contract',
      error: error.message
    });
  }
});

/**
 * GET /api/smart-contract-analysis/user/contracts
 * Get all contracts for the authenticated user with basic info
 */
router.get('/user/contracts', verifyUser, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'active' } = req.query;
    
    const contracts = await contractSignatureModel
      .find({
        uploadedBy: req.user._id,
        status
      })
      .select('-encryptedContent -encryptedAnalysis -encryptionKey -iv -contentTag -analysisTag')
      .sort({ analysisDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await contractSignatureModel.countDocuments({
      uploadedBy: req.user._id,
      status
    });

    res.status(200).json({
      success: true,
      contracts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('User contracts retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user contracts',
      error: error.message
    });
  }
});

/**
 * GET /api/smart-contract-analysis/contract/:contractId
 * Get specific contract analysis
 */
router.get('/contract/:contractId', verifyUser, async (req, res) => {
  try {
    const { contractId } = req.params;

    const contractSignature = await contractSignatureModel.findOne({
      _id: contractId,
      uploadedBy: req.user._id,
      status: 'active'
    });

    if (!contractSignature) {
      return res.status(404).json({
        success: false,
        message: 'Contract not found'
      });
    }

    // Increment access count
    await contractSignature.incrementAccess();

    // Decrypt and return analysis
    const analysis = contractSignature.getDecryptedAnalysis();
    const content = contractSignature.getDecryptedContent();

    res.status(200).json({
      success: true,
      contract: {
        id: contractSignature._id,
        fileName: contractSignature.fileName,
        fileSize: contractSignature.fileSize,
        fileType: contractSignature.fileType,
        analysisDate: contractSignature.analysisDate,
        accessCount: contractSignature.accessCount,
        lastAccessed: contractSignature.lastAccessed
      },
      analysis,
      extracted_text: content.extractedText
    });

  } catch (error) {
    console.error('Contract retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contract',
      error: error.message
    });
  }
});

/**
 * GET /api/smart-contract-analysis/stats
 * Get contract analysis statistics
 */
router.get('/stats', verifyUser, async (req, res) => {
  try {
    const stats = await contractSignatureModel.aggregate([
      {
        $match: {
          uploadedBy: req.user._id,
          status: 'active'
        }
      },
      {
        $group: {
          _id: null,
          totalContracts: { $sum: 1 },
          totalAccessCount: { $sum: '$accessCount' },
          averageAccessCount: { $avg: '$accessCount' },
          totalFileSize: { $sum: '$fileSize' },
          lastUploadDate: { $max: '$analysisDate' }
        }
      }
    ]);

    const fileTypeStats = await contractSignatureModel.aggregate([
      {
        $match: {
          uploadedBy: req.user._id,
          status: 'active'
        }
      },
      {
        $group: {
          _id: '$fileType',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentContracts = await contractSignatureModel
      .find({
        uploadedBy: req.user._id,
        status: 'active'
      })
      .select('fileName analysisDate accessCount')
      .sort({ analysisDate: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: stats[0] || {
        totalContracts: 0,
        totalAccessCount: 0,
        averageAccessCount: 0,
        totalFileSize: 0,
        lastUploadDate: null
      },
      fileTypeBreakdown: fileTypeStats,
      recentContracts
    });

  } catch (error) {
    console.error('Stats retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics',
      error: error.message
    });
  }
});

export default router;
