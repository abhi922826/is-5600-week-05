const cuid = require('cuid');
const db = require('./db');

const Order = db.model('Order', {
  _id: { type: String, default: cuid },
  buyerEmail: { type: String, required: true },
  products: [{
    type: String,
    ref: 'Product', // Reference to Product model
    index: true,
    required: true
  }],
  status: {
    type: String,
    index: true,
    default: 'CREATED',
    enum: ['CREATED', 'PENDING', 'COMPLETED']
  }
});

/**
 * List all orders with optional filters
 * @param {object} options 
 * @returns {Promise<Array>}
 */
async function list(options = {}) {
  const { offset = 0, limit = 25, productId, status } = options;

  const productQuery = productId ? { products: productId } : {};
  const statusQuery = status ? { status } : {};
  const query = { ...productQuery, ...statusQuery };

  const orders = await Order.find(query)
    .sort({ _id: 1 })
    .skip(offset)
    .limit(limit)
    .populate('products'); // Fetch product details

  return orders;
}

/**
 * Get a single order by ID
 * @param {string} _id 
 * @returns {Promise<object>}
 */
async function get(_id) {
  const order = await Order.findById(_id).populate('products').exec();
  return order;
}

/**
 * Create a new order
 * @param {object} fields 
 * @returns {Promise<object>}
 */
async function create(fields) {
  const order = await new Order(fields).save();
  await order.populate('products'); // Populate products in response
  return order;
}

/**
 * Update an existing order by ID
 * @param {string} _id 
 * @param {object} changes 
 * @returns {Promise<object>}
*/
async function edit(_id, changes) {
  const order = await get(_id);
  if (!order) throw new Error('Order not found');

  Object.keys(changes).forEach(key => {
    order[key] = changes[key];
  });

  await order.save();
  return order;
}



/**
 * Delete an existing order by ID
 * @param {string} _id 
 * @returns {Promise<void>}
*/
async function destroy(_id) {
  await Order.deleteOne({ _id });
}


module.exports = {
  create,
  get,
  list,
  edit,
  destroy,
};