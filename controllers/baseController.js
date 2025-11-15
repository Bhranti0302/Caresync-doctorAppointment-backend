// controllers/baseController.js

export const createBaseController = (Model, populateOptions = []) => ({
  // ---------------------------------
  // GET ALL
  // ---------------------------------
  getAll: async (req, res) => {
    try {
      let query = Model.find();

      // Support population
      populateOptions.forEach((opt) => (query = query.populate(opt)));

      const data = await query;
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // ---------------------------------
  // GET BY ID
  // ---------------------------------
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      let query = Model.findById(id);
      populateOptions.forEach((opt) => (query = query.populate(opt)));

      const doc = await query;

      if (!doc) return res.status(404).json({ message: "Not found" });

      res.status(200).json(doc);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // ---------------------------------
  // UPDATE BY ID
  // ---------------------------------
  updateById: async (req, res) => {
    try {
      const updateData = { ...req.body };

      // Handle image upload (multer)
      if (req.file) {
        updateData.image = `/uploads/${req.file.filename}`;
      }

      // Convert address if form-data sends nested keys
      if (req.body["address[line1]"] || req.body["address[line2]"]) {
        updateData.address = {
          line1: req.body["address[line1]"] || "",
          line2: req.body["address[line2]"] || "",
        };
      }

      // Do not update password here
      if (updateData.password) delete updateData.password;

      const updated = await Model.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updated) return res.status(404).json({ message: "Not found" });

      res.status(200).json({
        message: "Updated successfully",
        data: updated,
      });
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: error.message });
    }
  },

  // ---------------------------------
  // DELETE BY ID
  // ---------------------------------
  deleteById: async (req, res) => {
    try {
      const deleted = await Model.findByIdAndDelete(req.params.id);

      if (!deleted) return res.status(404).json({ message: "Not found" });

      res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
});
