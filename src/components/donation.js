import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/donation.css";
import Modal from 'react-modal'; 
require('dotenv').config();
const axios = require('axios');
// forcing a vercel update inside of here 

function Donation() {
  const [donation, setDonation] = useState("");
  const [type, setType] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false); 

  function onDonationChange(event) {
    if(!isNaN(Number(event.target.value)))
      setDonation(event.target.value);
    else
      event.target.value = event.target.value.slice(0,-1);
  }

  function customDonation(e) {
    e.preventDefault();
    checkout(parseFloat(donation).toFixed(2));
  }

  function checkout(donationAmount) {
    openModal(); 
    // console.log(donationAmount);
    // console.log(type);
    console.log(process.env.REACT_APP_STRIPE_KEY); 
    var stripe = window.Stripe(process.env.REACT_APP_STRIPE_KEY);

    const req = {
      amount: donationAmount*100,
      success_url: "https://handstogether-sa.org/thank_you",
      cancel_url: "https://handstogether-sa.org/",
      type: "donation",
      mode: type
    }

    axios.post('https://db.handstogether-sa.org/stripe/create-checkout-session/', req)
      .then(session => {
        // console.log(session.data.id);
        stripe.redirectToCheckout({sessionId: session.data.id})
      })
      .catch(error => console.log(error))
  }

  function openModal() { 
    setModalIsOpen(true); 
  } 

  function closeModal(){
      setModalIsOpen(false);
  }

  const customModalStyles = { 
    content : { 
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        marginRight           : '-50%',
        width                 : '50%',
        transform             : 'translate(-50%, -50%)',
        backgroundColor       : 'transparent',
        border                : 'none'
    } 
  };

  return (
    <div id="shop-wrapper">
      <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Checkout Delivery Address Modal"
          style={customModalStyles}
      >
        <div className="row">
          <div className="col-12" align="center">
            <div class="spinner-border text-warning" role="status">
              <span class="sr-only">Loading...</span>
            </div>
          </div>
        </div>
      </Modal>
      <div className="container-fluid p-0">
        <div className="row no-gutters">
          <h1 className="heading">Your Donation Matters</h1>

          <h3 className="donation-text">
            Your gift to Hands Together allows us to provide greater resources to the advanced early childhood education for the children of our working families in the center of Santa Ana and surrounding areas.
          </h3>

          <div className="donation-container">
            <div className="row no-gutters donation-row justify-content-center">
              <div className="col-12 col-sm-6 col-lg-4">
                <div className="donation-padding">
                  <div className="donation-box donation-button-animation" onClick={() => checkout(10)}>
                    <h1 className="donation-amount-text">$10</h1>
                    <p className="donation-use-text">will provide in-classroom cooking experiences for the children</p>
                  </div>
              </div>
              </div>
              <div className="col-12 col-sm-6 col-lg-4">
                <div className="donation-padding">
                  <div className="donation-box donation-button-animation" onClick={() => checkout(50)}>
                    <h1 className="donation-amount-text">$50</h1>
                    <p className="donation-use-text">will provide take-home book bags for the children</p>
                  </div>
                </div>
              </div>
              <div className="col-12 col-sm-6 col-lg-4">
                <div className="donation-padding">
                  <div className="donation-box donation-button-animation" onClick={() => checkout(100)}>
                    <h1 className="donation-amount-text">$100</h1>
                    <p className="donation-use-text">will provide classroom supplies, including indoor art materials, books, science experiment materials, writing aids, etc.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="row no-gutters donation-row">
              <div className="col-sm-12 col-md-6">
                <div className="donation-padding">
                  <div className="donation-box donation-button-animation" onClick={() => checkout(250)}>
                    <h1 className="donation-amount-text">$250</h1>
                    <p className="donation-use-text">will provide outdoor play equipment for the children, including hula hoops, various sports balls, tricycles, wagons, rocking toys, outdoor art materials, etc.</p>
                  </div>
                </div>
              </div>
              <div className="col-sm-12 col-md-6">
                <div className="donation-padding">
                  <div className="donation-box donation-button-animation" onClick={() => checkout(500)}>
                    <h1 className="donation-amount-text">$500</h1>
                    <p className="donation-use-text">will provide tuition assistance for a struggling family</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form className="donation-container" method="" action="" onSubmit={customDonation}>
            <div className="row no-gutters form-item">
              <div className="col-12 col-sm-6 col-md-6">
                <h3 className="form-text">Give a custom amount</h3>
              </div>
              <div className="col-12 col-sm-6 col-md-6">
                <input type="text" onChange={onDonationChange} required/>
                <p className="form-option">Custom Amount (formatting: xx.xx)</p>
              </div>
            </div>
            <div className="row no-gutters form-item">
              <div className="col-12 col-sm-7 col-md-6">
                <h3 className="form-text">What type of donation are you making?</h3>
              </div>
              <div className="col-12 col-sm-5 col-md-6">
                <input type="radio" id="one-time" name="donation-type" value="one-time" onClick={() => setType("one-time")} required/>
                <label for="one-time"><p className="form-option">One-time Donation</p></label><br/>
                <input type="radio" id="recurring" name="donation-type" value="recurring" onClick={() => setType("recurring")} required/>
                <label for="recurring"><p className="form-option">Recurring Donation</p></label>
              </div>
            </div>
            <div className="text-center">
              <button className="donate-button" type="submit">Donate</button>
            </div>

          </form>


        </div>
      </div>
    </div> 
  );
}
  
export default Donation;
