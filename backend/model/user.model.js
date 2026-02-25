import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    studentId: {
      type: String,
      required: [true, "Student ID is required"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      // match: [/\S+@\S+\.\S+/, "Please use a valid email address"]
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    //useful for meeting scheduling
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    faculty: {
      type: String,
      required: [true, "Faculty is required"],
    },
    // profileImage: {
    //   type: String,
    // },

    //for admin
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    //trust and transparency
    rating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },

    //account status useful for admin to manage users
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

//hash password before saving to database
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//method to compare password during login
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
}


const User = mongoose.model("User", userSchema);

export default User;