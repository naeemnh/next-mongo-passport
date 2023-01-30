import { passport } from "@/api-lib/auth";
import { auths } from "@/api-lib/middlewares";
import { ncOpts } from "@/api-lib/nc";
import nc from "next-connect";

const handler = nc(ncOpts);

handler.use(...auths);

handler.get(passport.authenticate("google"), (req, res) => {
  res.redirect("/");
});

export default handler;
