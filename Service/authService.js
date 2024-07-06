const User = require("../Model/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const AppError = require("../Utils/appError");

const signToken = id => {
  // We only want to sign the ID of the user cause that's the payload that's gonna differ from a user to a user
  return jwt.sign({ id }, process.env.JWT_SECRET_SALT, {
    expiresIn: "90d", // This env variable is equal to 90d
  });
};

const createToken = user => {
  return signToken(user._id);
};

exports.validateUser = async token => {
  if (!token) throw new AppError("Not Authorized, no token provided", 401);

  if (token.startsWith("Bearer")) token = token.split(" ")[1];

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_SALT
  );

  if (!decoded) throw new AppError("Not Authorized", 401);

  const user = await User.findById(decoded.id);

  if (!user) throw new AppError("Invalid token", 403);

  return user;
};

exports.login = async loginDetails => {
  const user = await User.findOne({ username: loginDetails.username });

  if (!user || !(await user.correctPassword(loginDetails.password)))
    throw new AppError("Incorrect username or password", 401);

  user.token = createToken(user);

  return user;
};

exports.signUp = async signUpDetails => {
  const checkUsername = await User.findOne({
    username: signUpDetails.username,
  });

  if (checkUsername) throw new AppError("This username already exists!", 400);
  if(signUpDetails.photo)
    
  const user = await User.create({
    username: signUpDetails.username,
    password: signUpDetails.password,
    nickname: signUpDetails.nickname,
  });

  user.token = createToken(user);

  return user;
};
