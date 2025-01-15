// // routes / courseCreate.js;
// // server/middleware/auth.js
// import jwt from "jsonwebtoken";
// import prisma from "../utils/prisma.js";

// export const isAuthenticated = async (req, res, next) => {
//   try {
//     console.log("Authorization Header:", req.headers.authorization);
//     const token = req.headers.authorization?.split(" ")[1];

//     console.log("Received Token:", token);

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Please login to access this resource"
//       });
//     }

//     // Rest of the code remains the same
//   } catch (error) {
//     console.error("Full Auth Error:", error);
//     // Rest of the error handling
//   }
// };

// export const authenticateToken = (req, res, next) => {
//   try {
//     // Get the token from Authorization header
//     const authHeader = req.headers["authorization"];
//     const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

//     // Check if token exists
//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Aucun token d'authentification fourni"
//       });
//     }

//     // Verify token
//     jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//       // Token validation
//       if (err) {
//         console.error("Token Verification Error:", err);

//         if (err.name === "TokenExpiredError") {
//           return res.status(401).json({
//             success: false,
//             message: "Le token a expiré. Veuillez vous reconnecter.",
//             error: "TOKEN_EXPIRED"
//           });
//         }

//         return res.status(403).json({
//           success: false,
//           message: "Token invalide",
//           error: "INVALID_TOKEN"
//         });
//       }

//       // Attach user information to request
//       req.user = user;
//       next();
//     });
//   } catch (error) {
//     console.error("Authentication Middleware Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Erreur d'authentification interne",
//       error: error.message
//     });
//   }
// };

// export const authorizeRoles = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({
//         success: false,
//         message: "Vous n'avez pas les autorisations nécessaires"
//       });
//     }
//     next();
//   };
// };

// export const isAdmin = (req, res, next) => {
//   if (req.user && req.user.role === "admin") {
//     next();
//   } else {
//     res.status(403).json({
//       success: false,
//       message: "Access denied. Admin rights required."
//     });
//   }
// };

// middleware/auth.js
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

export const isAuthenticated = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(403)
      .json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: "User not found" });
    }
    req.user = user; // Attach user to request
    console.log("User role:", req.user.role); // Log the user role
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(403).json({ success: false, message: "Invalid token" });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    next();
  };
};
