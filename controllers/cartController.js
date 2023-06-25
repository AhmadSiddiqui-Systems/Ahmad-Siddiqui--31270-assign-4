const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

/// ///////// Add To Cart  //////////

const addToCart = async (req, res) => {
  const { userId, items } = req.body;

  if (!userId || !items) {
    return res.json({ message: 'Plz Provide all information required To Add in the Cart!' });
  }

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).send('User not found');
    }

    const cartItems = [];
    let totalPrice = 0;
    const updateOperations = [];

    await Promise.all(
      items.map(async (item) => {
        const { itemId, quantity } = item;

        try {
          const product = await Product.findOne({ _id: itemId });
          if (!product) {
            throw new Error(`Product with ID ${itemId} not found`);
          }

          if (product.stock < quantity) {
            throw new Error(`Insufficient stock for product with ID ${itemId}`);
          }

          const cartItem = {
            item: product._id,
            quantity,
          };

          cartItems.push(cartItem);
          totalPrice += product.price * quantity;

          updateOperations.push({
            updateOne: {
              filter: { _id: itemId },
              update: { $inc: { stock: -quantity } },
            },
          });
        } catch (error) {
          console.error(error);
          throw new Error('Server error');
        }
      }),
    );

    const cart = await Cart.create({
      user: user._id,
      items: cartItems,
      totalPrice,
    });

    await Product.bulkWrite(updateOperations);
    res.json({ message: 'Items Added in the Cart' });
    return cart;
  } catch (err) {
    console.error('Error adding items to cart:', err);
    return res.status(500).send('Internal Server Error');
  }
};

/// ///////// Get Cart  //////////

const getCart = async (req, res) => {
  try {
    const { user } = req;

    const cart = await Cart.findOne({ user: user[0]._id });

    if (!cart) {
      return res.json({ message: 'Your Cart is Empty!' });
    }

    return res.json(cart);
  } catch (err) {
    console.error('Error retrieving cart items:', err);
    return res.status(500).send('Internal Server Error');
  }
};

/// ///////// Update Cart  //////////

const updateCart = async (req, res) => {
  const cartItemId = req.params.id;
  const updatedItem = req.body;

  if (!cartItemId || !updatedItem) {
    return res.json({ message: 'Plz Provide all information required To Update the Cart!' });
  }
  try {
    const existingItem = await Cart.findOne({ _id: cartItemId });
    if (!existingItem) {
      return res.status(404).send('Cart item not found');
    }

    const { itemId, quantity } = updatedItem;

    const product = await Product.findOne({ _id: itemId });
    if (!product) {
      return res.status(404).send('Product not found');
    }
    const existItem = existingItem.items.find((ele) => {
      if (ele.item.toString() === itemId.toString()) {
        return ele.quantity;
      }
      return null;
    });

    const quantityDiff = Number(quantity) - Number(existItem.quantity);
    const index = existingItem.items.indexOf(existItem);

    if (product.stock < quantityDiff) {
      return res.status(400).send('Insufficient stock');
    }

    await Cart.updateOne(
      { _id: existingItem._id },
      {
        $set: {
          totalPrice: existingItem.totalPrice - product.price * -quantityDiff,
          [`items.${index}.item`]: existItem.item,
          [`items.${index}.quantity`]: quantity,
        },
      },
    );

    await Product.updateOne({ _id: itemId }, { $inc: { stock: -quantityDiff } });

    return res.json({ message: 'Cart Updated!' });
  } catch (err) {
    console.error('Error updating item in cart:', err);
    return res.status(500).send('Internal Server Error');
  }
};

/// ///////// Delete Cart  //////////

const deleteCart = async (req, res) => {
  try {
    const cartItemId = req.params.id;

    const existingItem = await Cart.findOne({ _id: cartItemId });
    if (!existingItem) {
      return res.status(404).send('Cart item not found');
    }

    const itemsToUpdate = existingItem.items.map((item) => ({
      itemId: item.item._id,
      quantity: item.quantity,
    }));

    // Delete the cart
    await Cart.deleteOne({ _id: cartItemId });

    // Update the product quantities
    itemsToUpdate.map(async (itemEle) => Product.updateOne(
      { _id: itemEle.itemId },
      { $inc: { stock: itemEle.quantity } },
    ));

    return res.json({ message: 'Cart Deleted!' });
  } catch (err) {
    console.error('Error deleting item from cart:', err);
    return res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  addToCart, getCart, updateCart, deleteCart,
};
