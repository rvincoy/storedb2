const { ObjectId } = require("mongodb");
const mongodb = require("../db/connect");

/**
 * POST /sales
 * Body: { productId: string, quantity: number }
 *
 * Creates a sale record and atomically decrements the product's stock.
 * Uses a single findOneAndUpdate with a "stock >= quantity" guard so two
 * simultaneous sales can't both succeed and push stock negative (no manual
 * read-then-write race condition).
 *
 * Assumes a "products" collection with a numeric `stock` field, and a
 * "sales" collection you want sale records written to. Adjust collection
 * names / field names to match your actual schema.
 */
async function createSale(req, res) {
  const { productId, quantity } = req.body;

  if (!productId || !ObjectId.isValid(productId)) {
    return res.status(400).json({ error: "Valid productId is required" });
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ error: "quantity must be a positive integer" });
  }

  const db = mongodb.getDb();
  const products = db.collection("products");
  const sales = db.collection("sales");

  try {
    // Atomic decrement, guarded so it only succeeds if enough stock exists.
    const result = await products.findOneAndUpdate(
      { _id: new ObjectId(productId), stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { returnDocument: "after" },
    );

    if (!result.value) {
      // Either the product doesn't exist, or there wasn't enough stock.
      const product = await products.findOne({ _id: new ObjectId(productId) });
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      return res.status(409).json({
        error: "Insufficient stock",
        available: product.stock,
        requested: quantity,
      });
    }

    const sale = {
      productId: new ObjectId(productId),
      quantity,
      unitPrice: result.value.price ?? null,
      total: result.value.price != null ? result.value.price * quantity : null,
      createdAt: new Date(),
      userId: req.user?.id ?? null, // populated if requireAuth ran first
    };

    const insertResult = await sales.insertOne(sale);

    return res.status(201).json({
      sale: { _id: insertResult.insertedId, ...sale },
      remainingStock: result.value.stock,
    });
  } catch (err) {
    console.error("createSale error:", err);
    return res.status(500).json({ error: "Failed to record sale" });
  }
}

module.exports = { createSale };