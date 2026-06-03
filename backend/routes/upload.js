const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const { protect, adminOnly } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

// @route   POST /api/upload
// @desc    Upload an image to Cloudinary
// @access  Admin
router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        // multer-storage-cloudinary attaches the secure_url as req.file.path
        // The file.filename contains the Cloudinary public_id
        res.json({
            message: 'Image uploaded successfully',
            url: req.file.path,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Server error uploading image' });
    }
});

// @route   DELETE /api/upload/:filename
// @desc    Delete an uploaded image from Cloudinary
// @access  Admin
router.delete('/:filename', protect, adminOnly, async (req, res) => {
    try {
        // req.params.filename contains the public_id in Cloudinary (e.g., "nizami_foods/ab12cd")
        const publicId = decodeURIComponent(req.params.filename);
        
        await cloudinary.uploader.destroy(publicId);
        
        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Server error deleting image' });
    }
});

module.exports = router;
