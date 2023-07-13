const async_error = require("../middleware/catchasyncerror");
const stripe = require("stripe")(
  "sk_test_51N3KZWSFyuLceomLg4SAcTE15CBiLoqZJY6hqgfOABueMMOqJ1TzwSXLccOK25216lHLOaGkTnX0foD54r2Ho4aq00sLMFVWvR"
);

exports.processPayment = async_error(async (req, res, next) => {
  const myPayment = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",
    automatic_payment_methods: {
      enabled: true
    },
    metadata: {
      company: "Ecommerce",
    },
  });

  res
    .status(200)
    .json({ success: true, client_secret: myPayment.client_secret });
});