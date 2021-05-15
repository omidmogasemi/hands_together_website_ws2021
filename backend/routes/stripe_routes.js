const { response } = require('express');
var express = require('express');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const nodemailer = require("nodemailer");
const tokenAuth = require('../jwtAuth');

var router = express.Router();
require('dotenv').config();

const Bottleneck = require('bottleneck');

const limiter = new Bottleneck({
  maxConcurrent: 10,
  minTime: 100
});

limiter.schedule(() => {
  router.route('/create-checkout-session').post(async (req, res) => {
    let amount = req.body.amount;
    let tax = (req.body.type == "purchase") ? (['txr_1IRmOEDACjkjrvMmvkTvvmYZ']) : [];
    let success_url = req.body.success_url;
    let line_items = [];

    let recurring = (req.body.mode == "recurring") ? true : false;

    // All cart items with only ids and quanities
    let cart_items = { cart: [] }

    // load cart items if transaction is a purchase 
    if(req.body.type == "purchase") {
      for(let i = 0;i<req.body.cart["cart"].length;i++) {
        let cart_item = JSON.parse(req.body.cart["cart"][i])
        newItem = {
          price_data: {
            currency: 'usd',
            product_data: {
              name: cart_item.name,
              images: cart_item.images,
            },
            unit_amount: cart_item.price,
          },
          quantity: 1, // update once merge with Edward Branch
          tax_rates: tax,
        }
        line_items.push(newItem);

        cart_items.cart.push({
          id: cart_item._id,
          quantity: cart_item.quantity
        });

      }
    }

    // load donation amount if transaction is donation
    if(req.body.type == "donation") {
      newItem = {
        price_data: {
          currency: 'usd',
          recurring: (!recurring) ? {} : {
            interval: "month"
          },
          product_data: {
            name: 'Donation',
            // images: [req.body.donate_image],
          },
          unit_amount: amount,
        },
        quantity: 1,
      }
      line_items.push(newItem)
    }
    
    console.log("Creating Session")
      const session = await stripe.checkout.sessions.create({
          mode: recurring ? 'subscription' : 'payment',
          billing_address_collection: 'required',
          shipping_address_collection: (req.body.type == "donation") ? {} : {
            allowed_countries: ['US'],
          },
          payment_method_types: ['card'], // list of payment methods
          line_items: line_items,
          metadata: {'type': req.body.type, 'cart': JSON.stringify(cart_items)},
          success_url: success_url,
          cancel_url: req.body.cancel_url,
        });

        console.log("Done Creating Session")

        res.json({ id: session.id });
  });
})

/* Successful Checkout Event Handler */
// transporter for node mailer
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dummyemailclht', // dummy email credentials
    pass: 'dummypass'
  }
});

router.post('/cancel_order', tokenAuth, (req,res) => {
  let customer_email = "dummyemailclht@gmail.com"; //sending cancelation email to dummy email for now
  let email_body = "<h1>Order Canceled</h1> <br /> <p> Your order was sucessfully canceled! </p>";

  const mail_options = {
    from: `"Hands Together Test" <ht@shop.io>`,
    to: customer_email,
    subject: "Order Cancellation",
    html: email_body, 
  }
  transporter.sendMail(mail_options, function(error, info) {
    if(error) {
      return res.status(400).json(error);
    } else {
      return res.status(200).json('Cancellation Email Sent: ' + info.response);
    }
  });
});



async function fulfillOrder(session) {
  let id = session.metadata['id']; 
  let cart = JSON.parse(session.metadata['cart'])['cart'];
  console.log(cart)
  console.log("Fulfilling order")

  // update datebase on successful purchase (delete from items and add to sold_items)
  const cart_items = []
  console.log("cart length", cart.length)
  for(let i = 0;i<cart.length;i++) {
    console.log("current cart item", cart[i]); 
    let cart_item = await updateDB(cart[i], session);
    console.log(cart_item);
    cart_items.push(cart_item);
  }

  console.log("Cart Items Out:" + JSON.stringify(cart_items));

  // node mailer implementation begins here
  let customer_email = session.customer_details['email']; 
  let customer_name = session.shipping.name;
  let address_line_one = session.shipping.address.line1;
  let rest_address = session.shipping.address.city + ", " + session.shipping.address.state + ", " + session.shipping.address.postal_code;
  let total = session.amount_total/100;
  let ordered_items = "";

  for(let i = 0;i<cart_items.length;i++) {
    ordered_items = ordered_items + cart_items[i].name + " (quantity: " + cart_items[i].quantity + "), ";
  }
  ordered_items = ordered_items.slice(0, -2);

  let email_body = `
  <img src="cid:htlogo" style="display:block;margin-left:auto;margin-right:auto;"/> 
  <h1 style="text-align:center;margin-top:1.625rem;">Thank you!</h1>

  <div>
    <p> <strong>Hi ${customer_name}, </strong> <br/>Thank you so much for your purchase. As soon as your package is shipped, you’ll receive a shipping confirmation email from us. </p>
  </div>

  <div>
      <p> <strong>Delivery Address</strong> <br/>${customer_name} <br/>${address_line_one}<br/>${rest_address}</p>
  </div>

  <div>
      <p> <strong>Order Info</strong> <br/><strong>Transaction #:</strong> ${id}<br/><strong>Items Ordered:</strong> ${ordered_items}<br/><strong>Total:</strong> $${total.toFixed(2)}</p>
  </div>
  `; 

  const mail_options = {
    from: `"Hands Together Test" <test@test.io>`,
    to: customer_email,
    subject: "Thanks for your order",
    html: email_body, 
    attachments: [
      {
        filename: 'ht_logo.png',
        path: __dirname + '/../../src/images/ht_logo.png',
        cid: 'htlogo'
      },
    ]
  }

  transporter.sendMail(mail_options, function(error, info) {
    if(error) {
      console.log(error);
    } else {
      console.log('Order Email Sent: ' + info.response);
    }
  });
}

async function updateDB(cart_item, session) {
    console.log("in updateDB", cart_item); 
    let item_id = cart_item.id;
    let test_item = {}; 
    await axios.get("http://localhost:5000/items/get_item/" + item_id)
      .then(item => {
        console.log("Got Item");
      
        test_item.name = item.data.name;
        test_item.quantity = cart_item.quantity;

        console.log(test_item);
        
        if(item.data.quantity == cart_item.quantity) {
          axios.delete('http://localhost:5000/items/delete_item/' + item_id)
          .then(item => {
            console.log("Deleted Item")
            console.log(item.data)
            item.data['transaction_id'] = id;
            item.data['shipping_address'] = session.shipping.address;
            item.data['quantity'] = cart_item.quantity;

            axios.post('http://localhost:5000/sold_items/add_item', item.data)
             .then(res => console.log(res.data))

            // Delete all the images associated with the item
            for (let j = 0; j < item.data.images.length; j++) {
              let key = {
                data: {
                  Key: item.data.name.replace(/[^a-zA-Z0-9]/g, "") + "_" + j
                }
              }
              axios.delete('http://localhost:5000/items/delete_image/', key)
                .then(() => console.log("--Image deleted--"))
            }
          })
          .catch(error => errorEmail(id))
        }
        else {
          let updated_data = {
            name: item.data.name,
            date_added: item.data.date_added,
            price: item.data.price,
            images: item.data.images,
            description: item.data.description,
            quantity: item.data.quantity - cart_item.quantity,
          };
          axios.post('http://localhost:5000/items/update_item/' + item_id, updated_data)
          .then(() => {
            updated_data = {
              name: item.data.name,
              date_added: item.data.date_added,
              price: item.data.price,
              images: item.data.images,
              transaction_id: session.metadata.id,
              shipping_address: session.shipping.address,
              description: item.data.description,
              quantity: cart_item.quantity,
            };

            axios.post('http://localhost:5000/sold_items/add_item', updated_data)
             .then(res => { 
              console.log("res.data log", res.data);
             })
              .catch(error => errorEmail(session.metadata.id))
          })
           .catch(error => errorEmail(session.metadata.id))
        }
     })
     console.log("return test_item", test_item); 
     return test_item;
}

async function errorEmail(id) {
  let ht_email = "dummyemailclht@gmail.com"; // update with an email from hands together later
  let email_body = `
  <img src="cid:htlogo" style="display:block;margin-left:auto;margin-right:auto;"/> 
  <h1> Order Processing Error </h1>
  <p> An error seems to have occured while processing a recent order. Please review the following order to resolve the issue. <p>

  <p> <strong> Transaction ID: </strong> ${id} </p>
  `;

  const mail_options = {
    from: `"Hands Together Test" <test@test.io>`,
    to: ht_email,
    subject: "Hands Together Shop Order Processing Error",
    html: email_body, 
    attachments: [
      {
        filename: 'ht_logo.png',
        path: __dirname + '/../../src/images/ht_logo.png',
        cid: 'htlogo'
      },
    ]
  }

  transporter.sendMail(mail_options, function(error, info) {
    if(error) {
      console.log(error);
    } else {
      console.log('Error Email Sent: ' + info.response);
    }
  });
}

async function fulfillDonate(session) {
  // node mailer implementation begins here
  let id = session.metadata['id']; 
  let customer_email = session.customer_details['email']; 
  let total = session.amount_total/100;

  let customer = await stripe.customers.retrieve(session.customer);
  let customer_name = customer.name;


  let email_body = `
  <img src="cid:htlogo" style="display:block;margin-left:auto;margin-right:auto;"/> 
  <h1 style="text-align:center;margin-top:1.625rem;">Thank you!</h1>

  <div>
    <p> <strong>Hi ${customer_name}, </strong> <br/>Thank you so much for your donation.</p>
  </div>

  <div>
      <p> <strong>Donation Info</strong> <br/><strong>Transaction #:</strong> ${id}<br/><strong>Total:</strong> $${total.toFixed(2)}</p>
  </div>
  `; 

  const mail_options = {
    from: `"Hands Together Test" <test@test.io>`,
    to: customer_email,
    subject: "Thanks for your donation",
    html: email_body, 
    attachments: [
      {
        filename: 'ht_logo.png',
        path: __dirname + '/../../src/images/ht_logo.png',
        cid: 'htlogo'
      },
    ]
  }

  transporter.sendMail(mail_options, function(error, info) {
    if(error) {
      console.log(error);
    } else {
      console.log('Donation Email Sent: ' + info.response);
    }
  });
}

async function fulfillSubscription(session) {
  // node mailer implementation begins here
  let id = session.metadata.id; 
  let customer_email = session.customer_details['email']; 
  let total = session.amount_total/100;

  let customer = await stripe.customers.retrieve(session.customer);
  let customer_name = customer.name;

  let cancellation_url = 'http://localhost:3000/cancel_donation/' + id;

  let email_body = `
  <img src="cid:htlogo" style="display:block;margin-left:auto;margin-right:auto;"/> 
  <h1 style="text-align:center;margin-top:1.625rem;">Thank you!</h1>

  <div>
    <p> <strong>Hi ${customer_name}, </strong> <br/>Thank you so much for your donation.</p>
  </div>
  
  <div>
    <p> If you would like to ever cancel your recurring donation, please navigate to the following URL. </p>
    <p> <strong> Cancellation Link: </strong> ${cancellation_url} </p>
  </div>

  <div>
      <p> <strong>Donation Info</strong> <br/><strong>Subscription #:</strong> ${id}<br/><strong>Total:</strong> $${total.toFixed(2)}</p>
  </div>
  `; 

  const mail_options = {
    from: `"Hands Together Test" <test@test.io>`,
    to: customer_email,
    subject: "Thanks for your donation",
    html: email_body, 
    attachments: [
      {
        filename: 'ht_logo.png',
        path: __dirname + '/../../src/images/ht_logo.png',
        cid: 'htlogo'
      },
    ]
  }

  transporter.sendMail(mail_options, function(error, info) {
    if(error) {
      console.log(error);
    } else {
      console.log('Recurring Donation Email Sent: ' + info.response);
    }
  });
}

// To test webhook in development you must install the Stripe CLI
// https://stripe.com/docs/stripe-cli#install
// Then to forward output to the local route use:
// stripe listen --forward-to localhost:5000/stripe/webhook
router.post('/webhook', (req, res) => {
  const payload = req.rawBody;
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.WEBHOOK_ENDPOINT);
  } catch (err) {
    console.log(`Webhook Error: ${err.message}`)
    return res.status(400).json(`Webhook Error: ${err.message}`);
  }

  // console.log(event.type);
  if(event.type == 'checkout.session.completed') {
    const session = event.data.object;
    // console.log(session.metadata['type']);
    if(session.metadata.type == "purchase") {
      console.log(session);
      session.metadata['id'] = session.payment_intent;
      fulfillOrder(session);
    }
    else if(session.metadata.type == 'donation' && session.mode == 'payment') {
      console.log(session);
      session.metadata['id'] = session.payment_intent;
      fulfillDonate(session);
    }
    else if(session.metadata.type == 'donation' && session.mode == 'subscription') {
      console.log(session);
      session.metadata['id'] = session.subscription;
      fulfillSubscription(session);
    }
  }

  
  res.status(200);
  res.json("Received Request");
});

router.post('/cancel_donate/:id', async (req, res) => {
  let subscription_id = req.params.id;
  // const subscription = await stripe.subscriptions.retrieve(subscription_id);
  const canceled = await stripe.subscriptions.del(subscription_id);
  console.log("Canceled Subscription", canceled)

  // node mailer implementation begins here
  let customer = await stripe.customers.retrieve(canceled.customer);
  let customer_email = customer.email; 
  let customer_name = customer.name;

  let email_body = `
  <img src="cid:htlogo" style="display:block;margin-left:auto;margin-right:auto;"/> 
  <h1 style="text-align:center;margin-top:1.625rem;">Thank you!</h1>

  <div>
    <p> <strong>Hi ${customer_name}, </strong> <br/>your recurring donation has been canceled.</p>
  </div>
  `; 

  const mail_options = {
    from: `"Hands Together Test" <test@test.io>`,
    to: customer_email,
    subject: "Donation Canceled",
    html: email_body, 
    attachments: [
      {
        filename: 'ht_logo.png',
        path: __dirname + '/../../src/images/ht_logo.png',
        cid: 'htlogo'
      },
    ]
  }

  transporter.sendMail(mail_options, function(error, info) {
    if(error) {
      console.log(error);
    } else {
      console.log('Donation Cancellation Email Sent: ' + info.response);
    }
  });

  res.status(200).json("successfully cancelled");
})

module.exports = router;