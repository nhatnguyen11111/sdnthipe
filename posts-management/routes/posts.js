const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const multer = require('multer');
const path = require('path');

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// GET all posts
router.get('/', async (req, res) => {
    try {
        const { search, sort } = req.query;
        let query = {};
        
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        
        let sortOption = {};
        if (sort === 'name-asc') {
            sortOption.name = 1;
        } else if (sort === 'name-desc') {
            sortOption.name = -1;
        } else {
            sortOption.createdAt = -1;
        }
        
        const posts = await Post.find(query).sort(sortOption);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single post
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE new post
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name || !description) {
            return res.status(400).json({ error: 'Name and description are required' });
        }
        
        const postData = {
            name,
            description,
            image: req.file ? `/uploads/${req.file.filename}` : null
        };
        
        const post = new Post(postData);
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE post
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name || !description) {
            return res.status(400).json({ error: 'Name and description are required' });
        }
        
        const updateData = {
            name,
            description,
            updatedAt: Date.now()
        };
        
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }
        
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE post
router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;