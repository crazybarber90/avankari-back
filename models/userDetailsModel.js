const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userDetailsSchema = mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        city: {
            type: String,
            required: [true, "Please add a your current city"],
        },
        currentPlace: {
            type: String,
            required: [true, "Please add a your current place"],
        },

        // photo: {
        //   type: String,
        //   required: [true, "Please add a photo"],
        //   default: "https://i.ibb.co/4pDNDk1/avatar.png",
        // },

        //---------------------- OPTIONAL
        //pol
        pol: {
            type: String,
            trim: true,
        },
        //kosa - boja
        kosa: {
            type: String,
            trim: true,
        },
        //oci - boja
        oci: {
            type: String,
            trim: true,
        },
        //proteza - da/ne
        obuca: {
            type: String,
            trim: true,
        },
        //majica - boja
        gornjideo: {
            type: String,
            trim: true,
        },
        //pantalone - boja
        donjideo: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// REMOVED ENCRYPT FROM USER CONTROLER BECAUSE THERE ARE FEW SCENARIOS WHERE WE SHOULD ENCRYPT PASS
// RESET PASSWORD / CHANGE PASSWORD / REGISTER USER....



const UserDetails = mongoose.model("UserDetails", userDetailsSchema);

module.exports = UserDetails;
