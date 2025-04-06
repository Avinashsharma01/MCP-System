const Pickup = require('../models/Pickup');
const User = require('../models/User');

// MCP: Create and assign pickup
exports.createPickup = async (req, res) => {
  const { title, description, address, assignedTo, commission } = req.body;

  try {
    const partner = await User.findById(assignedTo);
    if (!partner || partner.role !== 'PickupPartner') {
      return res.status(404).json({ message: 'Invalid pickup partner' });
    }

    const pickup = new Pickup({
      title,
      description,
      address,
      assignedTo,
      commission
    });

    await pickup.save();
    res.status(201).json({ message: 'Pickup created', pickup });
  } catch (err) {
    res.status(500).json({ message: 'Pickup creation failed', error: err.message });
  }
};

// Pickup Partner: View assigned pickups
exports.getMyPickups = async (req, res) => {
  try {
    const pickups = await Pickup.find({ assignedTo: req.user.id }).sort({ date: -1 });
    res.status(200).json(pickups);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pickups', error: err.message });
  }
};

// Partner: Update pickup status
exports.updatePickupStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const pickup = await Pickup.findById(id);
    if (!pickup) return res.status(404).json({ message: 'Pickup not found' });

    // Only assigned partner can update
    if (pickup.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    pickup.status = status;
    await pickup.save();
    res.status(200).json({ message: 'Status updated', pickup });
  } catch (err) {
    res.status(500).json({ message: 'Error updating pickup', error: err.message });
  }
};

// MCP: Filter pickups
exports.filterPickups = async (req, res) => {
  const { status, partnerId, startDate, endDate } = req.query;

  let filter = {};

  if (status) filter.status = status;
  if (partnerId) filter.assignedTo = partnerId;
  if (startDate && endDate) {
    filter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  try {
    const pickups = await Pickup.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ date: -1 });

    res.status(200).json(pickups);
  } catch (err) {
    res.status(500).json({ message: 'Error filtering pickups', error: err.message });
  }
};
