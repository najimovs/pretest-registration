import express from 'express';
import Registration from '../models/Registration.js';

const router = express.Router();

// Create new registration
router.post('/register', async (req, res) => {
  try {
    const { user, schedule } = req.body;

    // Debug logging
    console.log('Received registration request:', { user: user.firstName, schedule });

    const registration = new Registration({
      user,
      schedule: schedule || {
        date: null,
        time: null
      },
      status: schedule && schedule.date ? 'scheduled' : 'pending'
    });

    await registration.save();

    // Debug: Log what was actually saved
    console.log('Saved registration with schedule:', registration.schedule);

    res.status(201).json({
      success: true,
      message: 'Registration created successfully',
      data: {
        user: {
          id: registration._id,
          firstName: registration.user.firstName,
          lastName: registration.user.lastName,
          phone: registration.user.phone,
          email: registration.user.email
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create registration',
      error: error.message
    });
  }
});

// Get all registrations (for admin)
router.get('/all', async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        registrations,
        count: registrations.length
      }
    });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations',
      error: error.message
    });
  }
});

// Update registration status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const registration = await Registration.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: registration
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
});

// Delete registration
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await Registration.findByIdAndDelete(id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.json({
      success: true,
      message: 'Registration deleted successfully'
    });
  } catch (error) {
    console.error('Delete registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete registration',
      error: error.message
    });
  }
});

export default router;