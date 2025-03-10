import React, { useEffect, useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/shop.css";
import { unstable_renderSubtreeIntoContainer } from 'react-dom';
const axios = require('axios');

function Shop(props) {
  //
  // LOADING ALL ITEMS AND PAGINATION STARTS BELOW 
  //
  const [itemArray, update] = useState({data: []});
  // initialize an empty array using UseState. Next value assignment, use setCurItems
  const [items, setCurItems] = useState([]);
  // intialize an integer that holds the value of the next index after slicing. 
  const [nextIndex, setNextIndex] = useState(0);
  const [curPage, setCurPage] = useState(1);
  const [sortOption, setSortOption] = useState("default");

  // triggered on the "next" button click 
  function next() {
    if (itemArray.data[nextIndex] != undefined) { // there are more items to see 
      //slice the next 12 items in the data array. 
      setCurItems(itemArray.data.slice(nextIndex, nextIndex + 12));
      //set the next index to the first in the next set of 12 objects
      setNextIndex(nextIndex + 12);
      setCurPage(curPage + 1);
    }
  }
  // triggered on the "back" button click 
  function back() {
    if (itemArray.data[nextIndex - 13] != undefined) { // there are previous items to go back to
      setCurItems(itemArray.data.slice(nextIndex - 24, nextIndex - 12));
      setNextIndex(nextIndex - 12);
      setCurPage(curPage - 1);
    }
  }
  function handlePageClick(event) {
    setCurPage(event.target.id);
    setNextIndex(((event.target.id - 1) * 12) + 12);
    setCurItems(itemArray.data.slice((event.target.id - 1) * 12, ((event.target.id - 1) * 12) + 12));
  }

  function check() {
    setCurItems(itemArray.data.slice(0,12));
    setNextIndex(12);
    console.log(items);
  }
  // log whatever item is clicked 
  function clicked(val) {
    console.log(val.name)
  }
  function getFormattedPrice(price) {
    return ("$" + price.slice(0, -2) + "." + price.slice(-2));
  }

  useEffect(()=>{
    axios.get('https://db.handstogether-sa.org/items/get_all_items')
    .then(res => {
      // assign json data to itemArray 
      update({data: res.data});
    })
    .catch (err => {console.log(err)})
  }, []) 

  useEffect(()=>{
    setNextIndex(((curPage - 1) * 12) + 12);
    setCurItems(itemArray.data.slice((curPage - 1) * 12, ((curPage - 1) * 12) + 12));
  }, [itemArray]) 

  // 
  // SORTING METHODS
  //
  function handleSortChange(e) {
    setSortOption(e.target.value);
  }
  useEffect(()=>{
    sortItems();
  }, [sortOption]) 

  function sortItems() {
    let tempItems = itemArray.data;
    if (sortOption == "lowtohigh")
      tempItems.sort(sortLowToHigh);
    else if (sortOption == "hightolow")
      tempItems.sort(sortHighToLow);
    else
      tempItems.sort(sortNewest);
    update({data: tempItems})
  }
  function sortLowToHigh(a, b) {
    if (parseInt(a.price) < parseInt(b.price))
      return -1;
    else if (parseInt(a.price) > parseInt(b.price))
      return 1;
    return 0;
  }
  function sortHighToLow(a, b) {
    if (parseInt(a.price) > parseInt(b.price))
      return -1;
    else if (parseInt(a.price) < parseInt(b.price))
      return 1;
    return 0;
  }
  function sortNewest(a, b) {
    if (a.date_added > b.date_added)
      return -1;
    else if (a.date_added < b.date_added)
      return 1;
    return 0;
  }

  // 
  // CARTING SYSTEM STARTS BELOW 
  //
  const [addToCartText, setAddToCartText] = useState("Add to Cart");

  function quickAddItem(newItem_) {
    // Set cartUpdate so the navbar rerenders
    let cartUpdate = props.cartUpdate;
    cartUpdate++;
    props.setCartUpdate(cartUpdate);

    // Change the "Add to Cart" button text
    setAddToCartText("Item Added");
    setTimeout(() => setAddToCartText("Add to Cart"), 2000);

    // Initialize storageQuota if no items have been added yet
    let storageQuota = window.localStorage.getItem("QUOTA");
    if (!storageQuota) {
      window.localStorage.setItem("QUOTA", 0);
      storageQuota = 0;
    }

    let quantityAvailable = newItem_.quantity; // Max number of items someone can buy
    let newItem = JSON.parse(JSON.stringify(newItem_));
    newItem.quantity = 1; // Quantity that is being added to cart

    // Increment the storage quota for each item added to the storage 
    // Currently allows for 10 unique items, but more than 10 items if they are duplicates 
    if (storageQuota < 10) {
      // Check if the item is already in localStorage
      // Increment quantity if so
      let itemIsInStorage = false;
      for (let i = 0; i < storageQuota; i++) {
        let storageItem = JSON.parse(window.localStorage.getItem("JXYSDFH65F" + i));
        if (newItem._id == storageItem._id) {
          if (storageItem.quantity < quantityAvailable) {
            storageItem.quantity++;
            window.localStorage.setItem("JXYSDFH65F" + i, JSON.stringify(storageItem));
          } else {
            // console.log("Max quantity of that item reached");
          }
          itemIsInStorage = true;
          break;
        }
      }
      // Add a new item if it isn't already in localStorage
      if (!itemIsInStorage) {
        let lsItemId = "JXYSDFH65F" + storageQuota; // generate a unique item ID for the local storage key 
        window.localStorage.setItem(lsItemId, JSON.stringify(newItem));
  
        let new_quota = storageQuota;
        new_quota++;
        window.localStorage.setItem("QUOTA", new_quota);
      }
    } else {
      alert("The cart is limited to 10 unique items.")
      // console.log("Max items in cart reached!");
    }
  }

  return (
    <div>
      {/* 
        LOADING ALL ITEMS AND PAGINATION STARTS BELOW 
      */}

      { /* items is a concatenated array of the current 12 objects, 
        we iterate through all 12 of them and generate a div for each index with a unique link. 
        The button is solely for aesthetic purposes, it is not necesaary for redirection and can be reformatted otherwise  */}

      <div id="shop-wrapper">
        <div className="header">
          <h1>Our Shop</h1>
          <h3>
            Our handcrafted gifts for good are made by the mothers in the Morning Garden Program. The Morning Garden Program provides the highest quality education to the children of working families. Each artisan can express her unique style in the creation of these hand-crafted goods. The embroidery styles are inspired by traditional techniques of various Latin American regions. All items are made of the best quality felt and 100% DMC cotton thread.
            <br/><br/>Proceeds from the sale of these items help our families gain economic stability and improve the emotional and physical lives of their families. 80% of the proceeds of these products are given directly to the artisan. The remaining 20% is used for the purchase of materials.
          </h3>
        </div>

        <div className="legend">
          <p>{
            "Showing " + (12 * (curPage - 1) + 1) + "-" 
            + Math.min((12 * curPage), itemArray.data.length) 
            + " of " + itemArray.data.length + " results"
          }</p>
          <select name="sort" id="sort" value={sortOption} onChange={handleSortChange}>
            <option disabled value="default"> -- Sort -- </option>
            <option value="newest">Newest</option>
            <option value="lowtohigh">Price: Low to High</option>
            <option value="hightolow">Price: High to Low</option>
          </select>
        </div>

        <div className="row">
          { items.length > 0 ?
            items.map((itemIter, index) =>
              <div className="col-sm-6 col-md-4" key={index}>
                <div className="item-container">
                  <a className="wrapper-link" href={`/shop/${itemIter._id}`} onClick={() => clicked(itemIter)}></a>
                  <div className="item-image" style={{backgroundImage: `url(${itemIter.images[0]})`}}></div>
                  <div className="add-to-cart">
                    <a className={`bold ${addToCartText == "Item Added" ? "item-added" : null}`} 
                      onClick={() => quickAddItem(itemIter)}
                    >
                      {addToCartText}
                    </a>
                  </div>
                  <div className="item-info">
                    <div className="name-price">
                      <p className="name bold">{itemIter.name}</p>
                      <p className="price">{getFormattedPrice(itemIter.price)}</p>
                    </div>
                    <p className="caption description">{itemIter.description.length < 100 ? itemIter.description : itemIter.description.slice(0, 100) + "..."}</p>
                  </div>
                </div>
              </div>
            )
            : <h1 align="center">We currently don't have any items listed in our shop - check back soon!</h1> 
          }
        </div>

        <nav aria-label="pages">
          {items.length > 0 ? 
          <button className="back-button" tabIndex="-1" onClick={back}>Back</button>
          :
          <></>
          }
          {(() => {
            // Generate one button for each page
            let pageList = [];
            for (let i = 0; i < Math.ceil(parseFloat(itemArray.data.length) / 12); i++) {
              pageList.push(
                <button 
                  className={"page-num-button " + ((curPage == i + 1) ? "selected-page-button bold" : "")} 
                  key={i} id={i + 1} 
                  onClick={handlePageClick}
                >
                  {i + 1}
                </button>
              )
            }
            return pageList;
          })()}
          {items.length > 0 ? 
          <button className="next-button" tabIndex="-2" onClick={next}>Next</button>
          :
          <></>
          }
        </nav>
      </div>

      {/* <button type="button" onClick={checkContents}>Check Contents</button> */}
    </div>
  );
}

export default Shop;
