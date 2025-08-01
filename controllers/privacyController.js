// controllers/privacyController.js
import Privacy from "../models/privacy.js";
import User from "../models/user.js";

export const updatePrivacySettings = async (req, res) => {
  try {
    const { publicProfile, anonymousAnalytics } = req.body;

    // Find the user by _id from params
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update or create privacy settings for that user
    const privacy = await Privacy.findOneAndUpdate(
      { user: user._id },
      { $set: { publicProfile, anonymousAnalytics } },
      { new: true, runValidators: true, upsert: true } // upsert creates if not exists
    );

    res.status(200).json({
      publicProfile: privacy.publicProfile,
      anonymousAnalytics: privacy.anonymousAnalytics
    });
  } catch (error) {
    console.error("Error updating privacy settings:", error);
    res.status(500).json({ message: "Server error" });
  }
};
;

export const exportUserData = async (req, res) => {
    try {
      // Find user by _id
      const user = await User.findById(req.params.userId).lean();
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Remove sensitive data
      delete user.password;
  
      res.setHeader("Content-Disposition", "attachment; filename=user-data.json");
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify(user, null, 2));
    } catch (error) {
      console.error("Error exporting user data:", error);
      res.status(500).json({ error: "Failed to export data" });
    }
  };
  
  

  export const deleteAccount = async (req, res) => {
    try {
      // Delete user by _id
      const deletedUser = await User.findByIdAndDelete(req.params.userId);
  
      if (!deletedUser) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Also delete related privacy settings
      await Privacy.findOneAndDelete({ user: req.params.userId });
  
      res.json({ message: "Account and privacy settings deleted successfully" });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ error: "Failed to delete account" });
    }
  };
  