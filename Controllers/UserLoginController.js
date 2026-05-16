const User = require("../Models/UserLogin");
const bcrypt = require("bcrypt");
const jwt =require("jsonwebtoken");

const {
  transporter
} = require(
  "../Middleware/mail"
);
/*
REGISTER
*/
exports.Userregister =
  async (req, res) => {
    try {
      const {
        name,
        phone,
        email,
        password
      } = req.body || {};

      if (!phone) {
        return res.status(400).json({
          success: false,
          message:
            "Phone is required"
        });
      }

      if (!password) {
        return res.status(400).json({
          success: false,
          message:
            "Password is required"
        });
      }

      const userExists =
        await User.findOne({
          phone
        });

      if (userExists) {
        return res.status(400).json({
          success: false,
          message:
            "User already exists"
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const user =
        await User.create({
          name,
          phone,
          email,
          password:
            hashedPassword
        });

      res.status(201).json({
        success: true,
        message:
          "Registration successful",
        data: user
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };

  exports.userLogin =
  async (req, res) => {
    try {
      const {
        phone,
        password
      } = req.body || {};

      if (!phone || !password) {
        return res.status(400).json({
          success: false,
          message:
            "Phone and Password are required"
        });
      }

      const user =
        await User.findOne({
          phone
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found"
        });
      }

      const isMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid password"
        });
      }

      const token =
        jwt.sign(
          {
            userId:
              user._id
          },
          "secretKey",
          {
            expiresIn: "7d"
          }
        );

      user.token =
        token;

      await user.save();

      res.status(200).json({
        success: true,
        message:
          "Login successful",
        token,
        user
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };


  // forgot password
  exports.userforgotPassword =
  async (req, res) => {
    try {
      const { email } =
        req.body || {};

      if (!email) {
        return res.status(400).json({
          success: false,
          message:
            "Email is required"
        });
      }

      const user =
        await User.findOne({
          email
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found"
        });
      }

      const otp =
        Math.floor(
          100000 +
          Math.random() * 900000
        ).toString();

      user.OTP = otp;

      user.OTPExpires =
        new Date(
          Date.now() +
          5 * 60 * 1000
        );

      await user.save();

      await transporter.sendMail({
        from:
          "yourgmail@gmail.com",
        to: email,
        subject:
          "Password Reset OTP",
        text:
          `Your OTP is ${otp}`
      });

      res.status(200).json({
        success: true,
        message:
          "OTP sent successfully"
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };


  // verify password

  exports.verifyOTP =
  async (req, res) => {
    try {
      const {
        email,
        otp
      } = req.body || {};

      const user =
        await User.findOne({
          email
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found"
        });
      }

      if (user.OTP !== otp) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid OTP"
        });
      }

      if (
        new Date() >
        user.OTPExpires
      ) {
        return res.status(400).json({
          success: false,
          message:
            "OTP expired"
        });
      }

      res.status(200).json({
        success: true,
        message:
          "OTP verified successfully"
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };

  // Resend OTP
  exports.resendOTP =
  async (req, res) => {
    try {
      const { email } =
        req.body || {};

      const user =
        await User.findOne({
          email
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found"
        });
      }

      const otp =
        Math.floor(
          100000 +
          Math.random() * 900000
        ).toString();

      user.OTP = otp;

      user.OTPExpires =
        new Date(
          Date.now() +
          5 * 60 * 1000
        );

      await user.save();

      await transporter.sendMail({
        from:
          "yourgmail@gmail.com",
        to: email,
        subject:
          "Resend OTP",
        text:
          `Your new OTP is ${otp}`
      });

      res.status(200).json({
        success: true,
        message:
          "OTP resent successfully"
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };
  // Reset Password

  exports.userresetPassword =
  async (req, res) => {
    try {
      const {
        email,
        newPassword
      } = req.body || {};

      const user =
        await User.findOne({
          email
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found"
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          newPassword,
          10
        );

      user.password =
        hashedPassword;

      user.OTP = null;
      user.OTPExpires = null;

      await user.save();

      res.status(200).json({
        success: true,
        message:
          "Password reset successfully"
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  };

  exports.getAllUsers =
async (req, res) => {
  try {

    const users =
      await User.find()
      .sort({
        createdAt: -1
      });

    res.status(200).json({
      success: true,
      count:
        users.length,
      data: users
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message
    });
  }
};

/*
GET USERS COUNT
*/
exports.getUsersCount =
async (req, res) => {
  try {

    const totalUsers =
      await User.countDocuments();

    res.status(200).json({
      success: true,
      totalUsers
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message
    });
  }
};