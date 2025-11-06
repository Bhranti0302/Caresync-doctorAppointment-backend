export const createBaseController = (Model, populateOptions = []) => ({
  getAll: async (req, res) => {
    try {
      let query = Model.find();
      populateOptions.forEach((opt) => (query = query.populate(opt)));
      const data = await query;
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      let query = Model.findById(req.params.id);
      populateOptions.forEach((opt) => (query = query.populate(opt)));
      const data = await query;
      if (!data) return res.status(404).json({ message: "Not found" });
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateById: async (req, res) => {
    try {
      const updateData = { ...req.body };

      // Handle uploaded image
      if (req.file) {
        updateData.image = `/uploads/${req.file.filename}`;
      }

      // Handle nested address from form-data (like address[line1])
      if (req.body["address[line1]"] || req.body["address[line2]"]) {
        updateData.address = {
          line1: req.body["address[line1]"] || "",
          line2: req.body["address[line2]"] || "",
        };
      }

      // Prevent password from being overwritten accidentally
      if (updateData.password) {
        delete updateData.password;
      }

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
