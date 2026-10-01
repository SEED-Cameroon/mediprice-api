import Medication from "../models/Medication.js"; 
import Price from "../models/Price.js";
import PriceHistory from "../models/PriceHistory.js";
import { PROVIDER_FIELDS, attachPrices } from "../utils/prices.js";

const LIMIT = 10;
const PAGE = 1;
const SORT = "name";

export async function createMedication(req, res, next) {
  try {
    const { name, genericName, category, description, form, requiresPrescription } = req.body;

    // Validate required fields
    if (!name || !category || !description) {
      return res.status(400).json({ success: false, data: null, message: 'Name, category and description are required' });
    }

    const newMedication = await Medication.create({
      name,
      genericName,
      category,
      description,
      form,
      requiresPrescription,
    });

    res.status(201).json({
      success: true,
      data: newMedication,
      message: 'Medication created successfully',
    });

  } catch (error) {
    console.log(error);
    next(error);
  }
}

export async function getMedications(req, res, next) {
  try {
    const { q, genericName,
      category, page=PAGE,
      limit=LIMIT,
      // sort=SORT, priceMin, priceMax,
      description,  } = req.query;

    const filters = {};

    if (q) filters.name = { $regex: q, $options: "i" };;
    if (genericName) filters.genericName = { $regex: genericName, $options: "i" };
    if (category) filters.category = { $regex: category, $options: "i" };
    if (description) filters.description = { $regex: description, $options: "i" };

    const pageNum = Math.max(1, parseInt(page, 10) || PAGE);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || LIMIT));

    const [medications, total] = await Promise.all([
      Medication.find(filters)
        .sort(SORT)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Medication.countDocuments(filters),
    ]);

    // Include prices so list pages can show the lowest price without a request per item.
    const data = await attachPrices("medication", medications);

    res.status(200).json({
      success: true,
      data,
      message: "Medications retrieved successfully",
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

export async function getMedication(req, res, next) {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ success: false, data: null, message: 'Medication not found' });
    }

    const prices = await Price.find({
        itemType: "medication",
        itemId: req.params.id
      })
      .populate("providerId", PROVIDER_FIELDS);

    res.status(200).json({
      success: true,
      data: { ...medication._doc, prices },
      message: "Medications retrieved successfully"
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
  
}

export async function medHistory(req, res, next) {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ success: false, data: null, message: 'Medication not found' });
    }

    const prices = await Price.find({
        itemType: "medication",
        itemId: req.params.id
      })
      .populate("providerId", "name type trustBadge");

    const history = await PriceHistory.find({
      itemId: req.params.id
    });

    res.status(200).json({
      success: true,
      data: { ...medication._doc, prices, history },
      message: "Price trend retrieved successfully"
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}
