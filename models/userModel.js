const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add a email"],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minLength: [6, "Password must be up to 6 characters"],
      // maxLength: [23, "Password must not be more then 23 characters"],
    },
    verified: {
      type: Boolean,
      default: false,
      required: true,
    },
    photo: {
      type: String,
      required: [true, "Please add a photo"],
      default: "https://i.ibb.co/4pDNDk1/avatar.png",
    },
    resettoken: {
      type: String,
      required: false,
    },
    resettokenExpiration: {
      type: Date,
      required: false,
    },
    facebookUrl: {
      type: String,
      required: false,
    },
    instagramUrl: {
      type: String,
      required: false,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    table: {
      type: String,
      required: false,
    },
    emailCount: {
      type: Number,
      default: 0,
    },
    lastEmailSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// REMOVED ENCRYPT FROM USER CONTROLER BECAUSE THERE ARE FEW SCENARIOS WHERE WE SHOULD ENCRYPT PASS
// RESET PASSWORD / CHANGE PASSWORD / REGISTER USER....

// ENCRYPT PASSWORD BRFORE SAVING TO DB
userSchema.pre("save", async function (next) {
  // IF THE PASSWORD FIELD IS NOT MODIFIED
  if (!this.isModified("password")) {
    return next();
  }

  // HASH PASSWORD
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});


userSchema.methods.comparePassword = async function (password) {
  const result = await bcrypt.compare(password, this.password);
  return result;
};


const User = mongoose.model("User", userSchema);

module.exports = User;
