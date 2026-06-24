const Admin = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


// REGISTER
// exports.register = async (req, res) => {
//   try {
//     const { name, email, password, role, permissions } = req.body;

//     const existingUser = await Admin.findOne({ email });

//     if (existingUser) {
//       return res.status(400).json({
//         message: 'User already exists'
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await Admin.create({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//       permissions
//     });

//     res.status(201).json({
//       message: 'Register Success',
//       user
//     });

//   } catch (error) {
//     res.status(500).json({
//       message: error.message
//     });
//   }
// };
exports.register = async (req, res) => {
   console.log(req.user);

  try {

    const {
      name,
      email,
      password,
      role,
      contactNumber,
      address,
      location, branchId
    } = req.body;

    const existingUser =
      await Admin.findOne({ email });

    if (existingUser) {

      return res.status(400).json({
        message: 'Email already exists'
      });

    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const userData = {

      name,

      email,

      password: hashedPassword,

      role,

      contactNumber,

      address,

      location,

      permissions: []

    };

    // SUB_BRANCH create chesthe
    if (role === 'SUB_BRANCH') {

      // userData.branchId = req.user.id;

      userData.status = 'INACTIVE';

    }

    const user =
      await Admin.create(userData);

    res.status(201).json({

      message: `${role} Created Successfully`,

      user

    });

  }

  catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Admin.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const checkPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!checkPassword) {
      return res.status(400).json({
        message: 'Invalid password'
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d'
      }
    );

    res.status(200).json({
      message: 'Login Success',
      token,
      role: user.role,
      permissions: user.permissions
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getAllSubBranches = async (req, res) => {

  try {

    const subBranches =
      await Admin.find({

        role: 'SUB_BRANCH',

        isActive: true

      });

    res.status(200).json({

      success: true,

      data: subBranches

    });

  }

  catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};

exports.updateSubBranch = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      name,
      email,
      password,
      contactNumber,
      address,
      location,
      status
    } = req.body;

    const updateData = {

      name,
      email,
      contactNumber,
      address,
      location,
      status

    };

    // Password update optional

    if (password) {

      updateData.password =
        await bcrypt.hash(password, 10);

    }

    const user =
      await Admin.findByIdAndUpdate(

        id,

        updateData,

        {
          new: true,
          runValidators: true
        }

      );

    if (!user) {

      return res.status(404).json({

        message: 'Sub Branch Not Found'

      });

    }

    res.status(200).json({

      message:
        'Sub Branch Updated Successfully',

      user

    });

  }

  catch (error) {

    res.status(500).json({

      message: error.message

    });

  }

};
exports.getSubBranchById = async (req, res) => {

  try {

    const { id } = req.params;

    const subBranch =
      await Admin.findOne({

        _id: id,

        role: 'SUB_BRANCH'

      }).select('-password');

    if (!subBranch) {

      return res.status(404).json({

        message: 'Sub Branch Not Found'

      });

    }

    res.status(200).json({

      success: true,

      data: subBranch

    });

  }

  catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};

exports.deleteSubBranch = async (req, res) => {

  try {

    const { id } = req.params;

    const subBranch =
      await Admin.findOneAndUpdate(

        {
          _id: id,
          role: 'SUB_BRANCH'
        },

        {
          isActive: false
        },

        {
          new: true
        }

      );

    if (!subBranch) {

      return res.status(404).json({

        success: false,

        message: 'Sub Branch Not Found'

      });

    }

    res.status(200).json({

      success: true,

      message: 'Sub Branch Deleted Successfully'

    });

  }

  catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};

exports.updateSubBranchStatus = async (req, res) => {

  try {

    const { id } = req.params;

    const { status } = req.body;

    const subBranch =
      await Admin.findByIdAndUpdate(

        id,

        {
          status
        },

        {
          new: true
        }

      );

    if (!subBranch) {

      return res.status(404).json({

        message: 'Sub Branch Not Found'

      });

    }

    res.status(200).json({

      success: true,

      message: 'Status Updated Successfully',

      data: subBranch

    });

  }

  catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};


// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Admin.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'Email not found'
      });
    }

    const resetToken = crypto
      .randomBytes(32)
      .toString('hex');

    user.resetToken = resetToken;

    user.resetTokenExpire =
      Date.now() + 10 * 60 * 1000;

    await user.save();

    res.status(200).json({
      message: 'Reset token generated',
      resetToken
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await Admin.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired token'
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    res.status(200).json({
      message: 'Password reset successful'
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};