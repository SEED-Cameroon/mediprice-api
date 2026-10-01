import Service from '../models/Service.js';
import Price from '../models/Price.js';
import PriceHistory from "../models/PriceHistory.js";
import { PROVIDER_FIELDS, attachPrices } from "../utils/prices.js";

export async function createService(req, res, next) {
  try {
    const { name, type, category, description } = req.body;

    // Validate required fields
    if (!name || !type || !category || !description) {
      return res.status(400).json({ success: false, data: null, message: 'All fields are required' });
    }

    const newService = await Service.create({
      name,
      type,
      category,
      description
    });

    res.status(201).json({
      success: true,
      data: newService,
      message: 'Service created successfully',
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export async function getServices(req, res, next) {
  try {
    const { q, type, category, page=1, limit=10, description } = req.query;

    const filters = {};

    if (q) filters.name = { $regex: q, $options: "i" };
    if (type) filters.type = { $regex: type, $options: "i" };
    if (category) filters.category = { $regex: category, $options: "i" };
    if (description) filters.description = { $regex: description, $options: "i" };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

    const [services, total] = await Promise.all([
      Service.find(filters)
        .sort("name")
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Service.countDocuments(filters),
    ]);

    // Include prices so list pages can show the lowest price without a request per item.
    const data = await attachPrices("service", services);

    res.status(200).json({
      success: true,
      data,
      message: "Services retrieved successfully",
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }

}

export async function getService(req, res, next) {
  try {
    const service = await Service.findById(req.params.id).lean();
    if (!service) {
      return res.status(404).json({ success: false, data: null, message: 'Service not found' });
    }
    const [data] = await attachPrices("service", [service]);

    res.status(200).json({
      success: true,
      data,
      message: "Services retrieved successfully"
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
  
}

export async function serHistory(req, res, next) {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, data: null, message: 'Service not found' });
    }

    const prices = await Price.find({
        itemType: "service",
        itemId: req.params.id
      })
      .populate("providerId", "name type trustBadge");

    const history = await PriceHistory.find({
      itemId: req.params.id
    });

    res.status(200).json({
      success: true,
      data: { ...service._doc, prices, history },
      message: "Price trend retrieved successfully"
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}




