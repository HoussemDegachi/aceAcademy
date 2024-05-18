import { Schema, Types, model } from "mongoose";
import bcrypt from "bcrypt";

const historyCoursesSchema = new Schema(
  {
    chapter: { type: Types.ObjectId, ref: "Chapter" },
    duration: {
      type: Number,
      default: 5400
    },
    actualDuration: {
      type: Number,
      default: 0,
    },
    xp: Number,
    exercises: [{ type: Types.ObjectId, ref: "Exercise" }],
  },
  {
    timestamps: true,
  }
);

const userSchema = new Schema(
  {
    userName: String,
    email: {
      type: String,
      unique: [true, "Email address is already used"]
    },
    role : {
      type: String,
      enum: ["Student", "Manager", "Admin"],
      default: "Student"
    },
    password: String,
    history: {
      exercises: [{ type: Types.ObjectId, ref: "Exercise" }],
      courses: [historyCoursesSchema],
    },
    class: { type: Types.ObjectId, ref: "Class" },
    xp: {
      type: Number,
      min: 0,
      default: 0
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.statics.findAndValidate = async function (email, password) {
  try {
    console.log(email)
    const user = await this.findOne({ email })
    console.log(user)
    if (await bcrypt.compare(password, user.password)) return user
    return false
  } catch (err) {
    console.log(err)
    return false
  }
}

export default model("User", userSchema);
