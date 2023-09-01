const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const verificationTokenSchema = mongoose.Schema(
  {
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        expires: 3600,
        default: Date.now()
    }
  }
);

// ENCRYPT PASSWORD BRFORE SAVING TO DB
verificationTokenSchema.pre("save", async function (next) {
  // IF THE PASSWORD FIELD IS NOT MODIFIED
  if (!this.isModified("token")) {
    return next();
  }

  // HASH PASSWORD
  const salt = await bcrypt.genSalt(10);
  const hashedToken = await bcrypt.hash(this.token, salt);
  this.token = hashedToken;
  next();
});

// verificationTokenSchema.methods.compareToken = async function (password) {
//     const result = await bcrypt.compareSync(password, this.password);
//     return result;
// }

verificationTokenSchema.methods.compareToken = function (otp) {
    const isMatched = bcrypt.compareSync(otp, this.token);
    return isMatched;
}

const VerificationToken = mongoose.model("VerificationToken", verificationTokenSchema);

module.exports = VerificationToken;
