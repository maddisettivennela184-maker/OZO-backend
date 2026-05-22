const mongoose =
require("mongoose");

const contactSchema =
new mongoose.Schema(

  {

    name: {

      type: String,

      required: true,

      trim: true

    },

    email: {

      type: String,

      required: true,

      trim: true,

      lowercase: true

    },

    phone: {

      type: String,

      required: true

    },

    // OPTIONAL

    subject: {

      type: String,

      default: ""

    },

    // OPTIONAL

    message: {

      type: String,

      default: ""

    },

    isRead: {

      type: Boolean,

      default: false

    }

  },

  {

    timestamps: true

  }

);

module.exports =
mongoose.model(

  "Contact",

  contactSchema

);