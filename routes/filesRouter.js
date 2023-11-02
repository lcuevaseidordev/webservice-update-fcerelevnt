import { Router } from "express";
import fetchGetGrandesEmpresas from "../services/fetch-afip.js";

const fileRoutes = Router();

//Post Method
fileRoutes.post("/submit-lictradnum", async (req, res, next) => {
  //console.log(req.body);
  fetchGetGrandesEmpresas(req.body).then((resFetch) => {
    res.status(200).json({ message: "Object successfully received", data: resFetch});
  })
});

//Get all Method
// fileRoutes.get("/download", async (req, res) => {
//   res.status(200).json({ message: "Endpoint /download" });
// });

export default fileRoutes;
