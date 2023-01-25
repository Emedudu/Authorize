// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  console.log(req.body[0].args);
  // const event = JSON.parse(req.body);
  // console.log(event[0].args);
}
