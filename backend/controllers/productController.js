const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

const getAllProducts = async (req, res) => {
  try {
    const { search, category, sortBy = 'createdAt', order = 'desc' } = req.query;
    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Sort options
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortOrder };

    const products = await Product.find(query)
      .sort(sortOptions)
      .populate('createdBy', 'username')
      .lean();

    // Get low stock products
    const lowStockProducts = products.filter(product => 
      product.quantity <= product.lowStockThreshold
    );

    res.json({
      products,
      lowStockCount: lowStockProducts.length,
      lowStockProducts
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'username');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error while fetching product' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, quantity, sku, lowStockThreshold } = req.body;
    
    // Validate required fields
    if (!name || !category || !price || !quantity || !sku) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product with this SKU already exists' });
    }

    const productData = {
      name: name.trim(),
      description: description?.trim() || '',
      category,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      sku: sku.trim(),
      lowStockThreshold: parseInt(lowStockThreshold) || 5,
      createdBy: req.user.id
    };

    // Validate numeric fields
    if (productData.price < 0 || productData.quantity < 0) {
      return res.status(400).json({ message: 'Price and quantity must be non-negative' });
    }

    // Handle image upload
    if (req.file) {
      productData.image = `/uploads/${req.file.filename}`;
    }

    const product = await Product.create(productData);
    const populatedProduct = await Product.findById(product._id)
      .populate('createdBy', 'username');

    res.status(201).json({
      message: 'Product created successfully',
      product: populatedProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    // Clean up uploaded file if product creation fails
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.status(500).json({ message: 'Server error while creating product' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, description, category, price, quantity, sku, lowStockThreshold } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if SKU already exists (excluding current product)
    if (sku && sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku, _id: { $ne: req.params.id } });
      if (existingProduct) {
        return res.status(400).json({ message: 'Product with this SKU already exists' });
      }
    }

    const updateData = {
      name: name?.trim() || product.name,
      description: description?.trim() ?? product.description,
      category: category || product.category,
      price: price ? parseFloat(price) : product.price,
      quantity: quantity !== undefined ? parseInt(quantity) : product.quantity,
      sku: sku?.trim() || product.sku,
      lowStockThreshold: lowStockThreshold !== undefined ? parseInt(lowStockThreshold) : product.lowStockThreshold
    };

    // Validate numeric fields
    if (updateData.price < 0 || updateData.quantity < 0) {
      return res.status(400).json({ message: 'Price and quantity must be non-negative' });
    }

    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (product.image) {
        const oldImagePath = path.join(__dirname, '..', product.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username');

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error while updating product' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete associated image
    if (product.image) {
      const imagePath = path.join(__dirname, '..', product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const [totalProducts, lowStockProducts, categories, totalValue] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({
        $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
      }),
      Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Product.aggregate([
        { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$quantity'] } } } }
      ])
    ]);

    res.json({
      totalProducts,
      lowStockProducts,
      categories,
      totalValue: totalValue[0]?.total || 0
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard stats' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getDashboardStats
};