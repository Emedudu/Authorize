// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import axios from "axios";

export default async function handler(req, res) {
  const { cid } = req.query;
  const { data } = await axios.get(
    `https://gateway.lighthouse.storage/ipfs/${cid}`
  );
  res.send(data);
}
